import { AirportEdge, AirportNode, RouteLeg, RouteSummary, SecurityMode, SimulationState, Terminal } from '../types';

interface CostInputs {
  checkedBag: boolean;
  securityMode: SecurityMode;
  terminal: Terminal;
}

function keyFor(from: string, to: string): string {
  return `${from}->${to}`;
}

export function buildUndirectedEdges(edges: AirportEdge[]): AirportEdge[] {
  const reversed = edges.map((edge) => ({ ...edge, id: `${edge.id}_R`, from: edge.to, to: edge.from }));
  return [...edges, ...reversed];
}

export function computeRoute(
  nodes: AirportNode[],
  edges: AirportEdge[],
  sim: SimulationState,
  startId: string,
  goalId: string,
  inputs: CostInputs,
): RouteSummary | null {
  const allEdges = buildUndirectedEdges(edges);
  const adjacency = new Map<string, AirportEdge[]>();
  allEdges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)?.push(edge);
  });

  const dist = new Map<string, number>();
  const prev = new Map<string, { node: string; edge: AirportEdge }>();
  const visited = new Set<string>();
  nodes.forEach((n) => dist.set(n.id, Infinity));
  dist.set(startId, 0);

  while (visited.size < nodes.length) {
    let current: string | null = null;
    let best = Infinity;
    for (const [id, value] of dist) {
      if (!visited.has(id) && value < best) {
        best = value;
        current = id;
      }
    }
    if (!current || best === Infinity) break;
    if (current === goalId) break;

    visited.add(current);
    const neighbors = adjacency.get(current) ?? [];
    for (const edge of neighbors) {
      const closeKey = edge.id.replace('_R', '');
      if (sim.closedEdges.has(closeKey)) continue;
      const factor = sim.corridorFactors[closeKey] ?? 1;
      const alt = best + edge.baseWalkTimeMinutes * factor;
      if (alt < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, { node: current, edge });
      }
    }
  }

  if (!prev.has(goalId)) return null;

  const nodePath: string[] = [goalId];
  const legs: RouteLeg[] = [];
  let cursor = goalId;
  while (cursor !== startId) {
    const step = prev.get(cursor);
    if (!step) break;
    const normalizedId = step.edge.id.replace('_R', '');
    const factor = sim.corridorFactors[normalizedId] ?? 1;
    legs.unshift({
      edgeId: normalizedId,
      from: step.edge.from,
      to: step.edge.to,
      walkMinutes: step.edge.baseWalkTimeMinutes,
      congestionFactor: factor,
    });
    cursor = step.node;
    nodePath.unshift(cursor);
  }

  const walkMinutes = legs.reduce((sum, leg) => sum + leg.walkMinutes * leg.congestionFactor, 0);
  const waits = computeWaitCost(nodePath, sim, inputs);
  const eta = walkMinutes + waits;
  const confidence: RouteSummary['confidence'] = sim.variability > 0.55 ? 'Low' : sim.variability > 0.3 ? 'Med' : 'High';

  return {
    nodePath,
    legs,
    totalEtaMinutes: round(eta),
    walkMinutes: round(walkMinutes),
    waitsMinutes: round(waits),
    confidence,
  };
}

function computeWaitCost(path: string[], sim: SimulationState, inputs: CostInputs): number {
  let total = 0;
  const hasSecurity = path.some((node) => node.includes('SEC'));
  const hasBag = path.some((node) => node.includes('BAG'));

  if (hasSecurity) {
    total += inputs.securityMode === 'precheck'
      ? sim.securityWait[inputs.terminal].precheck
      : sim.securityWait[inputs.terminal].standard;
  }

  if (inputs.checkedBag && hasBag) {
    total += sim.bagDropWait[inputs.terminal];
  }

  if (path.some((node) => node.includes('CONNECT'))) {
    total += sim.shuttleWait;
  }

  return total;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mapEdgesByKey(edges: AirportEdge[]): Record<string, AirportEdge> {
  return edges.reduce<Record<string, AirportEdge>>((acc, edge) => {
    acc[keyFor(edge.from, edge.to)] = edge;
    acc[keyFor(edge.to, edge.from)] = edge;
    return acc;
  }, {});
}

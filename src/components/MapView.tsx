import { AirportEdge, AirportNode, Incident, RouteSummary, Terminal } from '../types';

interface Props {
  terminal: Terminal;
  nodes: AirportNode[];
  edges: AirportEdge[];
  route: RouteSummary | null;
  corridorFactors: Record<string, number>;
  incidents: Incident[];
  selectedGate: string;
  onGateClick: (gate: string) => void;
  markerProgress: number;
}

export function MapView({ terminal, nodes, edges, route, corridorFactors, incidents, selectedGate, onGateClick, markerProgress }: Props) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const routeEdges = new Set(route?.legs.map((l) => l.edgeId) ?? []);
  const marker = route ? markerPoint(route.nodePath, nodeMap, markerProgress) : null;

  return (
    <section className="mapWrap">
      <div className="mapLegend">
        <span><i className="dot green" /> Low congestion</span>
        <span><i className="dot yellow" /> Moderate</span>
        <span><i className="dot red" /> Heavy</span>
        <span><i className="dot cyan" /> Active route</span>
      </div>
      <svg viewBox="0 0 1024 560" className="mapSvg" role="img" aria-label="Terminal map">
        <rect x="30" y="210" width="960" height="260" rx="28" fill="#0c1f39" opacity="0.45" />
        <text x="60" y="245" className="mapLabel">Terminal {terminal} (Demo Layout)</text>
        {terminal === 'C' ? (
          <>
            <text x="170" y="286" className="mapSublabel">Ticketing</text>
            <text x="365" y="312" className="mapSublabel">Security</text>
            <text x="520" y="240" className="mapSublabel">Concourse</text>
          </>
        ) : (
          <text x="170" y="286" className="mapSublabel">Placeholder layout with simplified routing stubs</text>
        )}

        {edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          const factor = corridorFactors[edge.id] ?? 1;
          const color = factor > 1.8 ? '#f43f5e' : factor > 1.25 ? '#f59e0b' : '#22c55e';
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={routeEdges.has(edge.id) ? '#5eead4' : color}
              strokeWidth={routeEdges.has(edge.id) ? 8 : 4}
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}

        {nodes.map((node) => {
          const isGate = node.kind === 'gate';
          return (
            <g key={node.id} onClick={() => isGate && onGateClick(node.id)} style={{ cursor: isGate ? 'pointer' : 'default' }}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isGate ? 9 : 6}
                fill={node.id === selectedGate ? '#f97316' : node.kind === 'gate' ? '#93c5fd' : '#bfdbfe'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {isGate && <text x={node.x + 8} y={node.y - 8} className="gateLabel">{node.label.replace('Gate ', '')}</text>}
            </g>
          );
        })}

        {incidents.filter((i) => i.edgeId).map((incident) => {
          const edge = edges.find((e) => e.id === incident.edgeId);
          if (!edge) return null;
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          const x = (from.x + to.x) / 2;
          const y = (from.y + to.y) / 2;
          return (
            <g key={incident.id}>
              <circle cx={x} cy={y} r={10} fill="#ef4444" />
              <text x={x - 4} y={y + 4} className="incidentMark">!</text>
            </g>
          );
        })}

        {marker && (
          <g>
            <circle cx={marker.x} cy={marker.y} r={10} fill="#f8fafc" stroke="#0ea5e9" strokeWidth={3} />
            <text x={marker.x + 14} y={marker.y + 4} className="mapSublabel">You are here</text>
          </g>
        )}
      </svg>
    </section>
  );
}

function markerPoint(path: string[], nodeMap: Map<string, AirportNode>, progress: number): { x: number; y: number } | null {
  const points = path.map((id) => nodeMap.get(id)).filter(Boolean) as AirportNode[];
  if (points.length < 2) return null;
  const idx = Math.min(points.length - 2, Math.floor(progress * (points.length - 1)));
  const local = progress * (points.length - 1) - idx;
  const a = points[idx];
  const b = points[idx + 1];
  return {
    x: a.x + (b.x - a.x) * local,
    y: a.y + (b.y - a.y) * local,
  };
}

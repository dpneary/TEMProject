import { AirportEdge, Incident, Scenario, SimulationState, Terminal } from '../types';

const terminals: Terminal[] = ['A', 'B', 'C', 'E'];

type ScenarioConfig = {
  securityBase: number;
  bagBase: number;
  corridorBase: number;
  variability: number;
  spikeChance: number;
  closureChance: number;
  shuttleBase: number;
};

const scenarioConfigs: Record<Scenario, ScenarioConfig> = {
  normal: { securityBase: 14, bagBase: 8, corridorBase: 1, variability: 0.24, spikeChance: 0.08, closureChance: 0.02, shuttleBase: 6 },
  morning_rush: { securityBase: 24, bagBase: 14, corridorBase: 1.3, variability: 0.44, spikeChance: 0.16, closureChance: 0.04, shuttleBase: 8 },
  weather_surge: { securityBase: 27, bagBase: 18, corridorBase: 1.45, variability: 0.58, spikeChance: 0.2, closureChance: 0.06, shuttleBase: 12 },
  construction: { securityBase: 18, bagBase: 10, corridorBase: 1.35, variability: 0.47, spikeChance: 0.18, closureChance: 0.08, shuttleBase: 7 },
  staff_shortage: { securityBase: 26, bagBase: 16, corridorBase: 1.25, variability: 0.52, spikeChance: 0.14, closureChance: 0.07, shuttleBase: 10 },
};

export function createInitialSimulation(edges: AirportEdge[]): SimulationState {
  const corridorFactors = Object.fromEntries(edges.map((e) => [e.id, 1]));

  return {
    timestamp: formatTime(new Date()),
    securityWait: {
      A: { standard: 12, precheck: 6 },
      B: { standard: 14, precheck: 7 },
      C: { standard: 16, precheck: 8 },
      E: { standard: 15, precheck: 7 },
    },
    bagDropWait: { A: 6, B: 7, C: 9, E: 8 },
    corridorFactors,
    closedEdges: new Set<string>(),
    incidents: [],
    eventFeed: [`${formatTime(new Date())} Demo initialized: live telemetry online`],
    trend: { bagDrop: 'flat', security: 'flat', corridor: 'flat', shuttle: 'flat' },
    shuttleWait: 6,
    variability: 0.24,
  };
}

export function tickSimulation(prev: SimulationState, edges: AirportEdge[], scenario: Scenario): SimulationState {
  const config = scenarioConfigs[scenario];
  const next = structuredClone({
    ...prev,
    closedEdges: [...prev.closedEdges],
    incidents: [...prev.incidents],
    eventFeed: [...prev.eventFeed],
  }) as Omit<SimulationState, 'closedEdges'> & { closedEdges: string[] };

  terminals.forEach((terminal) => {
    const standard = boundedRandomWalk(prev.securityWait[terminal].standard, config.securityBase + (terminal === 'C' ? 4 : 0), 5, 45);
    const precheck = boundedRandomWalk(prev.securityWait[terminal].precheck, Math.max(5, standard * 0.45), 3, 25);
    next.securityWait[terminal] = { standard, precheck };

    next.bagDropWait[terminal] = boundedRandomWalk(prev.bagDropWait[terminal], config.bagBase, 3, 30);
  });

  const corridorFactors = { ...prev.corridorFactors };
  for (const edge of edges) {
    const base = boundedRandomWalk(corridorFactors[edge.id] ?? 1, config.corridorBase, 0.22, 0.8, 2.5);
    corridorFactors[edge.id] = maybeSpike(base, config.spikeChance);
  }
  next.corridorFactors = corridorFactors;

  next.shuttleWait = boundedRandomWalk(prev.shuttleWait, config.shuttleBase, 2, 2, 18);

  next.trend = {
    bagDrop: trendDir(prev.bagDropWait.C, next.bagDropWait.C),
    security: trendDir(prev.securityWait.C.standard, next.securityWait.C.standard),
    corridor: trendDir(avg(Object.values(prev.corridorFactors)), avg(Object.values(next.corridorFactors))),
    shuttle: trendDir(prev.shuttleWait, next.shuttleWait),
  };

  next.variability = Math.min(0.9, Math.max(0.2, config.variability + Math.random() * 0.15 - 0.08));

  const updatedIncidents: Incident[] = [];
  const openClosures = new Set<string>();
  for (const incident of prev.incidents) {
    if (incident.durationTicks > 1) {
      const reduced = { ...incident, durationTicks: incident.durationTicks - 1 };
      updatedIncidents.push(reduced);
      if (incident.edgeId) openClosures.add(incident.edgeId);
    }
  }

  if (Math.random() < config.closureChance) {
    const candidate = edges[Math.floor(Math.random() * edges.length)];
    const fresh: Incident = {
      id: crypto.randomUUID(),
      timestamp: formatTime(new Date()),
      message: `${candidate.id}: Security lane closed near ${candidate.from}; rerouting recommended`,
      edgeId: candidate.id,
      severity: 'high',
      durationTicks: 3 + Math.floor(Math.random() * 3),
    };
    updatedIncidents.unshift(fresh);
    openClosures.add(candidate.id);
    next.eventFeed.unshift(`${fresh.timestamp} ${fresh.message}`);
  } else if (Math.random() < config.spikeChance) {
    const message = `${formatTime(new Date())} Crowd surge observed at central concourse`;
    next.eventFeed.unshift(message);
  }

  next.incidents = updatedIncidents.slice(0, 8);
  next.eventFeed = next.eventFeed.slice(0, 16);
  next.closedEdges = Array.from(openClosures);
  next.timestamp = formatTime(new Date());

  return {
    ...next,
    closedEdges: new Set(next.closedEdges),
  };
}

function boundedRandomWalk(current: number, baseline: number, drift: number, min: number, max?: number): number;
function boundedRandomWalk(current: number, baseline: number, drift: number, max: number): number;
function boundedRandomWalk(current: number, baseline: number, drift: number, minOrMax: number, maxArg?: number): number {
  const min = maxArg === undefined ? 0 : minOrMax;
  const max = maxArg === undefined ? minOrMax : maxArg;
  const noise = (Math.random() - 0.5) * drift * 2;
  const toward = (baseline - current) * 0.2;
  const next = current + toward + noise;
  return Math.round(Math.min(max, Math.max(min, next)) * 10) / 10;
}

function maybeSpike(base: number, chance: number): number {
  if (Math.random() > chance) return base;
  return Math.min(2.5, base + 0.4 + Math.random() * 0.8);
}

function trendDir(prev: number, next: number): 'up' | 'down' | 'flat' {
  if (next > prev + 0.3) return 'up';
  if (next < prev - 0.3) return 'down';
  return 'flat';
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

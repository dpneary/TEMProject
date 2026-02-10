export type Terminal = 'A' | 'B' | 'C' | 'E';
export type EntryPoint = 'curbside' | 'garage' | 'rental' | 'rideshare';
export type SecurityMode = 'precheck' | 'standard';
export type Scenario = 'normal' | 'morning_rush' | 'weather_surge' | 'construction' | 'staff_shortage';

export interface AirportNode {
  id: string;
  label: string;
  terminal: Terminal;
  x: number;
  y: number;
  kind: 'entry' | 'ticketing' | 'bagdrop' | 'security' | 'corridor' | 'gate' | 'shuttle';
}

export interface AirportEdge {
  id: string;
  from: string;
  to: string;
  baseWalkTimeMinutes: number;
  capacity: number;
}

export interface Incident {
  id: string;
  timestamp: string;
  message: string;
  edgeId?: string;
  severity: 'low' | 'med' | 'high';
  durationTicks: number;
}

export interface SimulationState {
  timestamp: string;
  securityWait: Record<Terminal, { standard: number; precheck: number }>;
  bagDropWait: Record<Terminal, number>;
  corridorFactors: Record<string, number>;
  closedEdges: Set<string>;
  incidents: Incident[];
  eventFeed: string[];
  trend: {
    bagDrop: 'up' | 'down' | 'flat';
    security: 'up' | 'down' | 'flat';
    corridor: 'up' | 'down' | 'flat';
    shuttle: 'up' | 'down' | 'flat';
  };
  shuttleWait: number;
  variability: number;
}

export interface RouteLeg {
  edgeId: string;
  from: string;
  to: string;
  walkMinutes: number;
  congestionFactor: number;
}

export interface RouteSummary {
  nodePath: string[];
  legs: RouteLeg[];
  totalEtaMinutes: number;
  walkMinutes: number;
  waitsMinutes: number;
  confidence: 'Low' | 'Med' | 'High';
}

export interface TripSetup {
  terminal: Terminal;
  airline: string;
  gate: string;
  entryPoint: EntryPoint;
  securityMode: SecurityMode;
  checkedBag: boolean;
  scenario: Scenario;
}

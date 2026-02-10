import { AirportEdge, AirportNode, EntryPoint, Terminal } from '../types';

export const airlinesByTerminal: Record<Terminal, string[]> = {
  A: ['Delta Shuttle', 'Northeast Air'],
  B: ['United', 'SunJet'],
  C: ['JetBlue', 'Cape Air', 'Coastal Connect'],
  E: ['Lufthansa', 'Global Atlantic'],
};

export const gatesByTerminal: Record<Terminal, string[]> = {
  A: ['A7', 'A12'],
  B: ['B21', 'B29'],
  C: ['C17', 'C19', 'C21', 'C25', 'C27', 'C31', 'C36'],
  E: ['E5', 'E10'],
};

const cNodes: AirportNode[] = [
  { id: 'C_CURB', label: 'Curbside Drop-off', terminal: 'C', x: 70, y: 315, kind: 'entry' },
  { id: 'C_GARAGE', label: 'Parking Garage', terminal: 'C', x: 70, y: 355, kind: 'entry' },
  { id: 'C_RENTAL', label: 'Rental Shuttle', terminal: 'C', x: 70, y: 395, kind: 'entry' },
  { id: 'C_RIDE', label: 'Rideshare', terminal: 'C', x: 70, y: 435, kind: 'entry' },
  { id: 'C_TICK_1', label: 'Ticketing North', terminal: 'C', x: 200, y: 305, kind: 'ticketing' },
  { id: 'C_TICK_2', label: 'Ticketing South', terminal: 'C', x: 200, y: 390, kind: 'ticketing' },
  { id: 'C_BAG_1', label: 'Bag Drop 1', terminal: 'C', x: 280, y: 300, kind: 'bagdrop' },
  { id: 'C_BAG_2', label: 'Bag Drop 2', terminal: 'C', x: 280, y: 395, kind: 'bagdrop' },
  { id: 'C_SEC_STD', label: 'Security Standard', terminal: 'C', x: 390, y: 335, kind: 'security' },
  { id: 'C_SEC_PRE', label: 'Security PreCheck', terminal: 'C', x: 390, y: 385, kind: 'security' },
  { id: 'C_HUB', label: 'Concourse Hub', terminal: 'C', x: 510, y: 360, kind: 'corridor' },
  { id: 'C_SPINE_1', label: 'Concourse C1', terminal: 'C', x: 610, y: 260, kind: 'corridor' },
  { id: 'C_SPINE_2', label: 'Concourse C2', terminal: 'C', x: 685, y: 300, kind: 'corridor' },
  { id: 'C_SPINE_3', label: 'Concourse C3', terminal: 'C', x: 760, y: 345, kind: 'corridor' },
  { id: 'C_SPINE_4', label: 'Concourse C4', terminal: 'C', x: 835, y: 390, kind: 'corridor' },
  { id: 'C_SPINE_5', label: 'Concourse C5', terminal: 'C', x: 905, y: 430, kind: 'corridor' },
  { id: 'C17', label: 'Gate C17', terminal: 'C', x: 630, y: 230, kind: 'gate' },
  { id: 'C19', label: 'Gate C19', terminal: 'C', x: 675, y: 255, kind: 'gate' },
  { id: 'C21', label: 'Gate C21', terminal: 'C', x: 725, y: 285, kind: 'gate' },
  { id: 'C25', label: 'Gate C25', terminal: 'C', x: 790, y: 330, kind: 'gate' },
  { id: 'C27', label: 'Gate C27', terminal: 'C', x: 840, y: 365, kind: 'gate' },
  { id: 'C31', label: 'Gate C31', terminal: 'C', x: 900, y: 410, kind: 'gate' },
  { id: 'C36', label: 'Gate C36', terminal: 'C', x: 945, y: 440, kind: 'gate' },
  { id: 'C_FOOD', label: 'Food Court', terminal: 'C', x: 770, y: 395, kind: 'corridor' },
  { id: 'C_REST', label: 'Restrooms', terminal: 'C', x: 710, y: 355, kind: 'corridor' },
  { id: 'C_CONNECT_E', label: 'Connector to E', terminal: 'C', x: 560, y: 455, kind: 'shuttle' },
  { id: 'C_CONNECT_B', label: 'Connector to B', terminal: 'C', x: 560, y: 250, kind: 'shuttle' },
  { id: 'C_ALT_1', label: 'Mezzanine', terminal: 'C', x: 470, y: 290, kind: 'corridor' },
  { id: 'C_ALT_2', label: 'Skybridge', terminal: 'C', x: 640, y: 370, kind: 'corridor' },
  { id: 'C_ALT_3', label: 'Moving Walkway', terminal: 'C', x: 820, y: 450, kind: 'corridor' }
];

const stubNodes: AirportNode[] = [
  { id: 'A_ENTRY', label: 'Terminal A Entry', terminal: 'A', x: 150, y: 120, kind: 'entry' },
  { id: 'A7', label: 'Gate A7', terminal: 'A', x: 260, y: 120, kind: 'gate' },
  { id: 'A12', label: 'Gate A12', terminal: 'A', x: 320, y: 120, kind: 'gate' },
  { id: 'B_ENTRY', label: 'Terminal B Entry', terminal: 'B', x: 150, y: 160, kind: 'entry' },
  { id: 'B21', label: 'Gate B21', terminal: 'B', x: 260, y: 160, kind: 'gate' },
  { id: 'B29', label: 'Gate B29', terminal: 'B', x: 320, y: 160, kind: 'gate' },
  { id: 'E_ENTRY', label: 'Terminal E Entry', terminal: 'E', x: 150, y: 200, kind: 'entry' },
  { id: 'E5', label: 'Gate E5', terminal: 'E', x: 260, y: 200, kind: 'gate' },
  { id: 'E10', label: 'Gate E10', terminal: 'E', x: 320, y: 200, kind: 'gate' }
];

function edge(id: string, from: string, to: string, baseWalkTimeMinutes: number, capacity: number): AirportEdge {
  return { id, from, to, baseWalkTimeMinutes, capacity };
}

const cEdges: AirportEdge[] = [
  edge('E1', 'C_CURB', 'C_TICK_1', 3, 180), edge('E2', 'C_CURB', 'C_TICK_2', 4, 120),
  edge('E3', 'C_GARAGE', 'C_TICK_2', 4, 140), edge('E4', 'C_GARAGE', 'C_TICK_1', 5, 100),
  edge('E5', 'C_RENTAL', 'C_TICK_2', 5, 100), edge('E6', 'C_RIDE', 'C_TICK_1', 5, 110),
  edge('E7', 'C_TICK_1', 'C_BAG_1', 2, 150), edge('E8', 'C_TICK_2', 'C_BAG_2', 2, 150),
  edge('E9', 'C_TICK_1', 'C_SEC_STD', 4, 120), edge('E10', 'C_TICK_2', 'C_SEC_STD', 3, 120),
  edge('E11', 'C_BAG_1', 'C_SEC_STD', 4, 100), edge('E12', 'C_BAG_2', 'C_SEC_STD', 3, 100),
  edge('E13', 'C_BAG_1', 'C_SEC_PRE', 4, 80), edge('E14', 'C_BAG_2', 'C_SEC_PRE', 3, 80),
  edge('E15', 'C_SEC_STD', 'C_HUB', 4, 110), edge('E16', 'C_SEC_PRE', 'C_HUB', 3, 90),
  edge('E17', 'C_HUB', 'C_SPINE_1', 3, 140), edge('E18', 'C_SPINE_1', 'C_SPINE_2', 2, 140),
  edge('E19', 'C_SPINE_2', 'C_SPINE_3', 2, 140), edge('E20', 'C_SPINE_3', 'C_SPINE_4', 2, 140),
  edge('E21', 'C_SPINE_4', 'C_SPINE_5', 2, 140), edge('E22', 'C_SPINE_1', 'C17', 1.5, 80),
  edge('E23', 'C_SPINE_2', 'C19', 1.2, 80), edge('E24', 'C_SPINE_2', 'C21', 1.5, 80),
  edge('E25', 'C_SPINE_3', 'C25', 1.4, 80), edge('E26', 'C_SPINE_4', 'C27', 1.5, 80),
  edge('E27', 'C_SPINE_5', 'C31', 1.3, 80), edge('E28', 'C_SPINE_5', 'C36', 1.6, 75),
  edge('E29', 'C_HUB', 'C_ALT_1', 2.5, 70), edge('E30', 'C_ALT_1', 'C_SPINE_2', 2.2, 70),
  edge('E31', 'C_SPINE_2', 'C_ALT_2', 1.3, 70), edge('E32', 'C_ALT_2', 'C_SPINE_4', 2.1, 70),
  edge('E33', 'C_SPINE_4', 'C_ALT_3', 1.2, 80), edge('E34', 'C_ALT_3', 'C36', 1.1, 80),
  edge('E35', 'C_SPINE_3', 'C_REST', 0.8, 60), edge('E36', 'C_REST', 'C_FOOD', 1, 60),
  edge('E37', 'C_FOOD', 'C27', 0.9, 70), edge('E38', 'C_HUB', 'C_CONNECT_E', 3.5, 60),
  edge('E39', 'C_HUB', 'C_CONNECT_B', 3.5, 60)
];

const stubEdges: AirportEdge[] = [
  edge('A1', 'A_ENTRY', 'A7', 4, 100), edge('A2', 'A_ENTRY', 'A12', 6, 100),
  edge('B1', 'B_ENTRY', 'B21', 4, 100), edge('B2', 'B_ENTRY', 'B29', 6, 100),
  edge('EE1', 'E_ENTRY', 'E5', 4, 100), edge('EE2', 'E_ENTRY', 'E10', 6, 100)
];

export const bosNodes: AirportNode[] = [...cNodes, ...stubNodes];
export const bosEdges: AirportEdge[] = [...cEdges, ...stubEdges];

export const entryNodeByOption: Record<EntryPoint, string> = {
  curbside: 'C_CURB',
  garage: 'C_GARAGE',
  rental: 'C_RENTAL',
  rideshare: 'C_RIDE',
};

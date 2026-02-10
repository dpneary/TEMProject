# BOS Curb-to-Gate Optimal Pathing (Demo Prototype)

Web-based single-page prototype that simulates **curb-to-gate routing** inside Boston Logan (BOS), focused on **Terminal C**.

## What this demo shows

- Trip setup panel (terminal, airline, gate, entry point, PreCheck/Standard, checked bag)
- Simulated indoor map rendered with SVG
- Graph-based route optimization using Dijkstra
- Live conditions panel with wait cards, trend arrows, and incident feed
- Periodic sensor simulation updates (fabricated, realistic ranges)
- Automatic rerouting toast when congestion/incidents change ETA
- ETA summary with walk/waits/confidence breakdown

## Tech

- React + TypeScript + Vite
- Styling via plain CSS
- No backend; simulation runs in browser via timers

## Run locally

```bash
npm install
npm run dev
```

### Windows setup (PowerShell)

1. Install **Node.js 18+** (includes npm): https://nodejs.org/
2. Open **PowerShell** in the project folder.
3. Run:

```powershell
npm install
npm run dev
```

4. Open the URL shown in the terminal (typically `http://localhost:5173`).

Optional production build on Windows:

```powershell
npm run build
npm run preview
```

Build preview:

```bash
npm run build
npm run preview
```

## Project structure

- `src/data/bosGraph.ts` – BOS nodes/edges, terminal airlines, gate lists, entry node mapping
- `src/sim/simulator.ts` – simulation engine for waits, congestion factors, incidents, scenario behavior
- `src/routing/dijkstra.ts` – route computation (min ETA)
- `src/components/ControlsPanel.tsx` – trip setup + scenario + actions
- `src/components/MapView.tsx` – SVG map, path highlight, congestion colors, incident icons, moving marker
- `src/components/ConditionsPanel.tsx` – live condition cards + event feed
- `src/App.tsx` – orchestration, timers, rerouting logic, ETA summary

## Routing model

Graph model:

- Node: `id`, label, terminal, coordinates, kind
- Edge: `from`, `to`, `baseWalkTimeMinutes`, `capacity`

Cost used by Dijkstra:

- `edge cost = baseWalkTimeMinutes * currentCongestionFactor`
- plus dynamic waits for security + bag drop + shuttle (if encountered and relevant)

Recomputation:

- Simulation updates every ~6 seconds
- On each tick, route is recalculated
- If ETA shifts significantly, a toast notifies the user

## Simulation details (mocked)

`src/sim/simulator.ts` updates:

- Security wait by terminal (PreCheck and Standard)
- Bag-drop queue by terminal
- Corridor congestion factor per edge (`0.8–2.5`)
- Incident generation with temporary edge closures
- Event feed log
- Scenario baselines:
  - Normal
  - Morning Rush
  - Weather Delay Surge
  - Construction
  - Staff Shortage

## Extending the prototype

1. Add/adjust graph nodes and edges in `src/data/bosGraph.ts`.
2. Tune scenario baselines and random walk behavior in `src/sim/simulator.ts`.
3. Add checkpoint semantics to routing costs in `src/routing/dijkstra.ts`.
4. Improve visuals in `src/components/MapView.tsx` (zones, labels, overlays).

## Notes

- This is a demonstration only; all operational and sensor data are fabricated.
- Terminal A/B/E are lightweight placeholders; Terminal C has full demo fidelity.

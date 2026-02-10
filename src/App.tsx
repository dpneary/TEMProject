import { useEffect, useMemo, useRef, useState } from 'react';
import { ConditionsPanel } from './components/ConditionsPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { MapView } from './components/MapView';
import { getEntryNode, getTerminalGraph } from './data/bosGraph';
import { computeRoute } from './routing/dijkstra';
import { createInitialSimulation, tickSimulation } from './sim/simulator';
import { RouteSummary, TripSetup } from './types';

const initialTrip: TripSetup = {
  terminal: 'C',
  airline: 'JetBlue',
  gate: 'C25',
  entryPoint: 'curbside',
  securityMode: 'precheck',
  checkedBag: false,
  scenario: 'normal',
};

export default function App() {
  const [trip, setTrip] = useState<TripSetup>(initialTrip);
  const graph = useMemo(() => getTerminalGraph(trip.terminal), [trip.terminal]);
  const [sim, setSim] = useState(createInitialSimulation(graph.edges));
  const [started, setStarted] = useState(false);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [markerProgress, setMarkerProgress] = useState(0);
  const prevEta = useRef<number | null>(null);

  useEffect(() => {
    setSim(createInitialSimulation(graph.edges));
    setRoute(null);
    setStarted(false);
    setMarkerProgress(0);
    prevEta.current = null;
  }, [graph.edges]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSim((prev) => tickSimulation(prev, graph.edges, trip.scenario));
    }, 6000);
    return () => clearInterval(timer);
  }, [graph.edges, trip.scenario]);

  useEffect(() => {
    if (!started) return;
    const startNode = getEntryNode(trip.terminal, trip.entryPoint);

    const nextRoute = computeRoute(graph.nodes, graph.edges, sim, startNode, trip.gate, {
      checkedBag: trip.checkedBag,
      securityMode: trip.securityMode,
      terminal: trip.terminal,
    });

    if (!nextRoute) {
      setRoute(null);
      setToast(`No viable route to ${trip.gate} right now. Try another gate or entry point.`);
      return;
    }

    if (prevEta.current && Math.abs(prevEta.current - nextRoute.totalEtaMinutes) > 2) {
      setToast('Route updated due to congestion.');
    }
    prevEta.current = nextRoute.totalEtaMinutes;
    setRoute(nextRoute);
  }, [sim, trip, started, graph]);

  useEffect(() => {
    if (!started || !route) return;
    const total = Math.max(1, route.totalEtaMinutes);
    setMarkerProgress(0);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsedMinutes = (Date.now() - startedAt) / 1000 / 4;
      setMarkerProgress(Math.min(1, elapsedMinutes / total));
    }, 300);
    return () => clearInterval(timer);
  }, [route, started]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const onStartRoute = () => {
    setStarted(true);
    setToast('Route started. Optimizing path now.');
  };

  const onReset = () => {
    setTrip(initialTrip);
    setSim(createInitialSimulation(getTerminalGraph(initialTrip.terminal).edges));
    setRoute(null);
    setStarted(false);
    setToast(null);
    setMarkerProgress(0);
    prevEta.current = null;
  };

  return (
    <div className="appShell">
      <ControlsPanel trip={trip} onChange={setTrip} onStartRoute={onStartRoute} onReset={onReset} />
      <main className="mainPanel">
        <header className="etaSummary">
          <div className="summaryHeading">
            <h1>BOS Curb-to-Gate Optimal Pathing</h1>
            <span className="chip">Terminal {trip.terminal}</span>
            <span className="chip soft">Updated {sim.timestamp}</span>
          </div>
          <div className="etaMetrics">
            <Metric label="Total ETA" value={route ? `${route.totalEtaMinutes} min` : '--'} />
            <Metric label="Walk" value={route ? `${route.walkMinutes} min` : '--'} />
            <Metric label="Waits" value={route ? `${route.waitsMinutes} min` : '--'} />
            <Metric label="Confidence" value={route?.confidence ?? '--'} />
          </div>
          {trip.terminal !== 'C' && (
            <p className="hint">
              Terminal {trip.terminal} is a lightweight placeholder map for demo purposes. Terminal C has full-fidelity routing detail.
            </p>
          )}
        </header>

        <MapView
          terminal={trip.terminal}
          nodes={graph.nodes}
          edges={graph.edges}
          route={route}
          corridorFactors={sim.corridorFactors}
          incidents={sim.incidents}
          selectedGate={trip.gate}
          onGateClick={(gate) => setTrip((prev) => ({ ...prev, gate }))}
          markerProgress={markerProgress}
        />
      </main>
      <ConditionsPanel sim={sim} trip={trip} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

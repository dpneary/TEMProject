import { useEffect, useMemo, useRef, useState } from 'react';
import { ConditionsPanel } from './components/ConditionsPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { MapView } from './components/MapView';
import { bosEdges, bosNodes, entryNodeByOption } from './data/bosGraph';
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
  const [sim, setSim] = useState(createInitialSimulation(bosEdges));
  const [started, setStarted] = useState(false);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [markerProgress, setMarkerProgress] = useState(0);
  const prevEta = useRef<number | null>(null);

  const cNodes = useMemo(() => bosNodes.filter((n) => n.terminal === 'C'), []);
  const cEdges = useMemo(() => bosEdges.filter((e) => e.id.startsWith('E')), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSim((prev) => tickSimulation(prev, cEdges, trip.scenario));
    }, 6000);
    return () => clearInterval(timer);
  }, [cEdges, trip.scenario]);

  useEffect(() => {
    if (!started) return;

    const nextRoute = computeRoute(cNodes, cEdges, sim, entryNodeByOption[trip.entryPoint], trip.gate, {
      checkedBag: trip.checkedBag,
      securityMode: trip.securityMode,
      terminal: trip.terminal,
    });
    if (!nextRoute) return;

    if (prevEta.current && Math.abs(prevEta.current - nextRoute.totalEtaMinutes) > 2) {
      setToast('Route updated due to congestion.');
    }
    prevEta.current = nextRoute.totalEtaMinutes;
    setRoute(nextRoute);
  }, [sim, trip, started, cEdges, cNodes]);

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
    setSim(createInitialSimulation(cEdges));
    setRoute(null);
    setStarted(false);
    setToast(null);
    prevEta.current = null;
  };

  return (
    <div className="appShell">
      <ControlsPanel trip={trip} onChange={setTrip} onStartRoute={onStartRoute} onReset={onReset} />
      <main className="mainPanel">
        <header className="etaSummary">
          <h1>BOS Curb-to-Gate Optimal Pathing (Prototype)</h1>
          <div className="etaMetrics">
            <Metric label="Total ETA" value={route ? `${route.totalEtaMinutes} min` : '--'} />
            <Metric label="Walk" value={route ? `${route.walkMinutes} min` : '--'} />
            <Metric label="Waits" value={route ? `${route.waitsMinutes} min` : '--'} />
            <Metric label="Confidence" value={route?.confidence ?? '--'} />
          </div>
        </header>

        <MapView
          nodes={cNodes}
          edges={cEdges}
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

import { SimulationState, TripSetup } from '../types';

interface Props {
  sim: SimulationState;
  trip: TripSetup;
}

function arrow(dir: 'up' | 'down' | 'flat'): string {
  return dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
}

export function ConditionsPanel({ sim, trip }: Props) {
  const sec = trip.securityMode === 'precheck' ? sim.securityWait[trip.terminal].precheck : sim.securityWait[trip.terminal].standard;

  return (
    <aside className="panel">
      <h2>Live Conditions</h2>
      <div className="cards">
        <ConditionCard label="Bag drop wait" value={`${sim.bagDropWait[trip.terminal]} min`} trend={sim.trend.bagDrop} />
        <ConditionCard label="Security wait" value={`${sec} min`} trend={sim.trend.security} />
        <ConditionCard label="Corridor congestion" value={`${Math.round(avg(Object.values(sim.corridorFactors)) * 100)}%`} trend={sim.trend.corridor} />
        <ConditionCard label="Train/shuttle wait" value={`${sim.shuttleWait} min`} trend={sim.trend.shuttle} />
      </div>

      <h3>Event Feed</h3>
      <ul className="eventFeed">
        {sim.eventFeed.map((event, idx) => <li key={`${event}-${idx}`}>{event}</li>)}
      </ul>
    </aside>
  );
}

function ConditionCard({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' | 'flat' }) {
  return (
    <article className="conditionCard">
      <p>{label}</p>
      <strong>{value}</strong>
      <span className={`trend ${trend}`}>{arrow(trend)}</span>
    </article>
  );
}

function avg(vals: number[]): number {
  if (!vals.length) return 1;
  return vals.reduce((sum, value) => sum + value, 0) / vals.length;
}

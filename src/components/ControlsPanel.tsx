import { airlinesByTerminal, gatesByTerminal } from '../data/bosGraph';
import { EntryPoint, Scenario, Terminal, TripSetup } from '../types';

interface Props {
  trip: TripSetup;
  onChange: (next: TripSetup) => void;
  onStartRoute: () => void;
  onReset: () => void;
}

const entryOptions: { id: EntryPoint; label: string; detail: string }[] = [
  { id: 'curbside', label: 'Curbside Drop-off', detail: 'Fastest for direct drop-offs' },
  { id: 'garage', label: 'Parking Garage', detail: 'Adds walking from garage bridge' },
  { id: 'rental', label: 'Rental Car Shuttle', detail: 'Includes shuttle transfer timing' },
  { id: 'rideshare', label: 'Rideshare', detail: 'Drop point can vary with demand' },
];

const scenarios: { id: Scenario; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'morning_rush', label: 'Morning Rush' },
  { id: 'weather_surge', label: 'Weather Delay Surge' },
  { id: 'construction', label: 'Construction' },
  { id: 'staff_shortage', label: 'Staff Shortage' },
];

export function ControlsPanel({ trip, onChange, onStartRoute, onReset }: Props) {
  const setTerminal = (terminal: Terminal) => {
    const airline = airlinesByTerminal[terminal][0];
    const gate = gatesByTerminal[terminal][0];
    onChange({ ...trip, terminal, airline, gate });
  };

  return (
    <aside className="panel">
      <h2>Trip Setup</h2>
      <p className="subtle">Configure your traveler profile and routing conditions.</p>

      <label>Scenario
        <select value={trip.scenario} onChange={(e) => onChange({ ...trip, scenario: e.target.value as Scenario })}>
          {scenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>

      <label>Terminal
        <select value={trip.terminal} onChange={(e) => setTerminal(e.target.value as Terminal)}>
          <option value="A">Terminal A</option>
          <option value="B">Terminal B</option>
          <option value="C">Terminal C</option>
          <option value="E">Terminal E</option>
        </select>
      </label>

      <label>Airline
        <select value={trip.airline} onChange={(e) => onChange({ ...trip, airline: e.target.value })}>
          {airlinesByTerminal[trip.terminal].map((airline) => <option key={airline} value={airline}>{airline}</option>)}
        </select>
      </label>

      <label>Gate
        <select value={trip.gate} onChange={(e) => onChange({ ...trip, gate: e.target.value })}>
          {gatesByTerminal[trip.terminal].map((gate) => <option key={gate} value={gate}>{gate}</option>)}
        </select>
      </label>

      <fieldset>
        <legend>Entry point</legend>
        {entryOptions.map((entry) => (
          <label key={entry.id} className="radioRow">
            <input
              type="radio"
              name="entry"
              checked={trip.entryPoint === entry.id}
              onChange={() => onChange({ ...trip, entryPoint: entry.id })}
            />
            <span>
              {entry.label}
              <small>{entry.detail}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <label>Security mode
        <select value={trip.securityMode} onChange={(e) => onChange({ ...trip, securityMode: e.target.value as TripSetup['securityMode'] })}>
          <option value="precheck">PreCheck</option>
          <option value="standard">Standard</option>
        </select>
      </label>

      <label className="checkboxRow">
        <input
          type="checkbox"
          checked={trip.checkedBag}
          onChange={(e) => onChange({ ...trip, checkedBag: e.target.checked })}
        />
        Checked bag
      </label>

      <div className="buttonRow">
        <button onClick={onStartRoute}>Start route</button>
        <button className="ghost" onClick={onReset}>Reset</button>
      </div>
    </aside>
  );
}

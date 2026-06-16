import type { TripType } from "../types";
import { MONTHS } from "../utils/time";

type Props = {
  origin: string; setOrigin: (v: string) => void;
  destination: string; setDestination: (v: string) => void;
  tripType: TripType; setTripType: (v: TripType) => void;
  tripLengthWeeks: number; setTripLengthWeeks: (v: number) => void;
  months: string[]; toggleMonth: (v: string) => void;
  scanning: boolean; error: string;
  onScan: () => void;
};

export function ScanForm({ origin, setOrigin, destination, setDestination, tripType, setTripType, tripLengthWeeks, setTripLengthWeeks, months, toggleMonth, scanning, error, onScan }: Props) {
  return (
    <>
      <div className="scan_inputs">
        <input placeholder="Origin (YYZ)" value={origin} onChange={(e) => setOrigin(e.target.value)} maxLength={3} />
        <input placeholder="Destination (YVR)" value={destination} onChange={(e) => setDestination(e.target.value)} maxLength={3} />
      </div>

      <select className="scan_select" value={tripType} onChange={(e) => setTripType(e.target.value as TripType)}>
        <option value="one-way">One-way</option>
        <option value="round-trip">Round-trip</option>
      </select>

      {tripType === "round-trip" && (
        <div className="scan_trip-length">
          <div className="scan_trip-length_label">
            Trip length: <strong>{tripLengthWeeks} week{tripLengthWeeks !== 1 ? "s" : ""}</strong>
          </div>
          <input type="range" min={1} max={52} value={tripLengthWeeks} onChange={(e) => setTripLengthWeeks(Number(e.target.value))} />
        </div>
      )}

      <div className="scan_months">
        <div className="scan_months_label">Months</div>
        <div className="scan_months_grid">
          {MONTHS.map((m) => (
            <div key={m.value} onClick={() => toggleMonth(m.value)} className={`scan_month${months.includes(m.value) ? " scan_month--selected" : ""}`}>
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="scan_error">{error}</div>}

      <button className="scan_button" onClick={onScan} disabled={scanning}>
        {scanning ? "Scanning…" : "Scan"}
      </button>
    </>
  );
}

import type { ScanResult } from "../types";
import { ResultsTable } from "./ResultsTable";

type Props = {
  history: ScanResult[];
  onClear: () => void;
};

export function HistoryPanel({ history, onClear }: Props) {
  return (
    <>
      <div className="history_toolbar">
        <button className="history_clear" onClick={onClear} disabled={history.length === 0}>Clear history</button>
      </div>

      {history.length === 0 && <div className="history_empty">No scans yet.</div>}

      {history.map((scan) => (
        <div key={scan.id} className="history_item">
          <div className="history_meta">
            {scan.config.origin} → {scan.config.destination} · {scan.config.tripType} · {scan.config.months.join(", ")}
            <span>{new Date(scan.timestamp).toLocaleString()}</span>
          </div>
          {scan.results.length === 0
            ? <div className="history_no-results">No results</div>
            : <ResultsTable results={scan.results} />
          }
        </div>
      ))}
    </>
  );
}

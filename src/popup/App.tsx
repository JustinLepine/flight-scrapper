import { useState, useEffect } from "react";
import type { ScanResult, TripType } from "../types";
import { ScanForm } from "../components/ScanForm";
import { HistoryPanel } from "../components/HistoryPanel";
import { getScans, clearScans } from "../utils/storage";
import { useScan } from "../hooks/useScan";
import '../styles/global.scss'

export default function App() {
  const [origin, setOrigin] = useState("YUL");
  const [destination, setDestination] = useState("HND");
  const [tripType, setTripType] = useState<TripType>("round-trip");
  const [tripLengthWeeks, setTripLengthWeeks] = useState(12);
  const [months, setMonths] = useState<string[]>([]);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [tab, setTab] = useState<"scan" | "history">("scan");

  const { scan, scanning, error } = useScan((scans) => {
    setHistory(scans);
    setTab("history");
  });

  useEffect(() => { getScans().then(setHistory); }, []);

  function toggleMonth(value: string) {
    setMonths((m) => m.includes(value) ? m.filter((x) => x !== value) : [...m, value]);
  }

  async function handleClear() {
    await clearScans();
    setHistory([]);
  }

  return (
    <div className="app">
      <h2 className="app_title">Flight Scrapper</h2>

      <div className="app_tabs">
        <div className={`app_tab${tab === "scan" ? " app_tab--active" : ""}`} onClick={() => setTab("scan")}>Scan</div>
        <div className={`app_tab${tab === "history" ? " app_tab--active" : ""}`} onClick={() => setTab("history")}>
          History {history.length > 0 && `(${history.length})`}
        </div>
      </div>

      {tab === "scan" && (
        <ScanForm
          origin={origin} setOrigin={setOrigin}
          destination={destination} setDestination={setDestination}
          tripType={tripType} setTripType={setTripType}
          tripLengthWeeks={tripLengthWeeks} setTripLengthWeeks={setTripLengthWeeks}
          months={months} toggleMonth={toggleMonth}
          scanning={scanning} error={error}
          onScan={() => scan({ origin: origin.toUpperCase(), destination: destination.toUpperCase(), tripType, tripLengthWeeks, months })}
        />
      )}

      {tab === "history" && <HistoryPanel history={history} onClear={handleClear} />}
    </div>
  );
}

import { useState, useEffect } from "react";
import type { RouteConfig, FlightResult, ScanResult, TripType } from "../types";
import { getScans, clearScans } from "../utils/storage";

const TODAY = new Date();
TODAY.setDate(1);
TODAY.setHours(0, 0, 0, 0);

const MONTHS = Array.from({ length: 18 }, (_, i) => {
  const d = new Date(TODAY);
  d.setMonth(TODAY.getMonth() + i);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: d.toLocaleDateString("en-CA", { month: "short", year: "numeric" }),
  };
});

function ResultsTable({ results }: { results: FlightResult[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr>{["Departure", "Return", "Price", ""].map((h, i) => (
          <th key={i} style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "2px 4px" }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i}>
            <td style={{ padding: "2px 4px" }}>{r.departure}</td>
            <td style={{ padding: "2px 4px" }}>{r.return ?? "—"}</td>
            <td style={{ padding: "2px 4px" }}>${r.price}</td>
            <td style={{ padding: "2px 4px" }}>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>Book</a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [origin, setOrigin] = useState("YUL");
  const [destination, setDestination] = useState("HND");
  const [tripType, setTripType] = useState<TripType>("round-trip");
  const [tripLengthWeeks, setTripLengthWeeks] = useState(2);
  const [months, setMonths] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [tab, setTab] = useState<"scan" | "history">("scan");

  useEffect(() => { getScans().then(setHistory); }, []);

  function toggleMonth(value: string) {
    setMonths((m) => m.includes(value) ? m.filter((x) => x !== value) : [...m, value]);
  }

  async function scan() {
    if (!origin || !destination || months.length === 0) {
      setError("Fill in all fields and select at least one month.");
      return;
    }
    setError("");
    setScanning(true);
    const config: RouteConfig = { origin: origin.toUpperCase(), destination: destination.toUpperCase(), tripType, tripLengthWeeks, months };
    chrome.runtime.sendMessage({ type: "START_SCAN", config }, (res) => {
      setScanning(false);
      if (res?.error) { setError(res.error); return; }
      // Ding sound via Web Audio API
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(); osc.stop(ctx.currentTime + 0.6);
      } catch {}
      getScans().then(setHistory);
      setTab("history");
    });
  }

  async function handleClear() {
    await clearScans();
    setHistory([]);
  }

  const th: React.CSSProperties = { padding: "4px 8px", cursor: "pointer", borderBottom: "2px solid transparent" };
  const active: React.CSSProperties = { borderBottomColor: "#1a73e8", color: "#1a73e8" };

  return (
    <div style={{ padding: 12, width: 380, fontFamily: "sans-serif" }}>
      <h2 style={{ margin: "0 0 8px" }}>Flight Scrapper</h2>

      <div style={{ display: "flex", marginBottom: 12, borderBottom: "1px solid #ddd" }}>
        <div style={{ ...th, ...(tab === "scan" ? active : {}) }} onClick={() => setTab("scan")}>Scan</div>
        <div style={{ ...th, ...(tab === "history" ? active : {}) }} onClick={() => setTab("history")}>
          History {history.length > 0 && `(${history.length})`}
        </div>
      </div>

      {tab === "scan" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Origin (YYZ)" value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ flex: 1, padding: 4 }} maxLength={3} />
            <input placeholder="Destination (YVR)" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ flex: 1, padding: 4 }} maxLength={3} />
          </div>

          <select value={tripType} onChange={(e) => setTripType(e.target.value as TripType)} style={{ width: "100%", padding: 4, marginBottom: 8 }}>
            <option value="one-way">One-way</option>
            <option value="round-trip">Round-trip</option>
          </select>

          {tripType === "round-trip" && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                Trip length: <strong>{tripLengthWeeks} week{tripLengthWeeks !== 1 ? "s" : ""}</strong>
              </div>
              <input
                type="range" min={1} max={52} value={tripLengthWeeks}
                onChange={(e) => setTripLengthWeeks(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Months</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              {MONTHS.map((m) => {
                const selected = months.includes(m.value);
                return (
                  <div
                    key={m.value}
                    onClick={() => toggleMonth(m.value)}
                    style={{
                      padding: "4px 2px", fontSize: 11, textAlign: "center", cursor: "pointer",
                      borderRadius: 4, border: "1px solid",
                      borderColor: selected ? "#1a73e8" : "#ddd",
                      background: selected ? "#e8f0fe" : "#fff",
                      color: selected ? "#1a73e8" : "#333",
                      userSelect: "none",
                    }}
                  >
                    {m.label}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <div style={{ color: "red", fontSize: 12, marginBottom: 6 }}>{error}</div>}

          <button onClick={scan} disabled={scanning} style={{ width: "100%", padding: 6 }}>
            {scanning ? "Scanning…" : "Scan"}
          </button>
        </>
      )}

      {tab === "history" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={handleClear} disabled={history.length === 0} style={{ fontSize: 12, padding: "2px 8px", color: "red" }}>
              Clear history
            </button>
          </div>

          {history.length === 0 && <div style={{ fontSize: 12, color: "#888" }}>No scans yet.</div>}

          {history.map((scan) => (
            <div key={scan.id} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                {scan.config.origin} → {scan.config.destination} · {scan.config.tripType} · {scan.config.months.join(", ")}
                <span style={{ float: "right" }}>{new Date(scan.timestamp).toLocaleString()}</span>
              </div>
              {scan.results.length === 0
                ? <div style={{ fontSize: 12, color: "#aaa" }}>No results</div>
                : <ResultsTable results={scan.results} />
              }
            </div>
          ))}
        </>
      )}
    </div>
  );
}

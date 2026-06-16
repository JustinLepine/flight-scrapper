import { useState } from "react";
import type { RouteConfig, ScanResult } from "../types";
import { getScans } from "../utils/storage";

function playDing() {
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
}

export function useScan(onDone: (scans: ScanResult[]) => void) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  function scan(config: RouteConfig) {
    if (!config.origin || !config.destination || config.months.length === 0) {
      setError("Fill in all fields and select at least one month.");
      return;
    }
    setError("");
    setScanning(true);
    chrome.runtime.sendMessage({ type: "START_SCAN", config }, (res) => {
      setScanning(false);
      if (res?.error) { setError(res.error); return; }
      playDing();
      getScans().then(onDone);
    });
  }

  return { scan, scanning, error };
}

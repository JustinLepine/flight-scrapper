import type { ScanResult } from "../types";

const KEY = "flight_scans";

export async function getScans(): Promise<ScanResult[]> {
  const { [KEY]: data } = await chrome.storage.local.get(KEY);
  return data ?? [];
}

export async function saveScan(scan: ScanResult): Promise<void> {
  const scans = await getScans();
  await chrome.storage.local.set({ [KEY]: [scan, ...scans] });
}

export async function clearScans(): Promise<void> {
  await chrome.storage.local.remove(KEY);
}

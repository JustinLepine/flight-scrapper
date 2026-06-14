import type { RouteConfig, FlightResult, ScanResult } from "../types";
import { saveScan } from "../utils/storage";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "START_SCAN") {
    runScan(msg.config).then(sendResponse).catch((e) => sendResponse({ error: String(e) }));
    return true;
  }
});

async function runScan(config: RouteConfig): Promise<{ results: FlightResult[] }> {
  // Compute full date range: first day of earliest month - 3 days buffer
  // to last day of latest month + (tripLengthWeeks * 7) + 3 days buffer
  const sorted = [...config.months].sort();
  const bufferDays = 3;
  const tripDays = config.tripType === "round-trip" ? (config.tripLengthWeeks ?? 1) * 7 : 0;

  const startDate = new Date(`${sorted[0]}-01`);
  startDate.setDate(startDate.getDate() - bufferDays);

  const lastMonth = sorted[sorted.length - 1];
  const endDate = new Date(`${lastMonth}-01`);
  endDate.setMonth(endDate.getMonth() + 1); // first day of month after last
  endDate.setDate(endDate.getDate() - 1 + bufferDays + tripDays); // last day + buffer + trip

  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  // We still open one tab per selected month (for calendar navigation),
  // but pass the full range so the scraper knows what departure dates to keep
  const allResults: FlightResult[] = [];

  for (const month of sorted) {
    const url = buildUrl(config, month, start, end);
    const tab = await chrome.tabs.create({ url, active: false });

    const monthResults = await new Promise<FlightResult[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout scraping ${month}`));
      }, 60000);

      function cleanup() {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        chrome.tabs.remove(tab.id!).catch(() => {});
      }

      function listener(msg: any, sender: chrome.runtime.MessageSender) {
        if (msg.type === "SCRAPE_RESULTS" && sender.tab?.id === tab.id) {
          cleanup();
          if (msg.debug) {
            const dataUrl = "data:application/json;base64," + btoa(JSON.stringify(msg.debug, null, 2));
            chrome.downloads.download({ url: dataUrl, filename: `debug-${month}.json` });
          }
          resolve(msg.results ?? []);
        }
      }

      chrome.runtime.onMessage.addListener(listener);
    });

    allResults.push(...monthResults);
  }

  // Deduplicate by departure date, keep lowest price
  const byDate = new Map<string, FlightResult>();
  for (const r of allResults) {
    const existing = byDate.get(r.departure);
    if (!existing || r.price < existing.price) byDate.set(r.departure, r);
  }

  const results = [...byDate.values()].sort((a, b) => a.price - b.price);

  const scan: ScanResult = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    config,
    results,
  };
  await saveScan(scan);

  return { results };
}

function buildUrl(config: RouteConfig, month: string, start: string, end: string): string {
  const custom = new URLSearchParams({
    _scrape_month: month,
    _scrape_start: start,
    _scrape_end: end,
    _origin: config.origin,
    _dest: config.destination,
    _tt: config.tripType,
    _weeks: String(config.tripLengthWeeks ?? 1),
  });
  const date = `${month}-01`;
  return `https://www.google.com/travel/flights?hl=en&q=Flights+from+${config.origin}+to+${config.destination}&curr=CAD&${custom.toString()}#flt=${config.origin}.${config.destination}.${date};c:CAD;e:1;sd:1;t:e`;
}

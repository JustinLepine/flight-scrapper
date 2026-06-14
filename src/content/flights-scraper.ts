import type { FlightResult } from "../types";

const params = new URLSearchParams(location.search);
const targetMonth = params.get("_scrape_month") ?? "";
const scrapeStart = params.get("_scrape_start") ?? targetMonth + "-01";
const scrapeEnd = params.get("_scrape_end") ?? "";
const origin = params.get("_origin") ?? "";
const dest = params.get("_dest") ?? "";
const isRoundTrip = params.get("_tt") === "round-trip";
const tripDays = parseInt(params.get("_weeks") ?? "1") * 7;

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function waitFor(selector: string, timeout = 20000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) return resolve(el);
      if (Date.now() > deadline) return reject(new Error(`Timeout: ${selector}`));
      setTimeout(tick, 400);
    };
    tick();
  });
}


function scrapePriceCells(root: Element | Document, start: string, end: string): FlightResult[] {
  const results: FlightResult[] = [];
  for (const cell of root.querySelectorAll<HTMLElement>('[data-iso]')) {
    if (cell.getAttribute("aria-hidden") === "true") continue;
    const date = cell.getAttribute("data-iso");
    if (!date || date < start || date > end) continue;
    const priceEl = cell.querySelector<HTMLElement>('[jsname="qCDwBb"]');
    if (!priceEl) continue;
    const match = priceEl.getAttribute("aria-label")?.match(/\d+/);
    if (!match) continue;
    const price = parseInt(match[0], 10);
    if (!price) continue;
    results.push({ departure: date, price, url: buildUrl(date) });
  }
  return results;
}

function buildUrl(departure: string, ret?: string): string {
  const q = ret
    ? `Flights from ${origin} to ${dest} on ${departure} returning ${ret}`
    : `Flights from ${origin} to ${dest} on ${departure}`;
  return `https://www.google.com/travel/flights/search?q=${encodeURIComponent(q)}&hl=en`;
}

(async () => {
  try {
    // 1. Wait for the departure input — page loads with origin/dest pre-filled via URL
    await waitFor('input[aria-label="Departure"]', 20000);
    await wait(800);

    // 2. Open departure date picker
    const depInput = document.querySelector<HTMLInputElement>('input[aria-label="Departure"]')!;
    depInput.click();

    // 3. Wait for calendar to open
    await waitFor('[data-iso]', 5000);
    await wait(400);

    // 4. Navigate forward until target month is visible with prices
    const nextBtn = () => document.querySelector<HTMLElement>(
      'button[aria-label="Next month"], button[aria-label="Go forward"]'
    );
    for (let i = 0; i < 12; i++) {
      const firstTargetCell = document.querySelector(`[data-iso^="${targetMonth}"]`);
      const hasPrice = firstTargetCell && [...document.querySelectorAll(`[data-iso^="${targetMonth}"] [jsname="qCDwBb"]`)]
        .some(el => el.getAttribute("aria-label")?.includes("dollars"));
      if (hasPrice) break;
      // If target month cells exist but no prices yet, wait; otherwise go forward
      if (!firstTargetCell) {
        nextBtn()?.click();
        await wait(600);
      } else {
        await wait(800); // prices still loading
      }
    }
    await waitFor(`[data-iso^="${targetMonth}"] [jsname="qCDwBb"][aria-label*="dollars"]`, 20000);
    await wait(800);

    // 6. Scrape directly from document — calendar is a detached dialog
    const depResults = scrapePriceCells(document, scrapeStart, scrapeEnd);

    const results: FlightResult[] = depResults.map(r => {
      let ret: string | undefined;
      if (isRoundTrip) {
        const d = new Date(r.departure + "T00:00:00");
        d.setDate(d.getDate() + tripDays);
        ret = d.toISOString().split("T")[0];
      }
      return { ...r, return: ret, url: buildUrl(r.departure, ret) };
    });

    const debug = {
      timestamp: Date.now(),
      targetMonth,
      url: location.href,
      totalDataIsoCells: document.querySelectorAll('[data-iso]').length,
      targetMonthCells: document.querySelectorAll(`[data-iso^="${targetMonth}"]`).length,
      targetMonthWithPrice: document.querySelectorAll(`[data-iso^="${targetMonth}"] [jsname="qCDwBb"][aria-label*="dollars"]`).length,
      depContainerFound: !!document.querySelector('[jsname="I3Yihd"]'),
      depResults: depResults.length,
      sampleCellHtml: document.querySelector(`[data-iso^="${targetMonth}"]`)?.innerHTML.substring(0, 300) ?? "none",
      // Debug scrape internals on first matching cell
      firstCellDebug: (() => {
        const cell = document.querySelector<HTMLElement>(`[data-iso^="${targetMonth}"]`);
        if (!cell) return "no cell";
        const ariaHidden = cell.getAttribute("aria-hidden");
        const date = cell.getAttribute("data-iso");
        const priceEl = cell.querySelector<HTMLElement>('[jsname="qCDwBb"]');
        const ariaLabel = priceEl?.getAttribute("aria-label");
        const match = ariaLabel?.match(/[\d,]+/);
        return { ariaHidden, date, ariaLabel, match: match?.[0] };
      })(),
    };
    chrome.runtime.sendMessage({ type: "SCRAPE_RESULTS", results, debug });
  } catch (e) {
    chrome.runtime.sendMessage({ type: "SCRAPE_RESULTS", results: [], error: String(e) });
  }
})();

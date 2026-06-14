# TODO

## Build Steps

- [x] 1. Project scaffold — Vite + React TS + MV3 manifest
- [ ] 2. Types — `RouteConfig`, `FlightResult`, `ScanResult` (`src/types/index.ts`)
- [ ] 3. Storage util — read/write wrapper (`src/utils/storage.ts`)
- [ ] 4. Popup UI — origin, destination, trip type, month(s) multi-select, scan button, results table (`src/popup/App.tsx`)
- [ ] 5. Service worker — open background tab, pass route config to content script, receive results, close tab (`src/background/service-worker.ts`)
- [ ] 6. Content script — navigate price calendar, scrape date/price pairs, return results (`src/content/flights-scraper.ts`)
  - Requires live selector inspection on Google Flights price calendar page

## Notes

- Content script selectors will break if Google updates their DOM — inspect and update `flights-scraper.ts` when that happens
- Round-trip: capture auto-filled return date + price per departure from the calendar

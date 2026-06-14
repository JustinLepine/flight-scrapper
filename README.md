# flight-scrapper

Chrome Extension that scans Google Flights for the cheapest prices across a selected month. Triggered manually from the popup — runs only when Chrome is open.

## How It Works

1. User opens the popup and enters origin, destination, trip type, and month(s) to scan
2. Clicks "Scan"
3. Extension opens a background Google Flights tab and navigates to the price calendar
4. Content script scrapes all date/price pairs across the selected month(s)
5. For round-trips, captures the auto-filled return date and price per departure
6. Results return to the popup ranked cheapest first
7. Background tab closes automatically when done

## Popup Inputs

- **Origin** — IATA code (e.g. `YYZ`)
- **Destination** — IATA code (e.g. `YVR`)
- **Trip type** — One-way or Round-trip
- **Month(s)** — Multi-select (e.g. July 2026, August 2026)

## Results

Sorted table by price (cheapest first):

| Departure | Return | Price | Airline |
|-----------|--------|-------|---------|
| Jul 4     | Jul 11 | $189  | WestJet |

Each scan is saved locally so you can compare prices across multiple scans.

## Project Structure

```
src/
├── background/
│   └── service-worker.ts    # Tab orchestration, message passing
├── content/
│   └── flights-scraper.ts   # Price calendar DOM scraping
├── popup/
│   ├── popup.html
│   ├── popup.ts             # Inputs, scan trigger, results table
│   └── popup.css
├── types/
│   └── index.ts             # RouteConfig, FlightResult, ScanResult
└── utils/
    └── storage.ts           # chrome.storage.local wrapper

public/
├── manifest.json
└── icons/
```

## Build Order

1. Project scaffold — Vite + TypeScript + MV3 manifest
2. Types — `RouteConfig`, `FlightResult`, `ScanResult`
3. Storage util
4. Popup UI — inputs + results table
5. Service worker — tab management + message passing
6. Content script — price calendar scraping (requires live selector inspection)

## Caveats

- Google Flights DOM selectors change periodically. When scraping breaks, inspect the price calendar page and update selectors in `flights-scraper.ts`.
- Only runs when Chrome is open and the popup is used to trigger a scan.

## Setup

```sh
npm install
npm run build
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions/`.

## Build

```sh
npm run build    # Production build to dist/
npm run dev      # Watch mode
```

## Stack

TypeScript · Vite · Chrome Extensions Manifest V3

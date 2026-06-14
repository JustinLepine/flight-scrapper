# flight-scrapper

Chrome Extension that scans Google Flights for the cheapest prices across selected months. Triggered manually from the popup — runs only when Chrome is open.

## How It Works

1. User opens the popup and enters origin, destination, trip type, trip length, and month(s) to scan
2. Clicks "Scan"
3. Extension opens a background Google Flights tab per selected month and navigates to the price calendar
4. Content script scrapes all date/price pairs within the selected date range
5. For round-trips, the return date is calculated as departure + trip length
6. Results return to the popup ranked cheapest first
7. A ding sounds when the scan completes
8. Background tabs close automatically when done

## Popup Inputs

- **Origin** — IATA code (e.g. `YUL`)
- **Destination** — IATA code (e.g. `HND`)
- **Trip type** — One-way or Round-trip
- **Trip length** — Slider, 1–52 weeks (round-trip only)
- **Month(s)** — 4-column grid of upcoming months, tap to select one or more

## Date Range Logic

When multiple months are selected (e.g. September + October), the scraper covers:
- Start: first day of earliest month − 3 days
- End: last day of latest month + trip length in days + 3 days

This ensures deals that straddle month boundaries are captured.

## Results

Sorted table by price (cheapest first):

| Departure  | Return     | Price  |     |
|------------|------------|--------|-----|
| 2026-09-02 | 2026-09-16 | $1,304 | Book |

Each scan is saved locally so you can compare across multiple scans.

## Project Structure

```
src/
├── background/
│   └── service-worker.ts    # Tab orchestration, date range logic, message passing
├── content/
│   └── flights-scraper.ts   # Price calendar DOM scraping
├── popup/
│   ├── popup.html
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Inputs, scan trigger, results table
│   └── popup.css
├── types/
│   └── index.ts             # RouteConfig, FlightResult, ScanResult
└── utils/
    └── storage.ts           # chrome.storage.local wrapper

public/
├── manifest.json
└── icons/
```

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

TypeScript · React · Vite · Chrome Extensions Manifest V3

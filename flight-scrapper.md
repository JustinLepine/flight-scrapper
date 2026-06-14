# flight-scrapper

Chrome Extension that tracks flight prices for a single Google Flights route, checking a few times per day. Built with TypeScript.

## How It Works

- Service worker schedules alarms (default: 8 AM, 2 PM, 10 PM daily)
- On each alarm, opens a background Google Flights tab for the configured route
- Content script extracts the current price from the DOM
- Price is saved to `chrome.storage.local` with a timestamp
- Tab closes automatically — you never see it
- Optional popup shows latest price and recent history

## Project Structure

```
src/
├── background/
│   └── service-worker.ts    # Alarm scheduling, tab orchestration
├── content/
│   └── flights-scraper.ts   # DOM scraping logic
├── popup/
│   ├── popup.html           # Optional UI
│   ├── popup.ts
│   └── popup.css
├── types/
│   └── index.ts             # FlightPrice, RouteConfig, etc.
└── utils/
    └── storage.ts           # chrome.storage.local wrapper

public/
├── manifest.json
└── icons/
```

## Why a Chrome Extension?

Only scraping one route a few times per day. Running in a real browser with a real Google session avoids anti-bot detection entirely — no proxies, no stealth plugins, no cloud infrastructure needed.

## Setup

```sh
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension in `chrome://extensions/`.

## Configuration

Edit the default route in `service-worker.ts` or update via the console:

```js
chrome.storage.local.set(
  { flightPriceData:
    { routeConfig:
      {
        origin: "YYZ",
        destination: "YVR",
        departureDate: "2026-07-15",
        returnDate: "2026-07-22",
        passengers: 1,
        cabinClass: "economy"
      }
    }
  }
)
```

## Caveats

- Google Flights DOM selectors change periodically. When scraping breaks, inspect the page and update selectors in `flights-scraper.ts`.
- Only scrapes when your browser is running. Alarms won't fire if Chrome is closed.

## Build

```sh
npm run build    # Production build to dist/
npm run dev      # Watch mode
```

## Stack

TypeScript · Vite · Chrome Extensions Manifest V3

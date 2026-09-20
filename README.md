# Quorum Travel Planner

Quorum is a polished React prototype for a Purdue ECE Senior Design project. It gives a travel group one shared place to define a trip, discover real locations on Google Maps, shape a day-by-day itinerary, discuss ideas with a prototype planner, and keep a simple expense ledger.

The prototype deliberately focuses on a coherent end-to-end planning flow instead of attempting the eventual product's booking, optimization, authentication, or payment features.

## Senior Design connection

The eventual Senior Design system is intended to take a group trip from an initial idea to a negotiated, budgeted, and settled itinerary. Future versions may consider every traveler's dates, departure airport, budget, and preferences; compare flights and lodging; synchronize multiple users; and calculate final settlements.

This repository is an early technical and interaction prototype. Its main learning objective is integrating the Google Maps JavaScript API and the current Google Places `Place` class into a typed React application while keeping trip information consistent across routes.

## Features

- Dashboard whose destination, dates, budget, saved-place count, expenses, and progress update from shared state
- Validated trip setup form with eight selectable activity preferences
- Interactive Google map with current `Place.searchByText()` search and `AdvancedMarkerElement` markers
- Search support for specific locations and descriptive queries such as `museums near Chicago`
- Selected-place details containing Place ID-backed data, address, coordinates, rating, category, and photo when available
- Duplicate-safe “Add to trip” flow with local persistence
- Day-by-day itinerary assignment, reordering, removal, and return-to-map links
- Context-aware prototype AI planner with a replaceable service boundary
- Expense ledger with add/delete behavior and live budget calculations
- Responsive navigation, empty states, loading states, API failure states, and localStorage recovery

## Technology stack

- React 19
- Vite 7
- TypeScript
- React Router
- Google Maps JavaScript API
- Places Library, using the current `Place` class and `searchByText()` Promise API
- Advanced Markers
- React Context
- localStorage
- Plain responsive CSS

No database, authentication system, UI framework, booking system, or payment provider is included.

## Project architecture

```text
src/
├── components/
│   ├── explore/              Map, search, details, and saved-place UI
│   ├── AppShell.tsx          Persistent responsive navigation
│   ├── EmptyState.tsx
│   └── PageHeader.tsx
├── context/
│   └── TravelContext.tsx     Shared actions, state, and localStorage
├── data/
│   └── defaults.ts           Sample Chicago trip and expenses
├── pages/                    Six routed application pages
├── services/
│   ├── aiPlanner.ts          Replaceable local prototype planner
│   └── googleMaps.ts         Maps loading and current Places search
├── utils/
│   └── format.ts
├── App.tsx                   Route definitions
├── main.tsx                  React entry point and providers
├── styles.css                Complete design system and responsive UI
└── types.ts                  Trip, Traveler, Place, ItineraryItem, Expense
```

`TravelProvider` is the single source of truth for the prototype. Every page reads the same trip, itinerary, traveler, and expense state. State-changing functions live beside that data so duplicate prevention and persistence do not have to be rewritten on individual pages.

## Installation

Requirements:

- Node.js 20 or newer
- npm
- A Google Cloud project with billing attached for live Maps/Places behavior

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

## Running locally

```bash
npm run dev
```

Open the local URL printed by Vite. The application still runs without a Google key; Explore shows a useful setup state while Dashboard, Trip Setup, Itinerary, AI Planner, and Expenses remain functional.

Useful checks:

```bash
npm run lint
npm run build
```

## Google Maps setup

Google Maps credentials are never hardcoded. The client reads only this Vite environment variable:

```dotenv
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 1. Create or select a Google Cloud project

1. Open the [Google Maps Platform console](https://console.cloud.google.com/google/maps-apis/overview).
2. Create a project or select the project for Quorum.
3. Attach a billing account. Google Maps Platform requires billing even when usage remains within any available no-cost allowance.

### 2. Enable the required APIs

Enable both:

- **Maps JavaScript API** — renders the interactive map and loads the Maps libraries.
- **Places API** — supplies current Place search results and place fields.

This implementation does not use the legacy `PlacesService`, legacy `Marker`, or server-side Places Web Service.

### 3. Create the browser key

1. Go to **Google Maps Platform → Credentials**.
2. Choose **Create credentials → API key**.
3. Rename it to something recognizable, such as `Quorum local web key`.
4. Do not paste it into a `.ts`, `.tsx`, or committed config file.
5. Copy `.env.example` to `.env` and place the key after `VITE_GOOGLE_MAPS_API_KEY=`.
6. Restart `npm run dev` whenever `.env` changes.

### 4. Restrict the key

Under **Application restrictions**, choose **Websites (HTTP referrers)**. Add the exact local origins you use, for example:

```text
http://localhost:5173/*
http://127.0.0.1:5173/*
```

If Vite selects another port, either start it on 5173 or add that port. Before a hosted demo, add the production HTTPS origin as a separate referrer, for example `https://your-domain.example/*`.

Under **API restrictions**, choose **Restrict key**, then select:

- Maps JavaScript API
- Places API

Save the restrictions. Google notes that new restrictions can take a few minutes to propagate. Never use an unrestricted production key.

For current guidance, see Google's [API security best practices](https://developers.google.com/maps/api-security-best-practices) and [Places Library setup](https://developers.google.com/maps/documentation/javascript/places-js).

## How the Maps and Places integration works

The Explore route reads `VITE_GOOGLE_MAPS_API_KEY`. If it is present, `googleMaps.ts` configures `@googlemaps/js-api-loader` and dynamically imports the `maps`, `marker`, and `places` libraries. This avoids placing a script tag or key in source code.

The search form calls the current Promise-based `Place.searchByText()` API. Its request contains a narrow field list:

```text
id, displayName, formattedAddress, location,
rating, primaryTypeDisplayName, photos
```

The explicit field mask keeps the response understandable and avoids requesting unused billable data. The selected `Place` is converted to Quorum's own serializable `Place` type. Its `LatLng` location becomes numeric latitude and longitude, the map pans to that coordinate, zoom changes to a place-level view, and an Advanced Marker appears.

Saved markers use `google.maps.marker.AdvancedMarkerElement` with a map ID (`DEMO_MAP_ID` for this learning prototype), matching Google's current marker guidance. Saved places are copied into the itinerary state rather than storing Google objects directly; Google Maps class instances are not suitable for JSON/localStorage.

## Environment variables

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `VITE_GOOGLE_MAPS_API_KEY` | For live Explore map | Vite client | Browser-visible by design; secure it with HTTP-referrer and API restrictions. |

Files beginning with `.env` are ignored except `.env.example`. Never commit `.env` or a real key.

## AI planner design

The current planner is intentionally labeled **Prototype intelligence**. It uses a local rules-based function in `src/services/aiPlanner.ts`; it receives the current trip, itinerary, and expenses and returns context-aware demonstration responses. This is safe for a client-only prototype and requires no secret.

A future real integration should replace this service with a backend endpoint:

```text
React UI → POST /api/planner → server-side model client → response
```

Only the server process should read `OPENAI_API_KEY`. A secret model key must never use a `VITE_` prefix or appear in browser JavaScript. The endpoint should validate input, limit request size/rate, send only relevant trip context, handle provider errors, and avoid storing sensitive traveler data unnecessarily.

## Prototype-only versus future product

Prototype-only behavior:

- localStorage is the only persistence and belongs to one browser/device
- travelers are sample names rather than authenticated accounts
- the AI planner is rules-based rather than a hosted model
- expense totals assume an approximate equal share
- itinerary ordering is manual and has no travel-time optimization
- the demo map ID is used for Advanced Markers

Intended future development:

- account and group invitation flows
- cloud database and real-time multi-user synchronization
- per-traveler date, airport, budget, and preference negotiation
- production AI endpoint with evaluation and safety controls
- route time/distance awareness and itinerary optimization
- flight and lodging providers
- receipt upload, debt calculation, and settlement suggestions
- roles, authorization, audit history, offline recovery, and stronger privacy controls

Actual booking, payment, and money transfer should remain separate, security-reviewed systems.

## Screenshots

Add final demo captures here after configuring Google Maps:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/explore-map.png`
- `docs/screenshots/itinerary.png`
- `docs/screenshots/ai-planner.png`

## Learning guide

See [LEARNING_NOTES.md](./LEARNING_NOTES.md) for a student-level walkthrough of routing, shared state, localStorage, Maps/Places, markers, security, limitations, and ten potential TA questions.

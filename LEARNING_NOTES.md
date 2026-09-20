# Quorum Travel Planner — Learning Notes

These notes explain the prototype at a level suitable for a project demo or code review. The most important idea is that Quorum has one shared application state and several different views of that state.

## 1. How React Router creates the pages

The browser loads one React application from `src/main.tsx`. `BrowserRouter` watches the URL and lets React change the visible page without asking the server for a whole new HTML document.

`src/App.tsx` defines a `Routes` tree. Each `Route` maps a path to a page component:

- `/` → Dashboard
- `/trip-setup` → Trip Setup
- `/explore` → Explore
- `/itinerary` → Itinerary
- `/ai-planner` → AI Planner
- `/expenses` → Expenses

The routes are nested under `AppShell`. `AppShell` renders the persistent sidebar and an `Outlet`. React Router replaces only the `Outlet` when the route changes, so the application keeps the same navigation and shared state.

`NavLink` is used for sidebar links because it knows whether its route is active. Regular `Link` components handle buttons such as “Explore places” without causing a full page refresh.

## 2. How shared state moves information between pages

`TravelProvider` in `src/context/TravelContext.tsx` owns the shared state:

```text
TravelProvider
├── trip
├── travelers
├── itinerary
└── expenses
```

It also owns the functions that change the state: `updateTrip`, `addPlace`, `removePlace`, `assignPlaceToDay`, `movePlace`, `addExpense`, and `removeExpense`.

`TravelProvider` wraps the router in `main.tsx`, so every page is below it in the React component tree. A page calls `useTravel()` to receive the same current values and actions. For example, Explore calls `addPlace`, Itinerary reads the updated itinerary, and Dashboard immediately displays the new saved-place count.

This is React's normal one-way data flow. Pages do not send information directly to each other. They read and update their common parent state.

## 3. How localStorage is used

`localStorage` is a small key/value store built into the browser. Quorum stores one JSON string under `quorum-travel-state-v1`.

When `TravelProvider` first renders, `loadState()`:

1. reads that key;
2. parses the JSON;
3. checks that important pieces exist;
4. merges the saved trip with safe defaults; and
5. falls back to the sample trip if the JSON is missing or invalid.

A React `useEffect` runs whenever shared state changes and saves the latest JSON. That is why a browser refresh keeps the trip, places, and expenses.

localStorage is good for this prototype because it needs no backend, but it is not group synchronization. The data stays in one browser profile, can be cleared by the user, has limited capacity, and should not hold sensitive information.

## 4. How the Google Maps JavaScript API is loaded

The key is read from `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`. Vite replaces that expression when it builds the client application.

`src/services/googleMaps.ts` uses the current functional API from `@googlemaps/js-api-loader`:

1. `setOptions()` configures the key and the weekly Maps version.
2. `importLibrary("maps")` loads map rendering.
3. `importLibrary("marker")` loads Advanced Markers.
4. `importLibrary("places")` loads the Places library.

The imports return Promises. Explore waits for all three and shows a loading state. If loading rejects, it shows an error instead of trying to render a map and crashing.

If no key exists, the page does not call Google at all. It renders setup directions while the rest of Quorum remains usable.

## 5. How Places search works

The user enters text such as `Eiffel Tower`, `restaurants in Chicago`, or `museums near Chicago`. `PlaceSearch` validates that it is not blank, then calls the service function `searchPlaces()`.

That function imports the current Places library and calls:

```ts
Place.searchByText({
  textQuery: query,
  fields: [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "primaryTypeDisplayName",
  ],
  maxResultCount: 6,
});
```

This is the modern `Place` class, not the older callback-based `PlacesService`. The field list matters: Places data is field-based, so asking for only what the UI uses reduces unnecessary data and can reduce cost. The prototype omits photos and reviews so the same request also works with Google's official Maps Demo Key.

The interface is a text search rather than type-ahead autocomplete. Both are Places experiences, but this prototype uses text search because it naturally supports category phrases and returns a small result list the group can compare. If type-ahead is added later, the current replacement is `PlaceAutocompleteElement`, not the legacy `Autocomplete` widget.

## 6. What a Google Place ID is

A Place ID is Google's stable identifier for a location record. It looks like an opaque string; our code should not try to interpret its characters.

Quorum uses the ID as `placeId` and as the unique key for saved locations. Before adding a place, `TravelContext` checks whether an itinerary item already has that ID. This is more reliable than comparing names because two businesses can share a name and names can change.

Place IDs are generally stable but Google can replace or retire them, so a production app may occasionally need to refresh place data.

## 7. How latitude and longitude are retrieved

A returned Google `Place` has a `location` field when it was requested. That field is a Google `LatLng` object. Quorum converts it into plain numbers:

```ts
latitude: place.location.lat()
longitude: place.location.lng()
```

Latitude measures north/south position and longitude measures east/west position. Plain numbers can be serialized to JSON and stored in localStorage, unlike a Google class instance.

## 8. How selecting a place changes the map

`ExplorePage` stores the selected plain `Place` in local React state and passes it to `GoogleMap`.

An effect in `GoogleMap` watches `selectedPlace`. When it changes, the effect calls:

```ts
map.panTo({ lat: place.latitude, lng: place.longitude });
map.setZoom(15);
```

`panTo` centers the map with a smooth movement. Zoom 15 is close enough to understand the selected area without assuming a precise building-scale view.

When Itinerary's “View on map” link is clicked, the Place ID is placed in the Explore query string. Explore looks up the saved item and selects it, so the same centering effect runs.

## 9. How map markers work

The prototype uses `google.maps.marker.AdvancedMarkerElement`, Google's current marker class. The old `google.maps.Marker` is deprecated.

Every marker receives:

- a map instance;
- a `{ lat, lng }` position;
- an accessible title; and
- a small HTML element used as custom marker content.

Saved places have numbered green markers. A selected unsaved result has an orange marker. Clicking a saved marker calls back to Explore, selects that location, and recenters the map.

Before markers are recreated, old marker objects have their `map` property set to `null`. That removes them and prevents stale duplicates. Advanced Markers require a map ID; the prototype uses Google's `DEMO_MAP_ID` for learning and should use a project-owned map ID later if custom cloud styling is needed.

## 10. How “Add to Trip” moves a place into application state

The selected place starts as page-level state because it may only be a search candidate. Clicking “Add to trip” calls the context's `addPlace()` action.

That action:

1. checks existing `placeId` values to prevent a duplicate;
2. copies the serializable place fields;
3. adds a default day, order, and timestamp;
4. appends the new `ItineraryItem` to shared state; and
5. triggers localStorage persistence through the provider's effect.

Because Dashboard, Explore, Itinerary, and AI Planner all read shared state, they all see the new item without manually synchronizing with each other.

## 11. How the AI Planner receives trip context

`AIPlannerPage` calls `askPrototypePlanner(prompt, context)`. The context object contains the current `trip`, `itinerary`, and `expenses`. The local service checks the request for topics such as budget, food, or a day plan and builds a response using the actual destination, counts, saved places, preferences, and totals.

The visible context panel is intentional: it demonstrates that a useful travel assistant should be grounded in application data rather than receiving only a disconnected chat message.

For real AI, the page should POST the prompt and a carefully selected context object to a server endpoint. The server—not React—would read `OPENAI_API_KEY`, call the model, handle errors, and send safe output back. The existing service boundary makes that replacement localized.

## 12. API and security concerns

### Google Maps key

A Maps browser key is visible in network requests. `VITE_` variables are bundled into browser code, so `.env` prevents accidental source-control exposure but does not make the key secret. The real protection is:

- website/HTTP-referrer restrictions;
- restrictions to Maps JavaScript API and Places API only;
- separate development and production keys;
- usage quotas and billing alerts; and
- periodic usage review and key rotation if abuse is suspected.

### AI keys

An OpenAI or other model-provider key is a true secret. It must never use a `VITE_` prefix, be returned to the client, or be committed. It belongs in a server environment variable.

### User data

Trip dates, expenses, and locations can reveal personal plans. A real multi-user version needs authentication, authorization, encrypted transport, careful logging, deletion controls, and clear decisions about data retention.

### External content

Place photos and names come from Google. Production use must follow Google Maps Platform display, attribution, caching, and data-use policies. AI output should be treated as a suggestion, not a guarantee of opening hours, safety, accessibility, price, or availability.

## 13. Important prototype limitations

- State is device-local and is not synchronized among travelers.
- There is no login, ownership, or access control.
- The planner is rules-based and is not a general AI model.
- The map starts at Chicago before the first search; a future version can geocode the configured destination.
- Search is not biased to the visible map bounds, so a specific city in the query is helpful.
- Photos are temporary Google-hosted URLs and are not cached by Quorum.
- Reordering is a simple global up/down operation, not drag-and-drop or route optimization.
- Day assignments do not validate opening hours or travel time.
- Expense totals do not calculate individual debts or settlements.
- localStorage may be cleared and is unsuitable for sensitive or high-value records.
- There are no real flight, hotel, booking, payment, or financial transactions.

## Potential TA Questions

### 1. Why use React Context instead of Redux?

The prototype has one small shared domain and straightforward actions. Context plus `useState` provides one source of truth without adding another framework. Redux could become useful later if state transitions, caching, or debugging needs become much more complex.

### 2. What causes every page to update after Trip Setup is saved?

`updateTrip()` changes the state owned by `TravelProvider`. Components that call `useTravel()` consume that context value, so React rerenders them with the new trip.

### 3. Why not save the complete Google `Place` object?

It contains class behavior and Google-specific objects that are not designed for JSON serialization. The application copies only plain fields it owns: ID, name, address, coordinates, and optional display data.

### 4. How are duplicate itinerary places prevented?

`addPlace()` compares the candidate's Google Place ID with every saved item's `placeId`. It refuses the insert when a match already exists.

### 5. Why is a Google API key in frontend code not treated like an OpenAI key?

Maps JavaScript keys must be sent by the browser and therefore are visible. They are protected with referrer/API restrictions and quotas. A model key authorizes server API usage and must remain secret behind a backend.

### 6. Why request a specific Places field list?

It avoids fetching unused data, keeps the returned object easier to understand, reduces payload, and follows Google's field-mask billing model.

### 7. What is modern about this Places implementation?

It uses the Promise-based `Place.searchByText()` API and `Place` objects instead of legacy `PlacesService` callbacks. It also uses `AdvancedMarkerElement` instead of deprecated legacy markers.

### 8. What happens if localStorage contains bad JSON?

`loadState()` catches the parse/validation error, restores the safe sample state, and exposes a warning instead of letting the React tree crash.

### 9. How would you make this multi-user?

Move the source of truth to a backend database, add authentication and group authorization, give records stable server IDs, expose validated APIs, and synchronize updates with polling, server-sent events, or WebSockets. localStorage could remain only as a cache.

### 10. How would you replace the mock planner with real AI safely?

Keep the current UI/service interface but have the service call a server endpoint. The server reads the secret key, validates the prompt, builds a limited trip context, applies rate limits and error handling, calls the model, and returns the response. The key never reaches React.

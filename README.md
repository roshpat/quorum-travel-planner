# Quorum Travel Planner

Quorum is a Purdue ECE Senior Design prototype for planning group trips in one shared workspace. It demonstrates how travelers can choose a destination, discover places, organize an itinerary, track expenses, and receive basic planning suggestions.

## Prototype features

- Trip dashboard with dates, budget, travelers, and progress
- Google Maps and Places search for real locations
- Saved locations and a day-by-day itinerary
- Shared expense tracking and budget totals
- Local prototype travel-planning assistant
- Responsive desktop and mobile interface

The included example trip uses our group: Dylan, Aakarsh, Zach, and Roshan as the travelers.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
```

Start the application:

```bash
npm run dev
```

If PowerShell blocks `npm.ps1`, use the Windows command wrapper:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local address shown by Vite, normally `http://localhost:5173`.

## Technology

React, TypeScript, Vite, React Router, Google Maps JavaScript API, and Google Places API.

## Current scope

This is a client-side prototype for demonstrating the user experience and technical integrations. It does not yet include user accounts, a cloud database, real-time collaboration, booking, payments, or a production AI service. The planning assistant currently uses local rules instead of an external model.

Additional implementation notes are available in [LEARNING_NOTES.md](./LEARNING_NOTES.md).

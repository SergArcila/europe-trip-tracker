# 🌍 Europe Trip Tracker 2025

Interactive trip tracker for a 16-day Europe trip across 6 cities: Madrid → Barcelona → Nice → Amsterdam → Munich → Berlin.

## Features
- ✅ **Checklist view** — food, sights, nightlife organized by category
- 📅 **Schedule view** — day-by-day itinerary with time slots
- 🗺️ **Maps** — OpenStreetMap + Google Maps integration per city
- 🔗 **Synced** — check items off in either view, stays in sync
- 🎟️ **Bookings tracker** — tickets and transport to-do list
- 📊 **Stats** — cities visited, distance traveled, completion %
- 🗺️ **Route map** — full trip route visualization
- 💾 **Persistent** — data saved in localStorage
- 📱 **Mobile-first** — designed for use on the go

## A trip by
Sergio Arcila · Bryan Cadalso · Christan Mira · Jon Pereria · Dillon Cloudfeliter · Shaun Cruz

## Deploy to Railway

1. Push to GitHub
2. Connect repo in [Railway](https://railway.app)
3. Railway auto-detects Node.js, runs `npm run build` then `npm start`
4. Done — your tracker is live

## Local Development

```bash
npm install
npm run dev
```

## Tech
- React 18 + Vite
- Zero dependencies beyond React
- Vanilla CSS with CSS variables (auto light/dark mode)
- OpenStreetMap embeds + Google Maps deep links

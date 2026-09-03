# Map Provider — Decision Aid

Phase 0 task: "Select map provider" (still open -- this is background for
whoever/whichever meeting makes the call, not a decision made here).

PRD section 10 allows: "Mapbox, Leaflet or another approved map provider."

## Leaflet (+ OpenStreetMap tiles)

- Free, open-source, no API key required for basic OSM tiles.
- Good React support via `react-leaflet`.
- Fully custom marker clustering available (`react-leaflet-cluster`),
  useful for the "anonymous clusters" requirement in PRD 8.4.
- Downsides: less polished default styling, no built-in usage
  analytics/quotas to worry about (which is also a plus for a class
  project -- nothing to accidentally exceed).

## Mapbox

- Free tier is generous (50k map loads/month as of Mapbox's published
  pricing -- verify current numbers before committing, pricing pages
  change) but does require an API key and a Mapbox account.
- Nicer default styling, smoother interactions, built-in clustering.
- Slightly more setup: `VITE_MAPBOX_TOKEN` env var, account creation,
  and mapbox-gl-js or `react-map-gl` as a dependency.

## Recommendation for a student MVP

Leaflet is the lower-friction choice: no account/API key to manage across
7 teammates, no risk of hitting a usage cap during marking/demo, and
`react-leaflet` covers everything the MVP needs (area markers, activity/
event markers, clustering). Mapbox is worth it only if the team wants
Mapbox's nicer default visual polish and is fine with everyone needing a
Mapbox account + token.

Either way, once decided:
- If Mapbox: add `VITE_MAPBOX_TOKEN` to `.env.example` (already has a
  commented-out placeholder) and `docs/backend/environment-setup.md`.
- If Leaflet: no new env var needed at all.

This doesn't block Phase 0 migrations/seed work -- it only blocks the
frontend's "map placeholder" task and, later, Phase 3's real-time map.

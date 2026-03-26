# 🌪️ Tornado Simulator

A multi-variable tornado damage modeler with real census population data and physics-based modeling.

**[▶ Launch Simulator](https://www.tornadosimulator.net/)**

## Features

- **Interactive Leaflet map** with 4 view modes: Satellite, Street Map, Topo, Dark
- **Click anywhere** to place a tornado — real population data loads automatically
- **US Census Bureau data**: County-level population & housing via ACS 5-Year (2022) + Geocoder API
- **Statistics Canada data**: 288 census divisions from 2021 Census, Table 98-10-0002-02
- **EF0–EF5 scale** with structural fragility curves (HAZUS-MH / TTU Wind Engineering)
- **Casualty modeling**: Simmons & Sutter (2005), Ashley (2007) — shelter type, warning time, time of day
- **30+ adjustable parameters**: wind speed, path dimensions, housing mix, infrastructure, crops, livestock
- **Economic damage estimation**: residential, infrastructure, vehicles, crops, emergency response, business interruption
- **Historical comparisons**: Joplin 2011, Moore 2013, Tuscaloosa 2011, Tri-State 1925, and more
- **Zero damage on water/uninhabited areas** — ocean, arctic tundra, remote territories correctly return 0

## Data Sources

| Source | Coverage | Detail |
|--------|----------|--------|
| US Census Bureau ACS 5-Year (2022) | 3,143 US counties | Population, housing units, land area |
| US Census Geocoder API | Continental US | Reverse geocode lat/lng → county FIPS |
| Statistics Canada 2021 Census | 288 census divisions | Population, dwellings, land area |
| HAZUS-MH / TTU Wind Engineering | Structure fragility | Destruction probability curves |
| Simmons & Sutter (2005) | Casualty rates | By shelter type and EF rating |
| Ashley (2007) | Night lethality | 2.5× multiplier for nighttime |
| NOAA Storm Data | Injury ratio | ~15:1 injury-to-fatality |

## Tech Stack

Single self-contained HTML file — no build step required:
- React 18 (CDN)
- Babel Standalone (CDN)
- Leaflet.js 1.9.4 (CDN) with Esri/OSM/CartoDB tiles
- US Census Data API + Geocoder API (no key needed, 500 req/day)

## License

MIT

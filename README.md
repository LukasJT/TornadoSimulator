# 🌪️ Tornado Simulator

A multi-variable tornado damage modeler with physics-based modeling for structural damage, casualties, agricultural impact, infrastructure destruction, and economic loss estimation.

![EF Scale](https://img.shields.io/badge/EF0--EF5-Supported-red)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

## Features

### Storm Parameters
- Wind speed (65–320 mph, auto-mapped to EF0–EF5)
- Central pressure deficit, path length/width, forward speed
- Direction of travel, rainfall rate, hail size
- Multi-vortex configuration (1–8 sub-vortices)
- Tornado lifespan

### Damage Modeling
- **Structural fragility curves** based on HAZUS-MH / TTU Wind Engineering
  - Mobile homes, wood frame, brick/masonry, reinforced concrete
  - Gaussian wind profile across path width (center peak, edge decay)
- **Infrastructure**: power lines, cell towers, bridges, water towers, gas lines, vehicles
- **Agriculture**: crop type & growth stage, livestock density, hail + wind damage
- **Flood damage** from heavy rainfall

### Casualty Model
Based on peer-reviewed tornado fatality research:
- Shelter-type-specific fatality rates (Simmons & Sutter, 2005)
- Warning lead time effectiveness (~1.8% reduction per minute)
- Nighttime lethality multiplier: 2.5× (Ashley, 2007)
- Community preparedness index
- 15:1 injury-to-fatality ratio (NOAA Storm Data)

### Economic Impact
- Residential, infrastructure, vehicle, crop, livestock losses
- Emergency response costs
- Business interruption (15% of direct damage)
- Per-structure, per-capita, and per-mile breakdowns

### Historical Comparisons
Simulated tornado compared against:
- Joplin, MO 2011 (EF5)
- Moore, OK 2013 (EF5)
- Tuscaloosa, AL 2011 (EF4)
- Greensburg, KS 2007 (EF5)
- El Reno, OK 2013 (EF3)
- Tri-State 1925 (EF5)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
npm run build
npm run preview
```

## Presets

| Preset | Wind | Path | Setting |
|--------|------|------|---------|
| Rural EF3 | 150 mph | 15 mi × 600 yd | Farmland, low density |
| Suburban EF4 | 180 mph | 20 mi × 1200 yd | Mixed residential |
| Urban EF5 | 250 mph | 25 mi × 1800 yd | Dense city, nighttime |
| Joplin 2011 | 225 mph | 22 mi × 1760 yd | Historical recreation |

## Model References

- **Fragility curves**: HAZUS-MH Multi-Hazard Loss Estimation Methodology (FEMA); TTU Wind Science & Engineering Research Center
- **Casualty modeling**: Simmons, K.M. & Sutter, D. (2005). "WSR-88D Radar, Tornado Warnings, and Tornado Casualties." *Weather and Forecasting*, 20(3)
- **Night lethality**: Ashley, W.S. (2007). "Spatial and Temporal Analysis of Tornado Fatalities in the United States: 1880–2005." *Weather and Forecasting*, 22(6)
- **Injury ratios**: NOAA Storm Prediction Center Storm Data

## License

MIT

export const PRESETS = {
  rural_ef3: {
    label: "Rural EF3",
    windSpeed: 150, pressureDeficit: 80, pathLength: 15, pathWidth: 600,
    forwardSpeed: 40, direction: 225, rainfall: 2, hailSize: 2, subVortices: 1, lifespan: 20,
    terrain: "flat_plains", timeOfDay: 14, season: "spring",
    housingDensity: 20, mobileHomePct: 25, woodFramePct: 55, brickPct: 15, concretePct: 5,
    powerLinesPerMile: 3, cellTowers: 5, bridges: 2, waterTowers: 1, gasLinesPerMile: 1,
    vehiclesPerMile: 5,
    cropType: "corn", growthStage: "mid_season", cropAcresPct: 70,
    popDensity: 30, basementPct: 20, shelterPct: 5, warningLeadTime: 15, preparedness: 0.5,
    livestockDensity: 15, curvature: 0,
  },
  suburban_ef4: {
    label: "Suburban EF4",
    windSpeed: 180, pressureDeficit: 100, pathLength: 20, pathWidth: 1200,
    forwardSpeed: 45, direction: 230, rainfall: 3, hailSize: 3, subVortices: 3, lifespan: 30,
    terrain: "rolling_hills", timeOfDay: 14, season: "spring",
    housingDensity: 500, mobileHomePct: 10, woodFramePct: 60, brickPct: 25, concretePct: 5,
    powerLinesPerMile: 15, cellTowers: 30, bridges: 8, waterTowers: 5, gasLinesPerMile: 8,
    vehiclesPerMile: 80,
    cropType: "none", growthStage: "mid_season", cropAcresPct: 10,
    popDensity: 2500, basementPct: 40, shelterPct: 10, warningLeadTime: 20, preparedness: 0.7,
    livestockDensity: 0, curvature: 0,
  },
  urban_ef5: {
    label: "Urban EF5",
    windSpeed: 250, pressureDeficit: 130, pathLength: 25, pathWidth: 1800,
    forwardSpeed: 50, direction: 240, rainfall: 4, hailSize: 4, subVortices: 5, lifespan: 40,
    terrain: "urban", timeOfDay: 2, season: "spring",
    housingDensity: 2000, mobileHomePct: 5, woodFramePct: 40, brickPct: 35, concretePct: 20,
    powerLinesPerMile: 30, cellTowers: 80, bridges: 20, waterTowers: 10, gasLinesPerMile: 20,
    vehiclesPerMile: 200,
    cropType: "none", growthStage: "mid_season", cropAcresPct: 0,
    popDensity: 8000, basementPct: 30, shelterPct: 15, warningLeadTime: 10, preparedness: 0.6,
    livestockDensity: 0, curvature: 0,
  },
  joplin_2011: {
    label: "Joplin 2011",
    windSpeed: 225, pressureDeficit: 120, pathLength: 22, pathWidth: 1760,
    forwardSpeed: 32, direction: 267, rainfall: 2, hailSize: 2.5, subVortices: 4, lifespan: 38,
    terrain: "urban", timeOfDay: 20, season: "spring",
    housingDensity: 1200, mobileHomePct: 12, woodFramePct: 55, brickPct: 25, concretePct: 8,
    powerLinesPerMile: 20, cellTowers: 40, bridges: 10, waterTowers: 6, gasLinesPerMile: 12,
    vehiclesPerMile: 120,
    cropType: "none", growthStage: "mid_season", cropAcresPct: 5,
    popDensity: 4000, basementPct: 25, shelterPct: 8, warningLeadTime: 17, preparedness: 0.5,
    livestockDensity: 0, curvature: 0,
  },
};

// ─── URL PARAMS (deep-link from articles: "Simulate this tornado") ─────────
// Accepted params:
//   ef       0-5             set windSpeed and pressureDeficit to that EF band
//   length   miles           pathLength (0.1 - 200)
//   width    miles           pathWidth in yards (1 mile ≈ 1760 yd)
//   lat, lon float           starting position
//   name     string          just shown, not stored in state
//   preset   key             one of PRESETS keys (overrides ef/length/width fallbacks)
export function parseSimUrlParams(search) {
  try {
    const q = new URLSearchParams(search);
    if (![...q.keys()].length) return null;
    const num = (k) => {
      const v = q.get(k);
      if (v == null) return null;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };
    const sample = q.get("sample") === "12mi";
    const retrace = q.get("sample") === "retrace";
    const preset = q.get("preset");
    const base = (preset && PRESETS[preset]) ? { ...PRESETS[preset] } : { ...PRESETS.suburban_ef4 };
    const ef = num("ef");
    if (ef != null && ef >= 0 && ef <= 5) {
      // Center of each EF wind range
      const winds = { 0: 75, 1: 100, 2: 125, 3: 150, 4: 180, 5: 220 };
      const deficits = { 0: 30, 1: 50, 2: 70, 3: 90, 4: 110, 5: 130 };
      base.windSpeed = winds[Math.round(ef)];
      base.pressureDeficit = deficits[Math.round(ef)];
    }
    const len = num("length");
    if (len != null && len >= 0.1 && len <= 300) base.pathLength = len;
    const w = num("width");
    if (w != null) {
      // Width may be provided as miles (e.g. 1.7) or yards (e.g. 1760)
      base.pathWidth = Math.min(5000, Math.max(10, w < 20 ? Math.round(w * 1760) : Math.round(w)));
    }
    let waypoints;
    if (sample || retrace) {
      Object.assign(base, {pathLength: 12, pathWidth: 440, forwardSpeed: 30, popDensity: 600, housingDensity: 240});
      const origin = [37.08, -94.51];
      const miles = retrace ? 6 : 12;
      waypoints = [origin, [origin[0] + miles * 180 / (Math.PI * 3958.7613), origin[1]]];
      if (retrace) waypoints.push(origin);
    }
    if (q.get("v") === "1" && q.has("points")) {
      const raw = q.get("points");
      const values = raw.length <= 2600 ? raw.split(";").map(point => point.split(",").map(value => value.trim() ? Number(value) : NaN)) : [];
      if (values.length >= 2 && values.length <= 100 && values.every(([lat, lon, ...extra]) => Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180 && !extra.length)) waypoints = values;
    }
    const speed = num("speedMph");
    if (speed != null && speed >= 5 && speed <= 80) base.forwardSpeed = speed;
    const explicitWidth = num("widthYd");
    if (explicitWidth != null && explicitWidth >= 10 && explicitWidth <= 5000) base.pathWidth = explicitWidth;
    const lat = waypoints?.[0][0] ?? num("lat");
    const lon = waypoints?.[0][1] ?? num("lon") ?? num("lng");
    const name = q.get("name");
    return { params: base, waypoints, manual: sample || retrace, lat: lat != null && Math.abs(lat) <= 90 ? lat : null, lon: lon != null && Math.abs(lon) <= 180 ? lon : null, name };
  } catch (e) {
    return null;
  }
}

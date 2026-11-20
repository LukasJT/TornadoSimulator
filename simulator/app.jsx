import { PRESETS, parseSimUrlParams } from './scenarios.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { generatePathPoints, pathLengthFromPoints, generateSwathPolygon } from './geometry.js';
import * as model from './model.js';
const { EF_SCALE, interpolateFragility, FATALITY_RATES, findCanadianCensusDivision, WORLD_COUNTRIES, WORLD_CITIES, getConstructionProfile, formatLocalCurrency, findWorldCountry, runMultiSegmentSimulation, runSimulation, HISTORICAL, fmt, numFmt } = model;
const { useState, useCallback, useMemo, useEffect, useRef } = React;
function Slider({ label, value, onChange, min, max, step = 1, unit = "", info }) {
  const id = `parameter-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commitValue = (rawValue) => {
    const parsed = Number(rawValue);
    if (rawValue.trim() === "" || !Number.isFinite(parsed)) { setDraft(String(value)); return; }
    const clamped = Math.min(max, Math.max(min, parsed));
    const snapped = Number((min + Math.round((clamped - min) / step) * step).toFixed(6));
    const next = Math.min(max, Math.max(min, snapped));
    setDraft(String(next));
    onChange(next);
  };
  return (
    <div className="parameter-control" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 10, fontSize: 11, color: "#b0b0b0", marginBottom: 6 }}>
        <label htmlFor={id} title={info} style={{ lineHeight: 1.35 }}>{label}</label>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            id={id}
            name={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft}
            aria-label={`${label}${unit ? ` (${unit.trim()})` : ""}`}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={(event) => commitValue(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
            aria-describedby={info ? `${id}-hint` : undefined}
            style={{
              width: 74, minHeight: 32, padding: "5px 7px", background: "#15152a",
              color: "#f5f5f5", border: "1px solid #3c3c58", borderRadius: 4,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 12,
              fontVariantNumeric: "tabular-nums", textAlign: "right",
            }}
          />
          {unit && <span aria-hidden="true" style={{ minWidth: 30, color: "#9ea3b5" }}>{unit.trim()}</span>}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        aria-label={`${label}${unit ? ` (${unit.trim()})` : ""}`}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#ef5350", minHeight: 24, cursor: "pointer" }}
      />
      {info && <div id={`${id}-hint`} style={{ color: "#7f8498", fontSize: 10, lineHeight: 1.4 }}>{info}</div>}
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#b0b0b0", marginBottom: 3 }}>{label}</div>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "5px 8px", background: "#1a1a2e", color: "#e0e0e0",
          border: "1px solid #333", borderRadius: 4, fontSize: 11, fontFamily: "inherit"
        }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

// ─── SECTION COMPONENT ──────────────────────────────────────────────────────

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          padding: "6px 0", borderBottom: "1px solid #222", marginBottom: open ? 8 : 0,
          userSelect: "none", borderTop: 0, borderLeft: 0, borderRight: 0, background: "transparent",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e0e0e0" }}>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#666", transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </button>
      {open && <div style={{ paddingLeft: 4 }}>{children}</div>}
    </div>
  );
}

function CoordinatePathEditor({ points, onChange, onFinish }) {
  const updatePoint = (index, coordinateIndex, rawValue) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    const bounded = coordinateIndex === 0
      ? Math.min(90, Math.max(-90, parsed))
      : Math.min(180, Math.max(-180, parsed));
    const next = points.map((point, pointIndex) => pointIndex === index
      ? point.map((coordinate, valueIndex) => valueIndex === coordinateIndex ? bounded : coordinate)
      : point
    );
    onChange(next);
  };

  const addPoint = () => {
    const previous = points[points.length - 1] || [37.08, -94.51];
    onChange([...points, [Number(previous[0].toFixed(4)), Number((previous[1] + 0.1).toFixed(4))]]);
  };

  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #263552" }}>
      <div style={{ color: "#d4d8e4", fontSize: 11, lineHeight: 1.45, marginBottom: 8 }}>
        Enter at least 2 path points. Latitude must be −90 to 90; longitude must be −180 to 180.
      </div>
      <div style={{ display: "grid", gap: 7 }}>
        {points.map((point, index) => (
          <fieldset key={index} style={{ border: 0, padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6, alignItems: "end" }}>
            <legend style={{ gridColumn: "1 / -1", fontSize: 10, color: "#8e94a8", marginBottom: 2 }}>Point {index + 1}</legend>
            <label style={{ fontSize: 10, color: "#aeb3c4" }}>
              Latitude
              <input type="number" inputMode="decimal" min="-90" max="90" step="0.0001" value={point[0]}
                onChange={(event) => updatePoint(index, 0, event.target.value)}
                style={{ width: "100%", minHeight: 34, marginTop: 3, padding: "6px", color: "#fff", background: "#15152a", border: "1px solid #3c3c58", borderRadius: 4, fontSize: 12 }} />
            </label>
            <label style={{ fontSize: 10, color: "#aeb3c4" }}>
              Longitude
              <input type="number" inputMode="decimal" min="-180" max="180" step="0.0001" value={point[1]}
                onChange={(event) => updatePoint(index, 1, event.target.value)}
                style={{ width: "100%", minHeight: 34, marginTop: 3, padding: "6px", color: "#fff", background: "#15152a", border: "1px solid #3c3c58", borderRadius: 4, fontSize: 12 }} />
            </label>
            <button type="button" aria-label={`Remove point ${index + 1}`} onClick={() => onChange(points.filter((_, pointIndex) => pointIndex !== index))}
              style={{ minWidth: 34, minHeight: 34, border: "1px solid #3c3c58", borderRadius: 4, background: "#1a1a2e", color: "#d9dce7", cursor: "pointer" }}>×</button>
          </fieldset>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
        <button type="button" onClick={addPoint} style={{ flex: 1, minHeight: 36, border: "1px solid #3c3c58", borderRadius: 4, background: "#1a1a2e", color: "#d9dce7", cursor: "pointer", fontWeight: 700 }}>Add point</button>
        <button type="button" onClick={onFinish} disabled={points.length < 2}
          style={{ flex: 1, minHeight: 36, border: 0, borderRadius: 4, background: points.length >= 2 ? "#2e7d32" : "#29293b", color: points.length >= 2 ? "#fff" : "#777b8c", cursor: points.length >= 2 ? "pointer" : "default", fontWeight: 700 }}>Use path</button>
      </div>
    </div>
  );
}

// ─── PATH GENERATION HELPERS ──────────────────────────────────────────────

// Generate path points for any mode. Returns array of [lat, lng] (10+ points for smooth rendering)
function InteractiveMap({ enabledCountries, tornadoLat, tornadoLng, onPlaceTornado, params, result, mapStyle, pathMode, customWaypoints, onAddWaypoint, isDrawing, simProgress, simRunning }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({});
  const markersRef = useRef([]);

  // Map bounds per country selection
  const boundsForCountry = useMemo(() => {
    if (enabledCountries === "us") return [[24, -125], [50, -66]];
    if (enabledCountries === "canada") return [[41, -141], [60, -52]];
    if (enabledCountries === "world") return [[-60, -180], [75, 180]];
    return [[24, -141], [60, -52]];
  }, [enabledCountries]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (typeof L === "undefined") return;

    if (!window.L) return;
    const map = L.map(containerRef.current, {
      center: [39, -98],
      zoom: 4,
      zoomControl: false,
      attributionControl: true,
      maxBounds: [[10, -170], [72, -40]],
      maxBoundsViscosity: 1.0,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Tile layers
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18, attribution: "Tiles &copy; Esri and imagery contributors" }
    );
    const streets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
    );
    const topo = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18, attribution: "Tiles &copy; Esri and contributors" }
    );
    const dark = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' }
    );

    layersRef.current = { satellite, streets, topo, dark };

    // Apply initial style
    const initial = mapStyle === "satellite" ? satellite : mapStyle === "topo" ? topo : mapStyle === "dark" ? dark : streets;
    initial.addTo(map);

    // Tornado Alley polygon
    const alley = L.polygon([
      [48,-104],[48,-94],[42,-88],[35,-88],[28,-95],[28,-100],[35,-104],[42,-104]
    ], { color: "#ef5350", fillColor: "#ef5350", fillOpacity: 0.06, weight: 1, opacity: 0.3, dashArray: "4 4" });
    alley.addTo(map);

    // Canada tornado zone
    const caZone = L.polygon([
      [49,-110],[55,-110],[55,-95],[49,-95],[49,-85],[45,-75],[42,-80],[43,-85]
    ], { color: "#ffb74d", fillColor: "#ffb74d", fillOpacity: 0.04, weight: 1, opacity: 0.2, dashArray: "4 4" });
    caZone.addTo(map);

    // Click handler
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const rlat = Math.round(lat * 100) / 100;
      const rlng = Math.round(lng * 100) / 100;
      // In draw mode, clicks add waypoints; in other modes, clicks place tornado
      if (window.__tornadoDrawMode) {
        if (typeof window.__tornadoAddWaypoint === "function") {
          window.__tornadoAddWaypoint(rlat, rlng);
        }
      } else {
        onPlaceTornado(rlat, rlng);
      }
    });

    // Double-click finishes drawing
    map.on("dblclick", (e) => {
      if (window.__tornadoDrawMode && typeof window.__tornadoFinishDraw === "function") {
        window.__tornadoFinishDraw();
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch tile layer when mapStyle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layers = layersRef.current;
    Object.values(layers).forEach((l) => { if (map.hasLayer(l)) map.removeLayer(l); });
    const target = mapStyle === "satellite" ? layers.satellite : mapStyle === "topo" ? layers.topo : mapStyle === "dark" ? layers.dark : layers.streets;
    if (target) target.addTo(map);
  }, [mapStyle]);

  // Sync draw mode state to window globals for Leaflet click handler
  useEffect(() => {
    window.__tornadoDrawMode = isDrawing;
    window.__tornadoAddWaypoint = (lat, lng) => { if (onAddWaypoint) onAddWaypoint(lat, lng); };
    const map = mapRef.current;
    if (map) {
      const container = map.getContainer();
      container.style.cursor = isDrawing ? "crosshair" : "crosshair";
      if (isDrawing) {
        map.doubleClickZoom.disable();
      } else {
        map.doubleClickZoom.enable();
      }
    }
    return () => {
      window.__tornadoDrawMode = false;
      window.__tornadoAddWaypoint = null;
    };
  }, [isDrawing, onAddWaypoint]);

  // Fit bounds when country changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(boundsForCountry, { padding: [20, 20], animate: true });
  }, [boundsForCountry]);

  // Update tornado markers and path
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Draw waypoint markers during draw mode (even before path is complete)
    if (isDrawing && customWaypoints.length > 0) {
      const wpLine = L.polyline(customWaypoints, {
        color: "#4fc3f7", weight: 2, opacity: 0.8, dashArray: "4 4"
      }).addTo(map);
      markersRef.current.push(wpLine);
      customWaypoints.forEach((wp, i) => {
        const wpIcon = L.divIcon({
          html: `<div style="width:10px;height:10px;background:${i === 0 ? '#4fc3f7' : '#81c784'};border-radius:50%;border:2px solid #fff;font-size:0"></div>`,
          className: "", iconSize: [14, 14], iconAnchor: [7, 7],
        });
        const wpMarker = L.marker(wp, { icon: wpIcon }).addTo(map);
        markersRef.current.push(wpMarker);
      });
    }

    if (tornadoLat == null || tornadoLng == null) return;
    // In draw mode, don't render the simulation path until drawing is finished
    if (pathMode === "draw" && isDrawing) return;

    // Generate path points based on mode
    const pathPoints = generatePathPoints(tornadoLat, tornadoLng, params, pathMode, customWaypoints);
    if (pathPoints.length < 2) return;

    const startPt = pathPoints[0];
    const endPt = pathPoints[pathPoints.length - 1];

    // During simulation, calculate current position along path
    const currentProgress = simRunning ? simProgress : 1;
    const currentIdx = Math.min(Math.floor(currentProgress * (pathPoints.length - 1)), pathPoints.length - 2);
    const localFrac = (currentProgress * (pathPoints.length - 1)) - currentIdx;
    const currentLat = pathPoints[currentIdx][0] + localFrac * (pathPoints[currentIdx + 1][0] - pathPoints[currentIdx][0]);
    const currentLng = pathPoints[currentIdx][1] + localFrac * (pathPoints[currentIdx + 1][1] - pathPoints[currentIdx][1]);

    // Tornado marker — at current position during sim, at start otherwise
    const tornadoPos = simRunning ? [currentLat, currentLng] : startPt;
    const icon = L.divIcon({
      html: `<div style="font-size:28px;filter:drop-shadow(0 0 ${simRunning ? '12' : '8'}px rgba(239,83,80,${simRunning ? '1.0' : '0.8'}));${simRunning ? 'animation:spin 0.5s linear infinite;' : ''}">🌪️</div>`,
      className: "", iconSize: [32, 32], iconAnchor: [16, 16],
    });
    const marker = L.marker(tornadoPos, { icon }).addTo(map);
    markersRef.current.push(marker);

    // Path line — full path always visible (shows planned route)
    const pathLine = L.polyline(pathPoints, {
      color: simRunning ? "#666" : "#fff", weight: 2, opacity: simRunning ? 0.4 : 0.7, dashArray: "6 4"
    }).addTo(map);
    markersRef.current.push(pathLine);

    // Damage swath — during sim, only show up to current position
    const visiblePathPoints = simRunning
      ? pathPoints.slice(0, currentIdx + 2).map((pt, i, arr) => {
          if (i === arr.length - 1) return [currentLat, currentLng];
          return pt;
        })
      : pathPoints;

    if (visiblePathPoints.length >= 2) {
      const swathCoords = generateSwathPolygon(visiblePathPoints, params.pathWidth);
      if (swathCoords.length > 2) {
        const swath = L.polygon(swathCoords, {
          color: result.ef.color, fillColor: result.ef.color,
          fillOpacity: simRunning ? 0.35 : 0.25, weight: 1, opacity: 0.6,
        }).addTo(map);
        markersRef.current.push(swath);
      }
    }

    // Traversed path line (bright, solid) during simulation
    if (simRunning && visiblePathPoints.length >= 2) {
      const traversedLine = L.polyline(visiblePathPoints, {
        color: result.ef.color, weight: 3, opacity: 0.9
      }).addTo(map);
      markersRef.current.push(traversedLine);
    }

    // End point marker
    const endIcon = L.divIcon({
      html: `<div style="width:8px;height:8px;background:${result.ef.color};border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px ${result.ef.color};opacity:${simRunning && simProgress < 1 ? '0.3' : '1'}"></div>`,
      className: "", iconSize: [12, 12], iconAnchor: [6, 6],
    });
    const endMarker = L.marker(endPt, { icon: endIcon }).addTo(map);
    markersRef.current.push(endMarker);

    // Start point marker during simulation
    if (simRunning) {
      const startIcon = L.divIcon({
        html: '<div style="width:8px;height:8px;background:#4fc3f7;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px #4fc3f7"></div>',
        className: "", iconSize: [12, 12], iconAnchor: [6, 6],
      });
      const startMarker = L.marker(startPt, { icon: startIcon }).addTo(map);
      markersRef.current.push(startMarker);
    }

    // Info popup (only when not simulating)
    if (!simRunning) {
      const actualPathMi = pathMode === "draw" ? pathLengthFromPoints(pathPoints) : params.pathLength;
      marker.bindPopup(
        `<div style="font-family:monospace;font-size:12px;line-height:1.6">
          <strong style="color:${result.ef.color}">${result.ef.rating}</strong> — ${result.peakWind} mph peak<br>
          Path: ${actualPathMi.toFixed(1)} mi × ${params.pathWidth} yd ${pathMode !== "straight" ? "(" + pathMode + ")" : ""}<br>
          Fatalities: <span style="color:#ef5350">${result.fatalities}</span> | Injuries: ${result.injuries}<br>
          Damage: <strong>${result.totalEconomicImpact >= 1e9 ? "$" + (result.totalEconomicImpact / 1e9).toFixed(2) + "B" : "$" + (result.totalEconomicImpact / 1e6).toFixed(1) + "M"}</strong>
        </div>`,
        { className: "tornado-popup" }
      );
    }

    // Waypoint markers for draw mode (only when not simulating)
    if (!simRunning && pathMode === "draw" && customWaypoints.length > 2) {
      for (let i = 1; i < customWaypoints.length - 1; i++) {
        const wpIcon = L.divIcon({
          html: `<div style="width:6px;height:6px;background:#81c784;border-radius:50%;border:1px solid #fff;font-size:0"></div>`,
          className: "", iconSize: [8, 8], iconAnchor: [4, 4],
        });
        const wpMk = L.marker(customWaypoints[i], { icon: wpIcon }).addTo(map);
        markersRef.current.push(wpMk);
      }
    }

    // Damage radius circles at intervals along path (only for completed/static view)
    if (!simRunning) {
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        const frac = i / (steps + 1);
        const idx = Math.floor(frac * (pathPoints.length - 1));
        const cPt = pathPoints[Math.min(idx, pathPoints.length - 1)];
        const radiusMeters = (params.pathWidth * 0.9144 / 2) * (1 - Math.abs(frac - 0.5));
        const circle = L.circle(cPt, {
          radius: Math.max(radiusMeters, 500),
          color: result.ef.color, fillColor: result.ef.color,
          fillOpacity: 0.08, weight: 0.5, opacity: 0.3,
        }).addTo(map);
        markersRef.current.push(circle);
      }
    }

  }, [tornadoLat, tornadoLng, params.pathLength, params.pathWidth, params.direction, params.curvature, result, pathMode, customWaypoints, isDrawing, simProgress, simRunning]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }} />
  );
}

// ─── PATH VISUALIZATION ─────────────────────────────────────────────────────

function TornadoPathViz({ params, result }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = "#0a0a18";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "#151530";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Scale: path fits in view
      const margin = 60;
      const pathLenPx = w - margin * 2;
      const milesPerPx = params.pathLength / pathLenPx;
      const pathWidthPx = Math.max(8, (params.pathWidth / 1760) / milesPerPx);

      // Direction
      const dirRad = (params.direction - 90) * Math.PI / 180;
      const cx = w / 2, cy = h / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(dirRad);

      // Damage swath with gaussian wind profile
      const segments = 80;
      const segLen = pathLenPx / segments;
      const progress = Math.min(frame / 120, 1);

      for (let i = 0; i < segments * progress; i++) {
        const x = -pathLenPx / 2 + i * segLen;
        // Gaussian cross-section: wind decays from center
        for (let j = -20; j <= 20; j++) {
          const yOff = (j / 20) * pathWidthPx;
          const gaussFactor = Math.exp(-0.5 * (j / 8) ** 2);
          const wobble = Math.sin(i * 0.3 + frame * 0.02) * pathWidthPx * 0.1;

          const intensity = gaussFactor * (result.peakWind / 250);
          const r = Math.round(200 * intensity + 55);
          const g = Math.round(80 * (1 - intensity) + 20);
          const b = Math.round(40);
          const a = gaussFactor * 0.6;

          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillRect(x, yOff + wobble, segLen + 1, pathWidthPx / 18);
        }
      }

      // Tornado vortex indicator
      const vortexX = -pathLenPx / 2 + pathLenPx * ((frame % 240) / 240);
      if (progress >= 1) {
        for (let v = 0; v < params.subVortices; v++) {
          const angle = (frame * 0.1) + (v * Math.PI * 2 / params.subVortices);
          const vr = pathWidthPx * 0.15;
          const vx = vortexX + Math.cos(angle) * vr;
          const vy = Math.sin(angle) * vr;

          const grad = ctx.createRadialGradient(vx, vy, 0, vx, vy, pathWidthPx * 0.3);
          grad.addColorStop(0, "rgba(255,255,255,0.3)");
          grad.addColorStop(0.3, result.ef.color + "80");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(vx, vy, pathWidthPx * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Scale bar
      ctx.fillStyle = "#555";
      ctx.font = "10px 'JetBrains Mono', monospace";
      const scaleBarMiles = Math.max(1, Math.round(params.pathLength / 5));
      const scaleBarPx = scaleBarMiles / milesPerPx;
      ctx.fillRect(20, h - 30, scaleBarPx, 2);
      ctx.fillText(`${scaleBarMiles} mi`, 20, h - 15);

      // Direction arrow
      ctx.fillStyle = "#888";
      ctx.font = "10px sans-serif";
      const arrowX = w - 50, arrowY = 30;
      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(dirRad);
      ctx.fillStyle = "#ef5350";
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(6, 8);
      ctx.lineTo(-6, 8);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#888";
      ctx.fillText(`${params.direction}°`, arrowX - 8, arrowY + 22);

      // Labels
      ctx.fillStyle = result.ef.color;
      ctx.font = "bold 14px 'JetBrains Mono', monospace";
      ctx.fillText(`${result.ef.rating} — ${result.peakWind} mph peak`, 20, 25);
      ctx.fillStyle = "#888";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`Path: ${params.pathLength} mi × ${params.pathWidth} yd | Area: ${result.pathAreaSqMi} sq mi`, 20, 42);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [params, result]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 8, display: "block" }} />
  );
}

// ─── STAT CARD ──────────────────────────────────────────────────────────────

function ScenarioStatistics({ params, result, routeMiles, pathPoints, densitySource, pathMode }) {
  const [pinned, setPinned] = useState(null);
  const [share, setShare] = useState(null);
  const area = routeMiles * params.pathWidth / 1760;
  const travel = params.forwardSpeed > 0 ? routeMiles / params.forwardSpeed * 60 : null;
  const rows = [
    ['Endpoint displacement', (pathPoints?.length >= 2 ? pathLengthFromPoints([pathPoints[0], pathPoints.at(-1)]).toFixed(2) + ' mi' : 'Unavailable'), 'Distance from start to end'],
    ['Density source', densitySource === 'manual' ? 'Scenario inputs' : 'Location estimates', densitySource === 'manual' ? params.popDensity + ' people/mi² · ' + params.housingDensity + ' dwellings/mi²' : 'See coverage and source in the result details'],
    ['Route distance', routeMiles.toFixed(1) + ' mi', (routeMiles * 1.609344).toFixed(1) + ' km along the centerline'],
    ['Swept area', area.toFixed(2) + ' sq mi', (area * 2.589988).toFixed(2) + ' km² · overlaps not removed'],
    ['Travel time', travel == null ? 'Stationary' : travel.toFixed(1) + ' min', 'At the selected forward speed'],
    ['Point exposure', Number(result.exposureDuration).toFixed(1) + ' min', 'Width ÷ speed · not warning lead time'],
    ['People in path', numFmt(result.populationInPath), 'Density-based estimate'],
    ['Buildings affected', numFmt(result.totalDestroyed + result.totalDamaged), numFmt(result.totalDestroyed) + ' destroyed + ' + numFmt(result.totalDamaged) + ' damaged'],
    ['Wind speed', params.windSpeed + ' mph', Math.round(params.windSpeed * 1.609344) + ' km/h · ' + (params.windSpeed * 0.44704).toFixed(1) + ' m/s'],
    ['Path width', numFmt(params.pathWidth) + ' yd', Math.round(params.pathWidth * 0.9144) + ' m']
  ];
  function sharePath() {
    const url = new URL('/simulator/', location.origin);
    url.searchParams.set('v', '1');
    url.searchParams.set('widthYd', params.pathWidth);
    url.searchParams.set('speedMph', params.forwardSpeed);
    url.searchParams.set('points', pathPoints.map(point => point.map(value => value.toFixed(7)).join(',')).join(';'));
    url.hash = 'root';
    setShare(url.href);
  }
  return <section className="scenario-statistics" aria-labelledby="statistics-title"><h3 id="statistics-title">Your scenario at a glance</h3><dl>{rows.map(([label, value, note]) => <div key={label}><dt>{label}</dt><dd>{value}<small>{note}</small></dd></div>)}</dl>
    <div className="scenario-actions">
      <button type="button" onClick={() => setPinned({ miles: routeMiles, area, travel })}>Pin route result</button>
      {pathMode === 'draw' && pathPoints.length >= 2 && pathPoints.length <= 100 && <button type="button" onClick={sharePath}>Get a link to this path</button>}
    </div>
    {pinned && <p role="status">Pinned route: {pinned.miles.toFixed(2)} mi, {pinned.area.toFixed(2)} sq mi, {pinned.travel?.toFixed(1) ?? '—'} min. Current minus pinned: {(routeMiles - pinned.miles).toFixed(2)} mi, {(area - pinned.area).toFixed(2)} sq mi{pinned.travel != null && travel != null ? ', ' + (travel - pinned.travel).toFixed(1) + ' min' : ''}.</p>}
    {share && <label>Copy this link to share waypoints, width and speed. <input type="url" readOnly value={share} onFocus={event => event.target.select()} /></label>}
    <p>Geometry assumes a constant width and speed. Impact totals use the model’s density and vulnerability assumptions.</p>{travel != null && Math.abs(travel - params.lifespan) > 1 && <p className="scenario-note">This route takes {travel.toFixed(1)} minutes at the selected speed. The lifespan input is {params.lifespan} minutes; it does not shorten the drawn route.</p>}</section>;
}

function Stat({ label, value, sub, color = "#e0e0e0", big }) {
  return (
    <div style={{
      background: "#12122a", borderRadius: 8, padding: big ? "14px 16px" : "10px 12px",
      border: "1px solid #1e1e3a", flex: 1, minWidth: big ? 140 : 100,
    }}>
      <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 16, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── BAR CHART ──────────────────────────────────────────────────────────────

function MiniBar({ items, maxVal }) {
  const max = maxVal || Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map((item, idx) => (
        <div key={idx}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999", marginBottom: 2 }}>
            <span>{item.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>{item.display || numFmt(item.value)}</span>
          </div>
          <div style={{ height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${Math.max(1, (item.value / max) * 100)}%`,
              background: item.color || "#ef5350",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROTECTION CTA (affiliate/sponsor block) ───────────────────────────────
// Placeholder affiliate URLs — swap in your own affiliate tags after signing up:
//   Amazon Associates:  replace `YOURTAG-20` in Amazon links
//   Home insurance:     replace with your lead-gen partner URL (QuoteWizard, MediaAlpha, etc.)
//   Storm shelter:      replace with your affiliate link (Survive-a-Storm, Rhino Steel, etc.)

const AFFILIATE_LINKS = [
  {
    icon: "🚨",
    title: "NOAA weather radio",
    sub: "Midland WR120 — the standard for tornado alerts",
    url: "https://www.amazon.com/s?k=midland+wr120+noaa+weather+radio",
    tier: "primary",
  },
  {
    icon: "🛖",
    title: "Storm shelter installation",
    sub: "Find certified installers near you",
    url: "https://www.google.com/search?q=storm+shelter+installation+near+me",
    tier: "primary",
  },
  {
    icon: "🎒",
    title: "Emergency preparedness kit",
    sub: "FEMA-recommended 72-hour bag essentials",
    url: "https://www.amazon.com/s?k=emergency+preparedness+kit+72+hour",
    tier: "secondary",
  },
];

function ProtectionCTA({ fatalities, damage }) {
  const [hoverIdx, setHoverIdx] = useState(-1);
  const damageStr = damage >= 1e9 ? `$${(damage / 1e9).toFixed(1)}B` : damage >= 1e6 ? `$${(damage / 1e6).toFixed(0)}M` : `$${(damage / 1e3).toFixed(0)}K`;
  const severe = fatalities >= 50;
  const headline = severe
    ? `This modeled scenario estimates ${numFmt(fatalities)} fatalities and ${damageStr} in damage. Preparedness resources:`
    : fatalities > 0
      ? `This modeled scenario estimates ${damageStr} in damage. Preparedness resources:`
      : `This modeled scenario estimates no fatalities at the selected exposure. Preparedness resources:`;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1230, #241a3e)",
      borderRadius: 8, padding: 14, border: "1px solid #3a2a5a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🛡️ Preparedness Resources
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#bbb", marginBottom: 12, lineHeight: 1.5 }}>
        {headline}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {AFFILIATE_LINKS.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener sponsored nofollow"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: hoverIdx === i ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${hoverIdx === i ? "#5a3aaa" : "#2a1e40"}`,
              borderRadius: 6, textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{item.sub}</div>
            </div>
            <span style={{ color: "#a78bfa", fontSize: 14 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ResultContext({ densitySource, censusData, censusLoading, censusError, onRetry }) {
  let title = "Using location estimates";
  let detail = "Nearby area or national density estimates are used where available; unresolved segments keep scenario inputs. These are approximate locations, not a building survey.";
  let tone = "#8e94a8";

  if (densitySource === "manual") {
    title = "Using your scenario inputs";
    detail = "Population, housing and infrastructure use your settings along the whole route.";
  } else if (censusLoading) {
    title = "Loading exposure data…";
    detail = "Current estimates remain visible while the location lookup is in progress.";
    tone = "#4fc3f7";
  } else if (censusError) {
    title = "Exposure data unavailable";
    detail = censusError;
    tone = "#ffb74d";
  } else if (censusData?.status === "unknown") {
    title = "Location data not confirmed";
    detail = censusData.note || "The model kept the current manual density settings.";
    tone = "#ffb74d";
  } else if (censusData?.status === "valid-zero") {
    title = "Zero-exposure location";
    detail = "The country-boundary lookup classified this point as open ocean or uninhabited, so the model uses zero population and infrastructure exposure.";
    tone = "#81c784";
  } else if (censusData) {
    const resolution = censusData.country === "us"
      ? "county-level ACS estimate"
      : censusData.country === "canada"
        ? "census-division estimate"
        : "country-level average";
    title = censusData.name;
    detail = `${resolution}. ${censusData.note || "The model combines this exposure data with the settings shown in the controls."}`;
    tone = "#81c784";
  }

  return (
    <div role={censusError ? "alert" : "status"} aria-live="polite" style={{
      padding: "10px 14px", background: "#101426", borderTop: "1px solid #242a43",
      borderBottom: "1px solid #242a43", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: tone, fontWeight: 800, fontSize: 11, marginBottom: 2 }}>{title}</div>
        <div style={{ color: "#a7abba", fontSize: 10, lineHeight: 1.45, overflowWrap: "anywhere" }}>{detail}</div>
        {censusData?.source && (
          <div style={{ color: "#777d91", fontSize: 9, marginTop: 3 }}>
            Source: {censusData.sourceUrl
              ? <a href={censusData.sourceUrl} target="_blank" rel="noopener" style={{ color: "#8fcff0" }}>{censusData.source}</a>
              : censusData.source}
          </div>
        )}
      </div>
      {censusError && <button type="button" onClick={onRetry} style={{ minHeight: 34, padding: "6px 10px", border: "1px solid #6c5731", borderRadius: 4, background: "#2a2114", color: "#ffd18a", cursor: "pointer", fontWeight: 700 }}>Retry lookup</button>}
    </div>
  );
}

// ─── HISTORICAL COMPARISON ──────────────────────────────────────────────────

function HistoricalComparison({ result }) {
  const events = [...HISTORICAL, {
    name: "YOUR SIMULATION",
    ef: result.efIndex,
    fatalities: result.fatalities,
    injuries: result.injuries,
    damage: result.totalEconomicImpact,
    pathLength: 0,
    pathWidth: 0,
  }].sort((a, b) => b.damage - a.damage);

  const maxDmg = Math.max(...events.map((e) => e.damage));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {events.map((ev, i) => {
        const isSim = ev.name === "YOUR SIMULATION";
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 8px",
            background: isSim ? "#2a1a1a" : "transparent", borderRadius: 4,
            border: isSim ? "1px solid #ef535066" : "1px solid transparent",
          }}>
            <div style={{ width: 80, fontSize: 9, color: isSim ? "#ef5350" : "#888", fontWeight: isSim ? 700 : 400 }}>
              {ev.name}
            </div>
            <div style={{ flex: 1, height: 5, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3, transition: "width 0.5s",
                width: `${(ev.damage / maxDmg) * 100}%`,
                background: isSim ? "#ef5350" : EF_SCALE[Math.min(ev.ef, 5)].color,
              }} />
            </div>
            <div style={{ width: 55, fontSize: 9, color: "#aaa", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
              {fmt(ev.damage)}
            </div>
            <div style={{ width: 35, fontSize: 9, color: "#ef5350", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
              {ev.fatalities}☠
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PRESETS ─────────────────────────────────────────────────────────────────

const URL_INIT = parseSimUrlParams(location.search);

// ─── MAIN APP ───────────────────────────────────────────────────────────────

function TornadoSimulator() {
  const [params, setParams] = useState(URL_INIT?.params || PRESETS.suburban_ef4);
  const [activeTab, setActiveTab] = useState("overview");
  const [densitySource, setDensitySource] = useState(URL_INIT?.manual ? "manual" : "location");
  const densitySourceRef = useRef(densitySource);
  const [mobileView, setMobileView] = useState(URL_INIT?.manual ? "results" : "map");
  const [enabledCountries, setEnabledCountries] = useState("both");
  const [tornadoLat, setTornadoLat] = useState(URL_INIT?.lat ?? 37.08);
  const [tornadoLng, setTornadoLng] = useState(URL_INIT?.lon ?? -94.51);
  const [urlPrefillName] = useState(URL_INIT?.name || null);
  const [vizMode, setVizMode] = useState("map"); // "map" or "path"
  const [mapStyle, setMapStyle] = useState("satellite"); // "satellite", "streets", "topo", "dark"
  const [censusData, setCensusData] = useState(null);
  const [censusLoading, setCensusLoading] = useState(false);
  const [censusError, setCensusError] = useState("");
  const [pathMode, setPathMode] = useState(URL_INIT?.waypoints || location.hash === "#draw-path" ? "draw" : "straight"); // "straight", "curved", "draw"
  const [customWaypoints, setCustomWaypoints] = useState(URL_INIT?.waypoints ?? []); // [[lat, lng], ...] for draw mode
  const [isDrawing, setIsDrawing] = useState(!URL_INIT?.waypoints && location.hash === "#draw-path"); // actively drawing path
  const [showCoordinateEditor, setShowCoordinateEditor] = useState(false);

  useEffect(() => {
    const draw = document.getElementById("start-drawn-path");
    function startDrawing() {
      setPathMode("draw");
      setVizMode("map");
      setMobileView("map");
      setCustomWaypoints([]);
      setIsDrawing(true);
    }
    draw.addEventListener("click", startDrawing);
    return () => draw.removeEventListener("click", startDrawing);
  }, []);

  // Live simulation animation state
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0-1 fraction along path
  const [simSpeed, setSimSpeed] = useState(1); // playback speed multiplier
  const [simPaused, setSimPaused] = useState(false);
  const [simLiveStats, setSimLiveStats] = useState(null); // cumulative stats at current position
  const simFrameRef = useRef(null);

  // Finish drawing callback (called from map double-click)
  useEffect(() => {
    window.__tornadoFinishDraw = () => {
      if (customWaypoints.length >= 2) {
        setIsDrawing(false);
        setTornadoLat(customWaypoints[0][0]);
        setTornadoLng(customWaypoints[0][1]);
        const drawnDist = pathLengthFromPoints(customWaypoints);
        setParams(p => ({ ...p, pathLength: Math.round(drawnDist * 10) / 10 }));
      }
    };
    return () => { window.__tornadoFinishDraw = null; };
  }, [customWaypoints]);

  // Fetch real census population density when tornado is placed
  const fetchCensusData = useCallback((lat, lng) => {
    setCensusLoading(true);
    setCensusData(null);
    setCensusError("");

    // Step 1: Reverse geocode lat/lng to county FIPS via Census Geocoder
    const geocodeUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=jsonp&callback=__censusCallback`;

    // Use JSONP since Census geocoder doesn't support CORS
    const script = document.createElement("script");
    window.__censusCallback = (geoResult) => {
      try {
        const geographies = geoResult?.result?.geographies;
        if (!geographies) {
          setCensusError("Population data could not be matched to this location. Try again or enter density manually.");
          setCensusLoading(false);
          return;
        }

        const county = geographies["Counties"]?.[0];
        const tract = geographies["Census Tracts"]?.[0];

        if (county) {
          const stateFips = county.STATE;
          const countyFips = county.COUNTY;
          const countyName = county.NAME;
          const areaLand = county.AREALAND; // in sq meters

          // Step 2: Fetch population from ACS 5-year (no key needed for <500/day)
          const popUrl = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B25001_001E&for=county:${countyFips}&in=state:${stateFips}`;

          fetch(popUrl)
            .then(r => r.json())
            .then(data => {
              if (data && data.length > 1) {
                const row = data[1];
                const name = row[0];
                const population = parseInt(row[1]) || 0;
                const housingUnits = parseInt(row[2]) || 0;
                const areaLandSqMi = areaLand / 2589988.11; // sq meters to sq miles
                const popDensity = Math.round(population / areaLandSqMi);
                const housingDensity = Math.round(housingUnits / areaLandSqMi);

                const info = {
                  name,
                  stateFips,
                  countyFips,
                  population,
                  housingUnits,
                  areaLandSqMi: areaLandSqMi.toFixed(1),
                  popDensity,
                  housingDensity,
                  tractName: tract?.NAME || null,
                  source: "US Census Bureau, ACS 5-Year Estimates (2022), 2020 TIGER/Line",
                  sourceUrl: "https://data.census.gov",
                  country: "us",
                };

                setCensusData(info);

                // Auto-populate simulation parameters with real data
                const isRemote = popDensity < 5;
                setParams(p => densitySourceRef.current === "manual" ? p : ({
                  ...p,
                  popDensity: Math.min(popDensity, 15000),
                  housingDensity: Math.min(housingDensity, 5000),
                  // Scale infrastructure proportionally to real density
                  powerLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 80), 30),
                  cellTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 40), 80),
                  bridges: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
                  waterTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 400), 10),
                  gasLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
                  vehiclesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 8), 300),
                  livestockDensity: popDensity < 100 ? Math.min(Math.round((100 - popDensity) / 3), 50) : 0,
                }));
              } else {
                setCensusError("The Census service returned no population record. Existing density settings were kept.");
              }
              setCensusLoading(false);
            })
            .catch(() => {
              setCensusError("Population data could not be loaded. Check your connection, try again, or enter density manually.");
              setCensusLoading(false);
            });
        } else {
          // No county match is an unknown-data state, not proof that population is zero.
          setCensusData({
            name: "Location not matched",
            population: null,
            popDensity: null,
            housingDensity: null,
            source: "US Census Bureau — no county found at this coordinate",
            country: "us",
            status: "unknown",
            note: "The lookup cannot confirm whether this point is water, federal land, or outside a county boundary. Existing density settings were kept.",
          });
          setCensusLoading(false);
        }
      } catch (e) {
        setCensusError("Population data could not be read. Existing density settings were kept.");
        setCensusLoading(false);
      }
      delete window.__censusCallback;
      script.remove();
    };
    script.src = geocodeUrl;
    script.onerror = () => {
      setCensusError("The Census location service is unavailable. Try again or enter density manually.");
      setCensusLoading(false);
      script.remove();
    };
    document.head.appendChild(script);
  }, []);

  // Trigger census lookup when tornado is placed
  const handlePlaceTornado = useCallback((lat, lng) => {
    setTornadoLat(lat);
    setTornadoLng(lng);
    setCensusError("");
    if (densitySourceRef.current === "manual") { setCensusLoading(false); return; }

    // Check if the point is on land (rough bounding boxes)
    const inUS = lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66;
    const inCanada = lat > 41 && lat <= 72 && lng >= -141 && lng <= -52 && !inUS;
    const inAlaska = lat >= 51 && lat <= 72 && lng >= -170 && lng <= -130;

    if (inUS || inAlaska) {
      // Fetch real US Census data (Alaska is technically in US Census)
      if (inUS) {
        fetchCensusData(lat, lng);
      } else {
        // Alaska — very sparse, estimate ~1 person/sq mi average
        const alaskaDensity = 1;
        setCensusData({
          name: "Alaska (estimated)",
          population: null,
          popDensity: alaskaDensity,
          housingDensity: 0,
          source: "US Census Bureau, 2020 Decennial Census",
          sourceUrl: "https://data.census.gov",
          country: "us",
          note: "Alaska average ~1.3 persons/sq mi; most areas near 0",
        });
        setParams(p => ({
          ...p,
          popDensity: alaskaDensity,
          housingDensity: 0,
          powerLinesPerMile: 0, cellTowers: 1, bridges: 0,
          waterTowers: 0, gasLinesPerMile: 0, vehiclesPerMile: 0,
          cropType: "none", cropAcresPct: 0, livestockDensity: 0,
        }));
        setCensusLoading(false);
      }
    } else if (inCanada) {
      // Canada — look up nearest census division from Statistics Canada 2021 Census
      const { cd, dist } = findCanadianCensusDivision(lat, lng);

      if (cd && dist < 5) {
        // Found a census division within reasonable range
        const popDensity = Math.round(cd.d); // already in per sq mi
        const housingDensity = Math.round(cd.h);
        const isRemote = popDensity < 5;

        setCensusData({
          name: cd.n,
          population: cd.pop,
          popDensity,
          housingDensity,
          areaLandSqMi: cd.a.toFixed(1),
          housingUnits: cd.dw,
          source: "Statistics Canada, 2021 Census of Population, Table 98-10-0002-02",
          sourceUrl: "https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm?Lang=E",
          country: "canada",
          note: dist > 2 ? "Matched to nearest census division centroid" : null,
        });

        setParams(p => ({
          ...p,
          popDensity: Math.min(popDensity, 15000),
          housingDensity: Math.min(housingDensity, 5000),
          powerLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 80), 30),
          cellTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 40), 80),
          bridges: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
          waterTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 400), 10),
          gasLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
          vehiclesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 8), 300),
          cropType: lat > 55 ? "none" : p.cropType,
          cropAcresPct: lat > 55 ? 0 : p.cropAcresPct,
          livestockDensity: popDensity < 100 ? Math.min(Math.round((100 - popDensity) / 3), 50) : 0,
        }));
      } else {
        // No nearby division is an unknown-data state; it does not prove zero exposure.
        setCensusData({
          name: "Location not matched",
          population: null,
          popDensity: null,
          housingDensity: null,
          source: "Statistics Canada, 2021 Census of Population — no census division at this location",
          sourceUrl: "https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm?Lang=E",
          country: "canada",
          status: "unknown",
          note: "No nearby census division was found. Existing density settings were kept.",
        });
      }
      setCensusLoading(false);
    } else {
      // Outside US/Canada — try world country lookup (UN + CIA World Factbook)
      const country = findWorldCountry(lat, lng);
      if (country) {
        const popDensity = Math.round(country.d);
        const housingDensity = Math.round(country.d * 0.4); // ~40% of pop density is typical
        const isRemote = popDensity < 5;
        // Load regional construction profile (housing mix, basements, prep)
        const profile = getConstructionProfile(country.iso);
        setCensusData({
          name: country.n,
          population: country.pop,
          popDensity,
          housingDensity,
          areaLandSqMi: country.a.toFixed(0),
          source: "UN World Population Prospects 2023 + CIA World Factbook (country-level average)",
          sourceUrl: "https://population.un.org/wpp/",
          country: "world",
          iso: country.iso,
          note: profile
            ? "Country avg density + regional construction profile applied (housing mix, basements, preparedness)"
            : "Country-level average density — real values vary widely within borders",
        });
        setParams(p => ({
          ...p,
          popDensity: Math.min(popDensity, 15000),
          housingDensity: Math.min(housingDensity, 5000),
          powerLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 80), 30),
          cellTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 40), 80),
          bridges: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
          waterTowers: isRemote ? 0 : Math.min(Math.round(popDensity / 400), 10),
          gasLinesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 150), 20),
          vehiclesPerMile: isRemote ? 0 : Math.min(Math.round(popDensity / 8), 300),
          cropType: p.cropType,
          cropAcresPct: p.cropAcresPct,
          livestockDensity: popDensity < 100 ? Math.min(Math.round((100 - popDensity) / 3), 50) : 0,
          // Apply regional construction profile if available for this country
          ...(profile ? {
            mobileHomePct: profile.mobileHomePct,
            woodFramePct: profile.woodFramePct,
            brickPct: profile.brickPct,
            concretePct: profile.concretePct,
            basementPct: profile.basementPct,
            shelterPct: profile.shelterPct,
            preparedness: profile.preparedness,
          } : {}),
        }));
      } else {
        // Ocean / uninhabited — ZERO everything
        setCensusData({
          name: "Ocean / Uninhabited",
          population: 0,
          popDensity: 0,
          housingDensity: 0,
          source: "No census data — open ocean or unclassified area",
          country: "none",
          status: "valid-zero",
          note: "No population, structures, or infrastructure at this location",
        });
        setParams(p => ({
          ...p,
          popDensity: 0,
          housingDensity: 0,
          powerLinesPerMile: 0, cellTowers: 0, bridges: 0,
          waterTowers: 0, gasLinesPerMile: 0, vehiclesPerMile: 0,
          cropType: "none", cropAcresPct: 0, livestockDensity: 0,
        }));
      }
      setCensusLoading(false);
    }
  }, [fetchCensusData]);

  const set = useCallback((key) => (val) => setParams((p) => ({ ...p, [key]: val })), []);

  // Auto-balance housing percentages
  const setHousingPct = useCallback((key, val) => {
    setParams((p) => {
      const others = ["mobileHomePct", "woodFramePct", "brickPct", "concretePct"].filter((k) => k !== key);
      const remaining = 100 - val;
      const currentOthersTotal = others.reduce((s, k) => s + p[k], 0);
      const newParams = { ...p, [key]: val };
      if (currentOthersTotal > 0) {
        others.forEach((k) => { newParams[k] = Math.round((p[k] / currentOthersTotal) * remaining); });
        // Fix rounding
        const total = val + others.reduce((s, k) => s + newParams[k], 0);
        if (total !== 100) newParams[others[0]] += 100 - total;
      }
      return newParams;
    });
  }, []);

  // Generate path points for rendering and multi-segment simulation
  const pathPoints = useMemo(() => {
    if (tornadoLat == null || tornadoLng == null) return [];
    if (pathMode === "draw" && isDrawing) return customWaypoints;
    return generatePathPoints(tornadoLat, tornadoLng, params, pathMode, customWaypoints);
  }, [tornadoLat, tornadoLng, params, pathMode, customWaypoints, isDrawing]);

  // US county cache: preloaded from us-counties.js (3,144 counties).
  // Falls back to empty array + dynamic Census fetch if the static file failed to load.
  const [usCountyCache, setUsCountyCache] = useState(() => {
    const preloaded = (typeof window !== "undefined" && window.US_COUNTIES) || [];
    return preloaded.map(c => ({
      lat: c.lat, lng: c.lng, name: c.n,
      popDensity: c.d, housingDensity: c.h,
      population: c.pop, area: c.a,
    }));
  });

  // Fetch US county data for sample points along the path (fallback only).
  // Skipped entirely when the static us-counties.js bundle is present.
  useEffect(() => {
    if (typeof window !== "undefined" && window.US_COUNTIES) return;
    if (tornadoLat == null || tornadoLng == null) return;
    if (pathMode === "draw" && isDrawing) return;

    const pp = generatePathPoints(tornadoLat, tornadoLng, params, pathMode, customWaypoints);
    if (pp.length < 2) return;

    // Generate sample points every ~3 miles along the path
    let samplePts = [];
    if (pp.length === 2) {
      const totalDist = pathLengthFromPoints(pp);
      const numSamples = Math.max(2, Math.min(12, Math.ceil(totalDist / 3)));
      for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;
        samplePts.push([
          pp[0][0] + t * (pp[1][0] - pp[0][0]),
          pp[0][1] + t * (pp[1][1] - pp[0][1]),
        ]);
      }
    } else {
      // For curved/draw paths, sample at regular intervals along the polyline
      const totalDist = pathLengthFromPoints(pp);
      const numSamples = Math.max(2, Math.min(12, Math.ceil(totalDist / 3)));
      for (let i = 0; i <= numSamples; i++) {
        const frac = i / numSamples;
        const idx = Math.min(Math.floor(frac * (pp.length - 1)), pp.length - 2);
        const localFrac = (frac * (pp.length - 1)) - idx;
        samplePts.push([
          pp[idx][0] + localFrac * (pp[idx + 1][0] - pp[idx][0]),
          pp[idx][1] + localFrac * (pp[idx + 1][1] - pp[idx][1]),
        ]);
      }
    }

    // For each sample point in the US, check if we already have it cached
    // If not, fetch it via Census Geocoder
    const inUS = (lat, lng) => lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66;
    const isAlreadyCached = (lat, lng) => usCountyCache.some(c => Math.abs(c.lat - lat) + Math.abs(c.lng - lng) < 0.3);

    const toFetch = samplePts.filter(([lat, lng]) => inUS(lat, lng) && !isAlreadyCached(lat, lng));

    if (toFetch.length === 0) return;

    // Fetch counties for uncached US points (max 8 parallel to stay under rate limit)
    const fetchLimit = Math.min(toFetch.length, 8);
    let fetched = 0;

    for (let i = 0; i < fetchLimit; i++) {
      const [lat, lng] = toFetch[i];
      const geocodeUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=jsonp&callback=__countyCache${i}`;

      const script = document.createElement("script");
      window[`__countyCache${i}`] = (geoResult) => {
        try {
          const county = geoResult?.result?.geographies?.["Counties"]?.[0];
          if (county) {
            const stateFips = county.STATE;
            const countyFips = county.COUNTY;
            const areaLand = county.AREALAND;
            const countyName = county.BASENAME || county.NAME;

            // Fetch pop data
            const popUrl = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B25001_001E&for=county:${countyFips}&in=state:${stateFips}`;
            fetch(popUrl).then(r => r.json()).then(data => {
              if (data && data.length > 1) {
                const row = data[1];
                const population = parseInt(row[1]) || 0;
                const housingUnits = parseInt(row[2]) || 0;
                const areaLandSqMi = areaLand / 2589988.11;
                const popDensity = Math.round(population / areaLandSqMi);
                const housingDensity = Math.round(housingUnits / areaLandSqMi);

                setUsCountyCache(prev => {
                  // Don't add duplicates
                  if (prev.some(c => c.stateFips === stateFips && c.countyFips === countyFips)) return prev;
                  return [...prev, {
                    lat, lng, stateFips, countyFips,
                    name: row[0] || countyName,
                    popDensity, housingDensity,
                    population, housingUnits,
                  }];
                });
              }
            }).catch(() => {});
          }
        } catch(e) {}
        // Clean up
        delete window[`__countyCache${i}`];
        try { document.head.removeChild(script); } catch(e) {}
      };
      script.src = geocodeUrl;
      script.onerror = () => { delete window[`__countyCache${i}`]; try { document.head.removeChild(script); } catch(e) {} };
      document.head.appendChild(script);
    }
  }, [tornadoLat, tornadoLng, params.pathLength, params.direction, params.curvature, pathMode, customWaypoints, isDrawing]);

  // Run simulation — ALWAYS uses multi-segment to account for
  // different counties and population densities along the tornado's path
  const { result, segments: pathSegments } = useMemo(() => {
    if (pathMode === "draw" && isDrawing) {
      return { result: runSimulation(params), segments: null };
    }
    const pp = (tornadoLat == null || tornadoLng == null) ? [] : generatePathPoints(tornadoLat, tornadoLng, params, pathMode, customWaypoints);
    if (pp.length >= 2) {
      return runMultiSegmentSimulation(params, pp, pathMode, usCountyCache, densitySource === "location");
    }
    return { result: runSimulation(params), segments: null };
  }, [params, tornadoLat, tornadoLng, pathMode, customWaypoints, isDrawing, usCountyCache, densitySource]);

  // ─── LIVE SIMULATION ANIMATION ──────────────────
  const startSimulation = useCallback(() => {
    setSimRunning(true);
    setSimPaused(false);
    setSimProgress(0);
    setSimLiveStats({ fatalities: 0, injuries: 0, damage: 0, destroyed: 0, popInPath: 0, elapsed: 0, currentRegion: "" });
  }, []);

  const stopSimulation = useCallback(() => {
    setSimRunning(false);
    setSimPaused(false);
    setSimProgress(0);
    setSimLiveStats(null);
    if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
  }, []);

  // Animation frame loop
  useEffect(() => {
    if (!simRunning || simPaused) {
      if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
      return;
    }

    const pp = pathPoints;
    if (!pp || pp.length < 2) return;

    const totalPathMiles = pathLengthFromPoints(pp);
    // Real-time duration in seconds: (pathMiles / forwardSpeed_mph) * 3600 / simSpeed
    // But we compress: 1 minute of sim time = ~0.5 seconds real time at 1x
    const simDurationSec = (totalPathMiles / params.forwardSpeed) * 60 * (0.5 / simSpeed);
    const startTime = performance.now();
    const startProgress = simProgress;

    const animate = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progressDelta = elapsed / simDurationSec;
      const newProgress = Math.min(startProgress + progressDelta, 1);

      setSimProgress(newProgress);

      // Calculate cumulative stats up to current position
      if (pathSegments && pathSegments.length > 0) {
        let cumFatalities = 0, cumInjuries = 0, cumDamage = 0, cumDestroyed = 0, cumPop = 0;
        let currentRegion = "";
        const segFraction = newProgress;
        let distCovered = 0;
        const totalDist = pathSegments.reduce((s, seg) => s + seg.length, 0);

        for (const seg of pathSegments) {
          const segStart = distCovered / totalDist;
          const segEnd = (distCovered + seg.length) / totalDist;

          if (segFraction >= segEnd) {
            // Fully passed this segment
            cumFatalities += seg.result.fatalities;
            cumInjuries += seg.result.injuries;
            cumDamage += seg.result.totalEconomicImpact;
            cumDestroyed += seg.result.totalDestroyed;
            cumPop += seg.result.populationInPath;
          } else if (segFraction > segStart) {
            // Partially in this segment
            const segPct = (segFraction - segStart) / (segEnd - segStart);
            cumFatalities += Math.round(seg.result.fatalities * segPct);
            cumInjuries += Math.round(seg.result.injuries * segPct);
            cumDamage += seg.result.totalEconomicImpact * segPct;
            cumDestroyed += Math.round(seg.result.totalDestroyed * segPct);
            cumPop += Math.round(seg.result.populationInPath * segPct);
            currentRegion = seg.localDensity?.name || "";
          }
          distCovered += seg.length;
          if (segFraction >= segStart && segFraction < segEnd) {
            currentRegion = seg.localDensity?.name || "";
          }
        }

        const elapsedMinutes = (totalPathMiles / params.forwardSpeed) * 60 * newProgress;
        const currentHour = typeof params.timeOfDay === "number" ? (params.timeOfDay + elapsedMinutes / 60) % 24 : 14;
        setSimLiveStats({
          fatalities: cumFatalities,
          injuries: cumInjuries,
          damage: cumDamage,
          destroyed: cumDestroyed,
          popInPath: cumPop,
          elapsed: elapsedMinutes,
          currentRegion,
          currentHour,
        });
      } else {
        // No segments — use linear interpolation of total result
        const elapsedMinutes = (totalPathMiles / params.forwardSpeed) * 60 * newProgress;
        const currentHour = typeof params.timeOfDay === "number" ? (params.timeOfDay + elapsedMinutes / 60) % 24 : 14;
        setSimLiveStats({
          fatalities: Math.round(result.fatalities * newProgress),
          injuries: Math.round(result.injuries * newProgress),
          damage: result.totalEconomicImpact * newProgress,
          destroyed: Math.round(result.totalDestroyed * newProgress),
          popInPath: Math.round(result.populationInPath * newProgress),
          elapsed: elapsedMinutes,
          currentRegion: "",
          currentHour,
        });
      }

      if (newProgress < 1) {
        simFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSimRunning(false);
        setSimPaused(false);
      }
    };

    simFrameRef.current = requestAnimationFrame(animate);
    return () => { if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current); };
  }, [simRunning, simPaused, simSpeed, pathPoints, params.forwardSpeed, result, pathSegments]);

  const loadPreset = (key) => setParams(PRESETS[key]);

  const tabs = ["overview", "structures", "casualties", "economic", "historical"];
  const routeMiles = result._routeMiles ?? (pathPoints.length >= 2 ? pathLengthFromPoints(pathPoints) : params.pathLength);

  return (
    <div className="simulator-app" style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#0a0a18", color: "#e0e0e0",
      height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* GOOGLE FONTS */}
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div className="simulator-header" style={{
        padding: "10px 16px", borderBottom: "1px solid #1e1e3a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, #12122a 0%, #0a0a18 100%)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="sim-mark" aria-hidden="true">↗</span>
          <div>
            <h2 className="sim-title">Explore a tornado</h2>
            <div style={{ fontSize: 9, color: "#666", letterSpacing: "0.1em" }}>
              {urlPrefillName ? `PRELOADED: ${urlPrefillName.toUpperCase()}` : "Place a path. Change the conditions."}
            </div>
          </div>
        </div>
        <div className="simulator-header-presets" style={{ display: "flex", gap: 4 }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => loadPreset(key)} style={{
              padding: "4px 10px", fontSize: 9, background: "#1a1a2e", border: "1px solid #333",
              borderRadius: 4, color: "#aaa", cursor: "pointer", fontWeight: 600,
              letterSpacing: "0.04em",
            }}>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-view-switcher" aria-label="Simulator view">
        {[['map', 'Map'], ['settings', 'Settings'], ['results', 'Results']].map(([value, label]) => (
          <button type="button" key={value} aria-pressed={mobileView === value} onClick={() => setMobileView(value)}>{label}</button>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="simulator-main" style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LEFT PANEL - Controls */}
        <div className={`controls-panel ${mobileView === "settings" ? "" : "mobile-hidden"}`} style={{
          width: 260, borderRight: "1px solid #1e1e3a", overflowY: "auto",
          padding: "12px 14px", flexShrink: 0,
          scrollbarWidth: "thin", scrollbarColor: "#333 transparent",
        }}>
          <Section title="Location" icon="📍" defaultOpen={true}>
            <SelectInput label="Exposure data" value={densitySource} onChange={value => { densitySourceRef.current = value; setDensitySource(value); }} options={[["location", "Location estimates"], ["manual", "My scenario inputs"]]} />
            <p className="exposure-help">{densitySource === "location" ? "Uses nearby density estimates and derived infrastructure where available. Choose My scenario inputs to control these values yourself." : "Uses your population, housing and infrastructure settings along the whole route."}</p>
            <SelectInput label="Region" value={enabledCountries} onChange={(v) => setEnabledCountries(v)}
              options={[["us", "🇺🇸 United States"], ["canada", "🇨🇦 Canada"], ["both", "🇺🇸🇨🇦 Both Countries"], ["world", "🌍 World (200+ countries)"]]} />

            {enabledCountries === "world" && (
              <>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: "#888", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>QUICK JUMP TO CITY</div>
                  <select
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const city = WORLD_CITIES.find(c => c.n === e.target.value);
                      if (city) handlePlaceTornado(city.lat, city.lng);
                      e.target.value = "";
                    }}
                    style={{
                      width: "100%", padding: "6px 8px", fontSize: 11,
                      background: "#0d0d1a", color: "#e0e0e0", border: "1px solid #2a2a4a",
                      borderRadius: 4, cursor: "pointer",
                    }}
                    defaultValue=""
                  >
                    <option value="">— Select a major city —</option>
                    {["N America","S America","Europe","Asia","Mid East","Africa","Oceania","Extreme"].map(region => (
                      <optgroup key={region} label={region}>
                        {WORLD_CITIES.filter(c => c.r === region).map(c => (
                          <option key={c.n} value={c.n}>{c.n}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    // Pick a random inhabited country weighted by population
                    const pool = WORLD_COUNTRIES.filter(c => c.pop > 1000000);
                    const totalPop = pool.reduce((s, c) => s + c.pop, 0);
                    let r = Math.random() * totalPop;
                    let picked = pool[0];
                    for (const c of pool) {
                      r -= c.pop;
                      if (r <= 0) { picked = c; break; }
                    }
                    // Random point within country's bbox
                    const [minLat, minLng, maxLat, maxLng] = picked.bbox;
                    const rlat = minLat + Math.random() * (maxLat - minLat);
                    const rlng = minLng + Math.random() * (maxLng - minLng);
                    handlePlaceTornado(rlat, rlng);
                  }}
                  style={{
                    width: "100%", padding: "6px 8px", fontSize: 10, fontWeight: 700,
                    background: "linear-gradient(135deg, #4a1a8a, #2a3a8a)", color: "#fff",
                    border: "1px solid #5a3aaa", borderRadius: 4, cursor: "pointer",
                    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}
                >
                  🎲 Random World Location
                </button>
              </>
            )}

            <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>
              Click the map to place the tornado origin
            </div>
            {tornadoLat && (
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, padding: "6px 8px", background: "#1a1a2e", borderRadius: 4, border: "1px solid #2a2a4a" }}>
                  <div style={{ fontSize: 8, color: "#666" }}>LAT</div>
                  <div style={{ fontSize: 11, color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{Math.abs(tornadoLat).toFixed(2)}°{tornadoLat >= 0 ? "N" : "S"}</div>
                </div>
                <div style={{ flex: 1, padding: "6px 8px", background: "#1a1a2e", borderRadius: 4, border: "1px solid #2a2a4a" }}>
                  <div style={{ fontSize: 8, color: "#666" }}>LNG</div>
                  <div style={{ fontSize: 11, color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{Math.abs(tornadoLng).toFixed(2)}°{tornadoLng >= 0 ? "E" : "W"}</div>
                </div>
              </div>
            )}
            {censusLoading && (
              <div style={{ fontSize: 10, color: "#4fc3f7", padding: "6px 8px", background: "#0d1428", borderRadius: 4, marginBottom: 8, border: "1px solid #1a2a4a" }}>
                ⏳ Fetching census data...
              </div>
            )}
            {censusData && (
              <div style={{ background: "#0d1428", borderRadius: 6, padding: "8px 10px", marginBottom: 8, border: "1px solid #1a2a4a" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4fc3f7", marginBottom: 4 }}>
                  📊 {censusData.name}
                </div>
                {censusData.population != null && (
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                    Population: <span style={{ color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{censusData.population.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                  Pop. Density: <span style={{ color: "#81c784", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{censusData.popDensity?.toLocaleString()}/sq mi</span>
                  <span style={{ color: "#555", fontSize: 8 }}> (auto-applied)</span>
                </div>
                {censusData.housingDensity != null && (
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                    Housing Units: <span style={{ color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{censusData.housingDensity.toLocaleString()}/sq mi</span>
                  </div>
                )}
                {censusData.areaLandSqMi && (
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                    County Area: <span style={{ color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{censusData.areaLandSqMi} sq mi</span>
                  </div>
                )}
                {censusData.housingUnits != null && (
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                    Total Housing: <span style={{ color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{censusData.housingUnits.toLocaleString()}</span>
                  </div>
                )}
                {censusData.note && (
                  <div style={{ fontSize: 9, color: "#ffb74d", marginBottom: 4, fontStyle: "italic" }}>
                    ⚠️ {censusData.note}
                  </div>
                )}
                <div style={{ fontSize: 8, color: "#555", marginTop: 4, borderTop: "1px solid #1a2a4a", paddingTop: 4, lineHeight: 1.4 }}>
                  <strong style={{ color: "#666" }}>SOURCE:</strong>{" "}
                  {censusData.sourceUrl ? (
                    <a href={censusData.sourceUrl} target="_blank" rel="noopener" style={{ color: "#4fc3f780", textDecoration: "none" }}>
                      {censusData.source}
                    </a>
                  ) : censusData.source}
                </div>
              </div>
            )}
            {/* Path counties summary */}
            {result._multiSegment && result._countiesCrossed && result._countiesCrossed.length > 0 && (
              <div style={{ background: "#0d1428", borderRadius: 6, padding: "8px 10px", marginBottom: 8, border: "1px solid #1a2a4a" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#4fc3f7", marginBottom: 4, letterSpacing: "0.04em" }}>
                  🗺️ PATH CROSSES {result._countiesCrossed.length} REGION{result._countiesCrossed.length > 1 ? "S" : ""}
                </div>
                <div style={{ fontSize: 9, color: "#aaa", lineHeight: 1.6 }}>
                  {result._countiesCrossed.map((name, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "#444" }}>{i + 1}.</span>
                      <span style={{ color: "#81c784" }}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section title="Storm Parameters" icon="⚡" defaultOpen={true}>
            <Slider label="Wind Speed" value={params.windSpeed} onChange={set("windSpeed")} min={65} max={320} unit=" mph" />
            <Slider label="Pressure Deficit" value={params.pressureDeficit} onChange={set("pressureDeficit")} min={10} max={200} unit=" mbar" />
            {/* Path Mode selector */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#888", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>PATH MODE</div>
              <div style={{ display: "flex", gap: 2, background: "#0d0d1a", borderRadius: 4, padding: 2, border: "1px solid #2a2a4a" }}>
                {[["straight", "Straight"], ["curved", "Curved"], ["draw", "✏️ Draw"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => {
                    setPathMode(mode);
                    if (mode === "draw") {
                      setCustomWaypoints([]);
                      setIsDrawing(true);
                      setMobileView("map");
                      setVizMode("map");
                      setShowCoordinateEditor(false);
                    } else {
                      setIsDrawing(false);
                      setShowCoordinateEditor(false);
                    }
                  }} style={{
                    flex: 1, padding: "4px 6px", fontSize: 9, fontWeight: 700, border: "none", cursor: "pointer",
                    borderRadius: 3, letterSpacing: "0.03em",
                    background: pathMode === mode ? "#2a2a5a" : "transparent",
                    color: pathMode === mode ? "#fff" : "#666",
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Draw mode controls */}
            {pathMode === "draw" && (
              <div style={{ background: "#0d1428", borderRadius: 6, padding: "8px 10px", marginBottom: 8, border: "1px solid #1a2a4a" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <button type="button" onClick={() => setShowCoordinateEditor(false)} aria-pressed={!showCoordinateEditor}
                    style={{ flex: 1, minHeight: 34, border: "1px solid #34415e", borderRadius: 4, background: !showCoordinateEditor ? "#263552" : "#151b2c", color: "#e6e9f2", cursor: "pointer", fontWeight: 700 }}>
                    Draw on map
                  </button>
                  <button type="button" onClick={() => {
                    if (customWaypoints.length < 2) {
                      setCustomWaypoints(generatePathPoints(tornadoLat, tornadoLng, params, "straight", []).slice(0, 2));
                    }
                    setShowCoordinateEditor(true);
                    setIsDrawing(false);
                  }} aria-pressed={showCoordinateEditor}
                    style={{ flex: 1, minHeight: 34, border: "1px solid #34415e", borderRadius: 4, background: showCoordinateEditor ? "#263552" : "#151b2c", color: "#e6e9f2", cursor: "pointer", fontWeight: 700 }}>
                    Enter coordinates
                  </button>
                </div>
                {showCoordinateEditor ? (
                  <CoordinatePathEditor points={customWaypoints} onChange={setCustomWaypoints} onFinish={() => {
                    if (customWaypoints.length < 2) return;
                    setIsDrawing(false);
                    setTornadoLat(customWaypoints[0][0]);
                    setTornadoLng(customWaypoints[0][1]);
                    setParams(p => ({ ...p, pathLength: Math.round(pathLengthFromPoints(customWaypoints) * 10) / 10 }));
                    handlePlaceTornado(customWaypoints[0][0], customWaypoints[0][1]);
                  }} />
                ) : isDrawing ? (
                  <>
                    <div style={{ fontSize: 10, color: "#4fc3f7", marginBottom: 6 }}>
                      Click the map to add waypoints. Double-click or use Finish path when ready.
                    </div>
                    <div style={{ fontSize: 10, color: "#aaa", marginBottom: 6 }}>
                      Waypoints: <span style={{ color: "#81c784", fontFamily: "'JetBrains Mono', monospace" }}>{customWaypoints.length}</span>
                      {customWaypoints.length >= 2 && (
                        <span style={{ color: "#888" }}> ({pathLengthFromPoints(customWaypoints).toFixed(1)} mi)</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => {
                        if (customWaypoints.length >= 2) {
                          setIsDrawing(false);
                          setTornadoLat(customWaypoints[0][0]);
                          setTornadoLng(customWaypoints[0][1]);
                          // Update pathLength to match drawn distance
                          const drawnDist = pathLengthFromPoints(customWaypoints);
                          setParams(p => ({ ...p, pathLength: Math.round(drawnDist * 10) / 10 }));
                          handlePlaceTornado(customWaypoints[0][0], customWaypoints[0][1]);
                        }
                      }} style={{
                        flex: 1, padding: "5px 8px", fontSize: 9, fontWeight: 700, border: "none", cursor: "pointer",
                        borderRadius: 4, background: customWaypoints.length >= 2 ? "#2e7d32" : "#333", color: customWaypoints.length >= 2 ? "#fff" : "#666",
                      }}>
                        ✅ Finish ({customWaypoints.length >= 2 ? "ready" : "need 2+ pts"})
                      </button>
                      <button onClick={() => { setCustomWaypoints([]); }} style={{
                        padding: "5px 8px", fontSize: 9, fontWeight: 700, border: "none", cursor: "pointer",
                        borderRadius: 4, background: "#333", color: "#aaa",
                      }}>
                        🗑️ Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 10, color: "#81c784", marginBottom: 4 }}>
                      ✅ Custom path: {customWaypoints.length} waypoints, {pathLengthFromPoints(customWaypoints).toFixed(1)} mi
                    </div>
                    <button onClick={() => {
                      setCustomWaypoints([]);
                      setIsDrawing(true);
                    }} style={{
                      width: "100%", padding: "5px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer",
                      borderRadius: 4, background: "#1a1a2e", color: "#4fc3f7", border: "1px solid #2a2a4a",
                    }}>
                      ✏️ Redraw Path
                    </button>
                  </>
                )}
              </div>
            )}
            {pathMode !== "draw" && (
              <Slider label="Path Length" value={params.pathLength} onChange={set("pathLength")} min={0.5} max={250} step={0.5} unit=" mi" />
            )}
            {pathMode === "draw" && !isDrawing && (
              <Slider label="Path Length" value={params.pathLength} onChange={set("pathLength")} min={0.5} max={250} step={0.5} unit=" mi" info="Auto-set from drawn path" />
            )}
            <Slider label="Path Width" value={params.pathWidth} onChange={set("pathWidth")} min={50} max={5000} step={10} unit=" yd" />
            <Slider label="Forward Speed" value={params.forwardSpeed} onChange={set("forwardSpeed")} min={5} max={80} unit=" mph" />
            {pathMode !== "draw" && (
              <Slider label="Direction" value={params.direction} onChange={set("direction")} min={0} max={359} unit="°" />
            )}
            {pathMode === "curved" && (
              <Slider label="Curvature" value={params.curvature} onChange={set("curvature")} min={-90} max={90} unit="°"
                info="Negative = curves left, Positive = curves right" />
            )}
            <Slider label="Rainfall" value={params.rainfall} onChange={set("rainfall")} min={0} max={10} step={0.5} unit=" in/hr" />
            <Slider label="Hail Size" value={params.hailSize} onChange={set("hailSize")} min={0} max={6} step={0.25} unit=" in" />
            <Slider label="Sub-Vortices" value={params.subVortices} onChange={set("subVortices")} min={1} max={8} />
            <Slider label="Lifespan" value={params.lifespan} onChange={set("lifespan")} min={1} max={120} unit=" min" />
          </Section>

          <Section title="Environment" icon="🌍" defaultOpen={false}>
            <SelectInput label="Terrain" value={params.terrain} onChange={set("terrain")}
              options={[["flat_plains", "Flat Plains"], ["rolling_hills", "Rolling Hills"], ["urban", "Urban"], ["forested", "Forested"]]} />
            {/* Time of Day - exact hour input plus slider */}
            <div style={{ marginBottom: 10 }}>
              <Slider label="Time of Day" value={params.timeOfDay} onChange={set("timeOfDay")} min={0} max={23} step={1} unit=" hr"
                info={`${params.timeOfDay === 0 ? "12" : params.timeOfDay > 12 ? params.timeOfDay - 12 : params.timeOfDay}:00 ${params.timeOfDay >= 12 ? "PM" : "AM"}`} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#555", marginTop: 2 }}>
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
              </div>
              {/* Lethality indicator */}
              <div style={{
                marginTop: 4, padding: "3px 8px", borderRadius: 3, fontSize: 9, fontWeight: 600,
                background: params.timeOfDay >= 20 || params.timeOfDay < 5 ? "#ef535020" :
                  params.timeOfDay >= 17 || params.timeOfDay < 8 ? "#ffb74d15" : "#81c78410",
                color: params.timeOfDay >= 20 || params.timeOfDay < 5 ? "#ef5350" :
                  params.timeOfDay >= 17 || params.timeOfDay < 8 ? "#ffb74d" : "#81c784",
                border: `1px solid ${params.timeOfDay >= 20 || params.timeOfDay < 5 ? "#ef535040" :
                  params.timeOfDay >= 17 || params.timeOfDay < 8 ? "#ffb74d30" : "#81c78420"}`,
              }}>
                {params.timeOfDay >= 20 || params.timeOfDay < 5
                  ? `🌙 Night — 2.5× lethality (Ashley 2007)`
                  : params.timeOfDay >= 17
                    ? `🌅 Dusk — ${(1.0 + 1.5 * ((params.timeOfDay - 17) / 3)).toFixed(1)}× lethality`
                    : params.timeOfDay < 8
                      ? `🌅 Dawn — ${(2.5 - 1.5 * ((params.timeOfDay - 5) / 3)).toFixed(1)}× lethality`
                      : `☀️ Daytime — 1.0× lethality`
                }
              </div>
            </div>
            <SelectInput label="Season" value={params.season} onChange={set("season")}
              options={[["spring", "Spring"], ["summer", "Summer"], ["fall", "Fall"], ["winter", "Winter"]]} />
          </Section>

          <Section title="Built Environment" icon="🏘️" defaultOpen={false}>
            <Slider label="Housing Density" value={params.housingDensity} onChange={set("housingDensity")} min={1} max={5000} unit=" /sq mi" />
            <Slider label="Mobile Homes" value={params.mobileHomePct} onChange={(v) => setHousingPct("mobileHomePct", v)} min={0} max={100} unit="%" />
            <Slider label="Wood Frame" value={params.woodFramePct} onChange={(v) => setHousingPct("woodFramePct", v)} min={0} max={100} unit="%" />
            <Slider label="Brick/Masonry" value={params.brickPct} onChange={(v) => setHousingPct("brickPct", v)} min={0} max={100} unit="%" />
            <Slider label="Reinforced Concrete" value={params.concretePct} onChange={(v) => setHousingPct("concretePct", v)} min={0} max={100} unit="%" />
          </Section>

          <Section title="Infrastructure" icon="🔌" defaultOpen={false}>
            <Slider label="Power Lines" value={params.powerLinesPerMile} onChange={set("powerLinesPerMile")} min={0} max={50} unit="/mi" />
            <Slider label="Cell Towers" value={params.cellTowers} onChange={set("cellTowers")} min={0} max={200} unit=" total" />
            <Slider label="Bridges" value={params.bridges} onChange={set("bridges")} min={0} max={50} />
            <Slider label="Water Towers" value={params.waterTowers} onChange={set("waterTowers")} min={0} max={30} />
            <Slider label="Gas Lines" value={params.gasLinesPerMile} onChange={set("gasLinesPerMile")} min={0} max={40} unit="/mi" />
            <Slider label="Vehicles on Road" value={params.vehiclesPerMile} onChange={set("vehiclesPerMile")} min={0} max={500} unit="/mi" />
          </Section>

          <Section title="Agriculture" icon="🌾" defaultOpen={false}>
            <SelectInput label="Crop Type" value={params.cropType} onChange={set("cropType")}
              options={[["none", "None"], ["corn", "Corn ($950/ac)"], ["wheat", "Wheat ($520/ac)"], ["soybeans", "Soybeans ($600/ac)"], ["cotton", "Cotton ($780/ac)"]]} />
            <SelectInput label="Growth Stage" value={params.growthStage} onChange={set("growthStage")}
              options={[["planting", "Planting (30% value)"], ["mid_season", "Mid-Season (70% value)"], ["near_harvest", "Near Harvest (100% value)"]]} />
            <Slider label="Crop Coverage" value={params.cropAcresPct} onChange={set("cropAcresPct")} min={0} max={100} unit="%" />
            <Slider label="Livestock Density" value={params.livestockDensity} onChange={set("livestockDensity")} min={0} max={100} unit=" head/sq mi" />
          </Section>

          <Section title="Population & Preparedness" icon="👥" defaultOpen={false}>
            <Slider label="Population Density" value={params.popDensity} onChange={set("popDensity")} min={1} max={15000} unit="/sq mi" />
            <Slider label="Have Basements" value={params.basementPct} onChange={set("basementPct")} min={0} max={80} unit="%" />
            <Slider label="Storm Shelters" value={params.shelterPct} onChange={set("shelterPct")} min={0} max={50} unit="%" />
            <Slider label="Warning Lead Time" value={params.warningLeadTime} onChange={set("warningLeadTime")} min={0} max={60} unit=" min" />
            <Slider label="Preparedness Index" value={params.preparedness} onChange={set("preparedness")} min={0} max={1} step={0.05}
              info="Community education, siren coverage, weather app penetration" />
          </Section>

          {/* Model notes */}
          <div style={{ fontSize: 8, color: "#444", lineHeight: 1.5, marginTop: 12, padding: "8px 0", borderTop: "1px solid #1a1a2e" }}>
            <strong style={{ color: "#555" }}>MODEL REFERENCES:</strong><br />
            Fragility curves: HAZUS-MH / TTU Wind Engineering<br />
            Casualty model: Simmons & Sutter (2005), Ashley (2007)<br />
            Warning effectiveness: ~1.8% reduction per minute lead time<br />
            Injury:fatality ratio: ~15:1 (NOAA Storm Data)<br />
            Night lethality multiplier: 2.5× (Ashley 2007)<br />
            <strong style={{ color: "#4fc3f7" }}>POPULATION DATA:</strong><br />
            US: Census Bureau ACS 5-Year Estimates (2022)<br />
            &nbsp;&nbsp;via Census Data API + Geocoder API<br />
            &nbsp;&nbsp;api.census.gov | geocoding.geo.census.gov<br />
            Canada: Statistics Canada, 2021 Census<br />
            &nbsp;&nbsp;Table 98-10-0002-02 (CD level)<br />
            &nbsp;&nbsp;288 census divisions embedded<br />
            &nbsp;&nbsp;www12.statcan.gc.ca<br />
            World: UN WPP 2023 + CIA World Factbook<br />
            &nbsp;&nbsp;173 countries embedded (avg density)<br />
            &nbsp;&nbsp;Ocean/uninhabited → zero exposure
          </div>
        </div>

        {/* CENTER + RIGHT */}
        <div className="workspace-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* VISUALIZATION with MAP/PATH toggle */}
          <div className={`visualization-panel ${mobileView === "map" ? "" : "mobile-hidden"}`} style={{ height: "65%", padding: 12, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            {/* Viz mode toggle + country selector */}
            <div className="map-toolbar" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexShrink: 0 }}>
              <div style={{ display: "flex", background: "#1a1a2e", borderRadius: 5, overflow: "hidden", border: "1px solid #2a2a4a" }}>
                {["map", "path"].map((mode) => (
                  <button key={mode} onClick={() => setVizMode(mode)} style={{
                    padding: "4px 12px", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", border: "none", cursor: "pointer",
                    background: vizMode === mode ? "#2a2a5a" : "transparent",
                    color: vizMode === mode ? "#fff" : "#666",
                  }}>
                    {mode === "map" ? "🗺️ Map" : "📊 Path"}
                  </button>
                ))}
              </div>
              {vizMode === "map" && (
                <>
                  <div style={{ width: 1, height: 16, background: "#333" }} />
                  <div style={{ display: "flex", background: "#1a1a2e", borderRadius: 5, overflow: "hidden", border: "1px solid #2a2a4a" }}>
                    {[["us", "🇺🇸 US"], ["canada", "🇨🇦 Canada"], ["both", "Both"], ["world", "🌍 World"]].map(([val, label]) => (
                      <button key={val} onClick={() => setEnabledCountries(val)} style={{
                        padding: "4px 10px", fontSize: 9, fontWeight: 600, border: "none", cursor: "pointer",
                        background: enabledCountries === val ? "#2a2a5a" : "transparent",
                        color: enabledCountries === val ? "#fff" : "#666",
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 16, background: "#333" }} />
                  <div style={{ display: "flex", background: "#1a1a2e", borderRadius: 5, overflow: "hidden", border: "1px solid #2a2a4a" }}>
                    {[["satellite", "🛰️ Satellite"], ["streets", "🗺️ Map"], ["topo", "⛰️ Topo"], ["dark", "🌑 Dark"]].map(([val, label]) => (
                      <button key={val} onClick={() => setMapStyle(val)} style={{
                        padding: "4px 8px", fontSize: 9, fontWeight: 600, border: "none", cursor: "pointer",
                        background: mapStyle === val ? "#2a2a5a" : "transparent",
                        color: mapStyle === val ? "#fff" : "#666",
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {tornadoLat && (
                    <span style={{ fontSize: 9, color: "#666", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>
                      {isDrawing ? (
                        <span style={{ color: "#4fc3f7" }}>✏️ DRAWING ({customWaypoints.length} pts)</span>
                      ) : (
                        <>📍 {Math.abs(tornadoLat).toFixed(1)}°{tornadoLat >= 0 ? "N" : "S"}, {Math.abs(tornadoLng).toFixed(1)}°{tornadoLng >= 0 ? "E" : "W"}</>
                      )}
                    </span>
                  )}
                </>
              )}
            </div>
            {isDrawing && <div className="drawing-toolbar"><span>Tap the map to add points ({customWaypoints.length}).</span><button type="button" disabled={customWaypoints.length < 2} onClick={() => window.__tornadoFinishDraw?.()}>Finish drawing</button><button type="button" disabled={!customWaypoints.length} onClick={() => setCustomWaypoints(points => points.slice(0, -1))}>Undo point</button></div>}
            <div style={{ flex: 1, minHeight: 0 }}>
              {vizMode === "map" && !window.L ? (
                <p role="status">The map library could not load. Open Settings to enter route coordinates, or open Results to see the current scenario.</p>
              ) : vizMode === "map" ? (
                <InteractiveMap
                  enabledCountries={enabledCountries}
                  tornadoLat={tornadoLat}
                  tornadoLng={tornadoLng}
                  onPlaceTornado={handlePlaceTornado}
                  params={params}
                  result={result}
                  mapStyle={mapStyle}
                  pathMode={pathMode}
                  customWaypoints={customWaypoints}
                  onAddWaypoint={(lat, lng) => setCustomWaypoints(prev => [...prev, [lat, lng]])}
                  isDrawing={isDrawing}
                  simProgress={simProgress}
                  simRunning={simRunning}
                />
              ) : (
                <TornadoPathViz params={params} result={result} />
              )}
            </div>
          </div>

          {/* LIVE SIMULATION CONTROLS */}
          <div className={`simulation-explainer ${mobileView === "results" ? "" : "mobile-hidden"}`} style={{ padding: "7px 12px", background: "#111426", borderTop: "1px solid #242a43", color: "#aeb3c4", fontSize: 10, lineHeight: 1.4 }}>
            Estimates recalculate immediately when settings change. <strong style={{ color: "#e8eaf0" }}>Play path</strong> only animates how the modeled impacts accumulate along the route.
          </div>
          <div className={`simulation-controls ${mobileView === "map" ? "" : "mobile-hidden"}`} style={{
            flexShrink: 0, borderTop: "1px solid #1e1e3a", background: "#0a0a18",
            padding: "6px 12px", display: "flex", alignItems: "center", gap: 8,
          }}>
            {!simRunning ? (
              <button onClick={startSimulation} disabled={tornadoLat == null} style={{
                padding: "5px 14px", fontSize: 10, fontWeight: 700, border: "none", cursor: tornadoLat != null ? "pointer" : "default",
                borderRadius: 4, background: tornadoLat != null ? "#2e7d32" : "#333",
                color: tornadoLat != null ? "#fff" : "#666", letterSpacing: "0.04em",
              }}>
                ▶ PLAY PATH
              </button>
            ) : (
              <>
                <button aria-label={simPaused ? "Resume playback" : "Pause playback"} onClick={() => setSimPaused(!simPaused)} style={{
                  padding: "5px 10px", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
                  borderRadius: 4, background: "#1a1a2e", color: "#fff",
                }}>
                  {simPaused ? "▶" : "⏸"}
                </button>
                <button aria-label="Stop playback" onClick={stopSimulation} style={{
                  padding: "5px 10px", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
                  borderRadius: 4, background: "#333", color: "#ef5350",
                }}>
                  ⏹
                </button>
              </>
            )}

            {/* Speed control */}
            <div style={{ display: "flex", background: "#1a1a2e", borderRadius: 4, overflow: "hidden", border: "1px solid #2a2a4a" }}>
              {[1, 2, 5, 10].map(s => (
                <button key={s} onClick={() => setSimSpeed(s)} style={{
                  padding: "3px 8px", fontSize: 9, fontWeight: 700, border: "none", cursor: "pointer",
                  background: simSpeed === s ? "#2a2a5a" : "transparent",
                  color: simSpeed === s ? "#fff" : "#666",
                }}>
                  {s}x
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ flex: 1, height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden", cursor: "pointer" }}
              onClick={(e) => {
                if (!simRunning && !simLiveStats) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setSimProgress(frac);
                if (!simRunning) { setSimRunning(true); setSimPaused(true); }
              }}>
              <div style={{
                width: `${simProgress * 100}%`, height: "100%",
                background: `linear-gradient(90deg, #4fc3f7, ${result.ef.color})`,
                borderRadius: 3, transition: simRunning && !simPaused ? "none" : "width 0.1s",
              }} />
            </div>

            {/* Time display */}
            {simLiveStats && (
              <span style={{ fontSize: 10, color: "#888", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                {simLiveStats.elapsed < 60
                  ? `${simLiveStats.elapsed.toFixed(0)}m`
                  : `${Math.floor(simLiveStats.elapsed / 60)}h ${Math.round(simLiveStats.elapsed % 60)}m`
                }
                {" / "}
                {Math.round(params.pathLength / params.forwardSpeed * 60)}m
              </span>
            )}

            {/* Live climbing stats */}
            {simRunning && simLiveStats && (
              <div style={{ display: "flex", gap: 10, marginLeft: 4, alignItems: "center" }}>
                {simLiveStats.currentHour != null && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: simLiveStats.currentHour >= 20 || simLiveStats.currentHour < 5 ? "#ef5350" : simLiveStats.currentHour >= 17 || simLiveStats.currentHour < 8 ? "#ffb74d" : "#81c784", fontFamily: "'JetBrains Mono', monospace" }}>
                    🕐 {Math.floor(simLiveStats.currentHour) === 0 ? "12" : Math.floor(simLiveStats.currentHour) > 12 ? Math.floor(simLiveStats.currentHour) - 12 : Math.floor(simLiveStats.currentHour)}:{String(Math.floor((simLiveStats.currentHour % 1) * 60)).padStart(2, "0")} {simLiveStats.currentHour >= 12 ? "PM" : "AM"}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ef5350", fontFamily: "'JetBrains Mono', monospace" }}>
                  ☠ {simLiveStats.fatalities}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ffb74d", fontFamily: "'JetBrains Mono', monospace" }}>
                  🤕 {simLiveStats.injuries}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4fc3f7", fontFamily: "'JetBrains Mono', monospace" }}>
                  💰 {fmt(simLiveStats.damage)}
                </span>
                {simLiveStats.currentRegion && (
                  <span style={{ fontSize: 9, color: "#81c784" }}>
                    📍 {simLiveStats.currentRegion}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={`result-context ${mobileView === "results" ? "" : "mobile-hidden"}`}>
            <ResultContext
              densitySource={densitySource}
              censusData={censusData}
              censusLoading={censusLoading}
              censusError={censusError}
              onRetry={() => handlePlaceTornado(tornadoLat, tornadoLng)}
            />
          </div>

          {/* TABS */}
          <div className={`results-tabs ${mobileView === "results" ? "" : "mobile-hidden"}`} style={{
            display: "flex", borderBottom: "1px solid #1e1e3a", borderTop: "1px solid #1e1e3a",
            padding: "0 12px", flexShrink: 0, background: "#0e0e22",
          }}>
            {tabs.map((tab) => (
              <button key={tab} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} style={{
                padding: "8px 14px", fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer",
                color: activeTab === tab ? "#ef5350" : "#666",
                borderBottom: activeTab === tab ? "2px solid #ef5350" : "2px solid transparent",
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* RESULTS PANEL */}
          <div className={`results-panel ${mobileView === "results" ? "" : "mobile-hidden"}`} style={{ flex: 1, overflowY: "auto", padding: 14, scrollbarWidth: "thin", scrollbarColor: "#333 transparent" }}>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#f4f5f8", fontSize: 13, fontWeight: 800 }}>Modeled estimate</div>
              <div style={{ color: "#8e94a8", fontSize: 10, lineHeight: 1.45, marginTop: 3 }}>
                Scenario outputs are estimates, not a forecast or damage survey. The model does not calculate uncertainty ranges; actual outcomes can differ substantially.
              </div>
            </div>

            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ScenarioStatistics params={params} result={result} routeMiles={routeMiles}  pathPoints={pathPoints} densitySource={densitySource} pathMode={pathMode} />
                {/* EF Badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  background: `linear-gradient(135deg, ${result.ef.color}15, #12122a)`,
                  borderRadius: 10, border: `1px solid ${result.ef.color}40`,
                }}>
                  <div style={{
                    fontSize: 36, fontWeight: 900, color: result.ef.color,
                    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                  }}>
                    {result.ef.rating}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{result.ef.label} Damage</div>
                    <div style={{ fontSize: 10, color: "#888" }}>
                      Peak: {result.peakWind} mph | Effective: {result.effectiveWind} mph | Exposure: {result.exposureDuration} min
                    </div>
                  </div>
                </div>

                {/* Key stats */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Stat big label="Fatalities" value={numFmt(result.fatalities)} color="#ef5350" sub={`${numFmt(result.populationInPath)} in path`} />
                  <Stat big label="Injuries" value={numFmt(result.injuries)} color="#ffb74d" sub="~15:1 ratio" />
                  <Stat big label="Total Damage" value={fmt(result.totalEconomicImpact)} color="#4fc3f7"
                    sub={(() => {
                      const local = formatLocalCurrency(result.totalEconomicImpact, censusData?.iso);
                      return local ? `${local.text} ${local.code}` : "All categories";
                    })()} />
                  <Stat big label="Destroyed" value={numFmt(result.totalDestroyed)} color="#ff8a65" sub={`of ${numFmt(result.totalStructures)}`} />
                </div>

                {/* Multi-segment path info */}
                {result._multiSegment && result._countiesCrossed && result._countiesCrossed.length > 0 && (
                  <div style={{ background: "#0d1428", borderRadius: 8, padding: "10px 14px", border: "1px solid #1a2a4a" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#4fc3f7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      🗺️ Path crosses {result._segmentCount} segment{result._segmentCount > 1 ? "s" : ""} through {result._countiesCrossed.length} region{result._countiesCrossed.length > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: 10, color: "#aaa", lineHeight: 1.6 }}>
                      {result._countiesCrossed.map((name, i) => (
                        <span key={i}>
                          <span style={{ color: "#81c784" }}>{name}</span>
                          {i < result._countiesCrossed.length - 1 && <span style={{ color: "#444" }}> → </span>}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 4 }}>
                      {result._usesLocationData ? "Segments use nearby area or national density estimates where available." : "Every segment uses your scenario density and infrastructure inputs."}
                    </div>
                  </div>
                )}

                {/* Damage breakdown bar */}
                <div style={{ background: "#12122a", borderRadius: 8, padding: 14, border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Damage Breakdown
                  </div>
                  <MiniBar items={[
                    { label: "Residential", value: result.residentialLoss, display: fmt(result.residentialLoss), color: "#ef5350" },
                    { label: "Infrastructure", value: result.infraLoss, display: fmt(result.infraLoss), color: "#ffb74d" },
                    { label: "Vehicles", value: result.vehicleLoss, display: fmt(result.vehicleLoss), color: "#ff8a65" },
                    { label: "Crops", value: result.cropLoss, display: fmt(result.cropLoss), color: "#81c784" },
                    { label: "Livestock", value: result.livestockLoss, display: fmt(result.livestockLoss), color: "#a5d6a7" },
                    { label: "Flood Damage", value: result.floodDamage, display: fmt(result.floodDamage), color: "#4fc3f7" },
                    { label: "Emergency Response", value: result.emergencyResponseCost, display: fmt(result.emergencyResponseCost), color: "#ce93d8" },
                    { label: "Business Interruption", value: result.businessInterruption, display: fmt(result.businessInterruption), color: "#90a4ae" },
                  ]} />
                </div>
              </div>
            )}

            {activeTab === "structures" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Stat label="Total Structures" value={numFmt(result.totalStructures)} />
                  <Stat label="Destroyed" value={numFmt(result.totalDestroyed)} color="#ef5350" />
                  <Stat label="Damaged" value={numFmt(result.totalDamaged)} color="#ffb74d" />
                  <Stat label="Residential Loss" value={fmt(result.residentialLoss)} color="#4fc3f7" />
                </div>
                {Object.entries(result.structureDamage).map(([type, data]) => (
                  <div key={type} style={{ background: "#12122a", borderRadius: 8, padding: 12, border: "1px solid #1e1e3a" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#ccc", marginBottom: 8, textTransform: "capitalize" }}>
                      {type.replace(/_/g, " ")} — {data.total} structures
                    </div>
                    <MiniBar items={[
                      { label: "Destroyed", value: data.destroyed, color: "#ef5350" },
                      { label: "Damaged, not destroyed", value: data.damaged, color: "#ffb74d" },
                    ]} maxVal={data.total} />
                    <div style={{ fontSize: 9, color: "#555", marginTop: 6 }}>
                      Fragility at {result.peakWind} mph: {(interpolateFragility(type, result.peakWind) * 100).toFixed(1)}% destruction probability
                    </div>
                  </div>
                ))}

                <div style={{ background: "#12122a", borderRadius: 8, padding: 12, border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Infrastructure</div>
                  <MiniBar items={[
                    { label: "Power Lines (mi)", value: result.powerLinesDestroyed, color: "#ffb74d" },
                    { label: "Cell Towers", value: result.cellTowersDestroyed, color: "#ff8a65" },
                    { label: "Bridges", value: result.bridgesDestroyed, color: "#ef5350" },
                    { label: "Water Towers", value: result.waterTowersDestroyed, color: "#4fc3f7" },
                    { label: "Gas Lines (mi)", value: result.gasLinesDestroyed, color: "#ce93d8" },
                    { label: "Vehicles", value: result.vehiclesDestroyed, color: "#90a4ae" },
                  ]} />
                </div>
              </div>
            )}

            {activeTab === "casualties" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Stat big label="Population in Path" value={numFmt(result.populationInPath)} />
                  <Stat big label="Fatalities" value={numFmt(result.fatalities)} color="#ef5350" />
                  <Stat big label="Injuries" value={numFmt(result.injuries)} color="#ffb74d" />
                </div>

                <div style={{ background: "#12122a", borderRadius: 8, padding: 14, border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Casualty Modifiers
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#999" }}>Warning reduction ({params.warningLeadTime} min lead time)</span>
                      <span style={{ color: result.warningReduction < 0.7 ? "#81c784" : "#ffb74d", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {((1 - result.warningReduction) * 100).toFixed(0)}% fewer deaths
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#999" }}>Time of day ({params.timeOfDay >= 12 ? (params.timeOfDay === 12 ? "12" : params.timeOfDay - 12) + " PM" : (params.timeOfDay === 0 ? "12" : params.timeOfDay) + " AM"})</span>
                      <span style={{ color: result.nightMult > 1 ? "#ef5350" : "#81c784", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {result.nightMult}× multiplier
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#999" }}>Preparedness index ({params.preparedness})</span>
                      <span style={{ color: "#81c784", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {((1 - result.preparednessMult) * 100).toFixed(0)}% reduction
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#12122a", borderRadius: 8, padding: 14, border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Shelter Distribution Effectiveness
                  </div>
                  <MiniBar items={[
                    { label: `No shelter (${params.mobileHomePct}%)`, value: FATALITY_RATES.no_shelter[`ef${result.efIndex}`] || 0, display: `${((FATALITY_RATES.no_shelter[`ef${result.efIndex}`] || 0) * 100).toFixed(2)}% fatality rate`, color: "#ef5350" },
                    { label: `Interior room`, value: FATALITY_RATES.interior_room[`ef${result.efIndex}`] || 0, display: `${((FATALITY_RATES.interior_room[`ef${result.efIndex}`] || 0) * 100).toFixed(3)}% fatality rate`, color: "#ffb74d" },
                    { label: `Basement (${params.basementPct}%)`, value: FATALITY_RATES.basement[`ef${result.efIndex}`] || 0, display: `${((FATALITY_RATES.basement[`ef${result.efIndex}`] || 0) * 100).toFixed(4)}% fatality rate`, color: "#81c784" },
                    { label: `Storm shelter (${params.shelterPct}%)`, value: FATALITY_RATES.storm_shelter[`ef${result.efIndex}`] || 0, display: `${((FATALITY_RATES.storm_shelter[`ef${result.efIndex}`] || 0) * 100).toFixed(4)}% fatality rate`, color: "#4fc3f7" },
                  ]} />
                </div>

                {result.livestockLost > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Stat label="Livestock Lost" value={numFmt(result.livestockLost)} color="#ff8a65" />
                    <Stat label="Livestock Loss" value={fmt(result.livestockLoss)} color="#ffb74d" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "economic" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  background: `linear-gradient(135deg, #4fc3f715, #12122a)`,
                  borderRadius: 10, border: "1px solid #4fc3f740", padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#888" }}>TOTAL ECONOMIC IMPACT</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#4fc3f7", fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(result.totalEconomicImpact)}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#12122a", borderRadius: 8, padding: 14, border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Cost Breakdown
                  </div>
                  <MiniBar items={[
                    { label: "Residential", value: result.residentialLoss, display: fmt(result.residentialLoss), color: "#ef5350" },
                    { label: "Infrastructure", value: result.infraLoss, display: fmt(result.infraLoss), color: "#ffb74d" },
                    { label: "Vehicles", value: result.vehicleLoss, display: fmt(result.vehicleLoss), color: "#ff8a65" },
                    { label: "Crops & Livestock", value: result.cropLoss + result.livestockLoss, display: fmt(result.cropLoss + result.livestockLoss), color: "#81c784" },
                    { label: "Flood Damage", value: result.floodDamage, display: fmt(result.floodDamage), color: "#4fc3f7" },
                    { label: "Emergency Response", value: result.emergencyResponseCost, display: fmt(result.emergencyResponseCost), color: "#ce93d8" },
                    { label: "Business Interruption", value: result.businessInterruption, display: fmt(result.businessInterruption), color: "#90a4ae" },
                  ]} />
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Stat label="Per Structure" value={result.totalStructures > 0 ? fmt(result.totalEconomicImpact / result.totalStructures) : "$0"} />
                  <Stat label="Per Capita" value={result.populationInPath > 0 ? fmt(result.totalEconomicImpact / result.populationInPath) : "$0"} />
                  <Stat label="Per Mile of Path" value={fmt(result.totalEconomicImpact / params.pathLength)} />
                </div>

                {result.cropAcres > 0 && (
                  <div style={{ background: "#12122a", borderRadius: 8, padding: 12, border: "1px solid #1e1e3a" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", marginBottom: 6 }}>AGRICULTURAL</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>
                      {numFmt(result.cropAcres)} acres of {params.cropType} affected ({params.growthStage.replace("_", " ")})
                    </div>
                    <div style={{ fontSize: 11, color: "#81c784", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(result.cropLoss)} crop loss + {fmt(result.livestockLoss)} livestock
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "historical" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                  Your simulated tornado compared to historical events by total damage:
                </div>
                <div style={{ background: "#12122a", borderRadius: 8, padding: 14, border: "1px solid #1e1e3a" }}>
                  <HistoricalComparison result={result} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {HISTORICAL.map((h, i) => (
                    <div key={i} style={{
                      background: "#12122a", borderRadius: 6, padding: "8px 10px",
                      border: "1px solid #1e1e3a", flex: "1 1 140px", minWidth: 140,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: EF_SCALE[Math.min(h.ef, 5)].color }}>{h.name}</div>
                      <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                        EF{h.ef} | {h.fatalities} killed | {numFmt(h.injuries)} injured | {fmt(h.damage)}
                      </div>
                      <div style={{ fontSize: 9, color: "#555" }}>
                        {h.pathLength} mi × {h.pathWidth} yd
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TornadoSimulator />
  </React.StrictMode>
);

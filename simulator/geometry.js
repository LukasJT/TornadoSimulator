export function generatePathPoints(tornadoLat, tornadoLng, params, pathMode, customWaypoints) {
  const numSteps = 30;

  if (pathMode === "draw" && customWaypoints.length >= 2) {
    // Draw mode: use the waypoints directly (already a polyline)
    return customWaypoints;
  }

  if (pathMode === "curved") {
    // Curved mode: Bezier arc from start to end, with curvature controlling the control point offset
    const pathMiles = params.pathLength;
    const pathDeg = pathMiles / 69;
    const dirRad = params.direction * Math.PI / 180;
    const cosLat = Math.cos(tornadoLat * Math.PI / 180);
    const endLat = tornadoLat + pathDeg * Math.cos(dirRad);
    const endLng = tornadoLng + pathDeg * Math.sin(dirRad) / cosLat;

    // Control point is offset perpendicular to the path by curvature amount
    const midLat = (tornadoLat + endLat) / 2;
    const midLng = (tornadoLng + endLng) / 2;
    const curvatureRad = (params.curvature || 0) * Math.PI / 180;
    const perpAngle = dirRad + Math.PI / 2;
    // Offset proportional to path length and curvature
    const offsetDeg = pathDeg * Math.sin(curvatureRad) * 0.5;
    const ctrlLat = midLat + offsetDeg * Math.cos(perpAngle);
    const ctrlLng = midLng + offsetDeg * Math.sin(perpAngle) / cosLat;

    // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const points = [];
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const mt = 1 - t;
      const lat = mt * mt * tornadoLat + 2 * mt * t * ctrlLat + t * t * endLat;
      const lng = mt * mt * tornadoLng + 2 * mt * t * ctrlLng + t * t * endLng;
      points.push([lat, lng]);
    }
    return points;
  }

  // Straight mode (default): just start and end
  const pathMiles = params.pathLength;
  const pathDeg = pathMiles / 69;
  const dirRad = params.direction * Math.PI / 180;
  const cosLat = Math.cos(tornadoLat * Math.PI / 180);
  const endLat = tornadoLat + pathDeg * Math.cos(dirRad);
  const endLng = tornadoLng + pathDeg * Math.sin(dirRad) / cosLat;
  return [[tornadoLat, tornadoLng], [endLat, endLng]];
}

// Calculate total path length in miles from an array of [lat, lng] points
export function pathLengthFromPoints(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const radians = Math.PI / 180;
    const lat1 = points[i - 1][0] * radians;
    const lat2 = points[i][0] * radians;
    const dLat = lat2 - lat1;
    const dLng = (points[i][1] - points[i - 1][1]) * radians;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    total += 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
  }
  return total;
}

// Generate swath polygon from path points and width
export function generateSwathPolygon(pathPoints, pathWidthYards) {
  if (pathPoints.length < 2) return [];
  const halfWidthDeg = (pathWidthYards / 1760) / 69 / 2;
  const leftSide = [];
  const rightSide = [];

  for (let i = 0; i < pathPoints.length; i++) {
    // Calculate direction at this point
    let dirLat, dirLng;
    if (i === 0) {
      dirLat = pathPoints[1][0] - pathPoints[0][0];
      dirLng = pathPoints[1][1] - pathPoints[0][1];
    } else if (i === pathPoints.length - 1) {
      dirLat = pathPoints[i][0] - pathPoints[i - 1][0];
      dirLng = pathPoints[i][1] - pathPoints[i - 1][1];
    } else {
      dirLat = pathPoints[i + 1][0] - pathPoints[i - 1][0];
      dirLng = pathPoints[i + 1][1] - pathPoints[i - 1][1];
    }
    const angle = Math.atan2(dirLng, dirLat);
    const perpAngle = angle + Math.PI / 2;
    const cosLat = Math.cos(pathPoints[i][0] * Math.PI / 180);

    // Width tapers at start and end for realism
    const frac = pathPoints.length > 1 ? i / (pathPoints.length - 1) : 0.5;
    const taper = 1 - 0.5 * Math.pow(2 * frac - 1, 4); // smooth taper at edges
    const w = halfWidthDeg * taper;

    const dLat = w * Math.cos(perpAngle);
    const dLng = w * Math.sin(perpAngle) / cosLat;
    leftSide.push([pathPoints[i][0] + dLat, pathPoints[i][1] + dLng]);
    rightSide.push([pathPoints[i][0] - dLat, pathPoints[i][1] - dLng]);
  }
  // Close the polygon: left side forward, right side backward
  return [...leftSide, ...rightSide.reverse()];
}

// ─── INTERACTIVE MAP COMPONENT (Leaflet.js) ─────────────────────────────────

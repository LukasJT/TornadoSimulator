import fs from 'fs';
import path from 'path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', '.agents', '.codex', 'dist', 'node_modules']);

const replacements = new Map(Object.entries({
  '/1925-tri-state-tornado/': '/tri-state-1925/',
  '/beaufort-wind-scale/': '/beaufort-scale/',
  '/cloud-identification-game/': '/cloud-id-game/',
  '/community-tornado-shelters/': '/community-storm-shelter-guide/',
  '/country-by-country-tornado-guide/': '/tornadoes-around-the-world/',
  '/elie-2007/': '/elie-manitoba-2007/',
  '/european-tornado-season-guide/': '/tornadoes-in-europe/',
  '/finland-heat-cold-wildfire-warning-guide/': '/finland-weather-risk-guide/',
  '/fire-tornado-firestorm-explainer/': '/fire-tornado-science/',
  '/hail-damage-car-guide/': '/hail-damage-car-roof-guide/',
  '/hail-size-scale-explorer/': '/hail-size-scale/',
  '/illinois-tornadoes/': '/tornado-in-illinois-history/',
  '/interactive-tornado-alley-map/': '/tornado-alley-map/',
  '/kid-friendly-tornadoes-article/': '/tornadoes-for-kids/',
  '/landspout/': '/landspouts-vs-tornadoes/',
  '/latvia-gulf-of-riga-coastal-storm-guide/': '/latvia-riga-gulf-flood-wind-guide/',
  '/lightning-distance-game/': '/thunder-distance/',
  '/microburst-explainer/': '/what-is-a-microburst/',
  '/monthly-tornado-forecast/': '/tornado-forecast-models/',
  '/moore-tornadoes/': '/moore-oklahoma-tornadoes/',
  '/power-outage-after-storm/': '/weather-power-outage-kit/',
  '/privacy/': '/privacy-policy/',
  '/south-carolina-tornadoes/': '/tornado-in-south-carolina-history/',
  '/spaghetti-models-explained/': '/hurricane-spaghetti-models-explained/',
  '/storm-chaser-gear-checklist/': '/storm-chaser-gear-list/',
  '/storm-prep-checklist/': '/yard-storm-prep-guide/',
  '/storm-spotter-guide/': '/skywarn-spotter-training-guide/',
  '/terms/': '/terms-and-conditions/',
  '/thunder-distance-calculator/': '/thunder-distance/',
  '/tornado-chase-log-tracker/': '/chase-log/',
  '/tornado-chasers/': '/famous-storm-chasers/',
  '/tornado-in-cities/': '/tornadoes-in-cities/',
  '/tornado-pop-culture/': '/tornadoes-in-movies/',
  '/tornado-safe-room-design/': '/tornado-safe-rooms-vs-shelters/',
  '/tornado-safety-checklist/': '/tornado-safety-checklist-printable/',
  '/tornado-safety-hotel/': '/hotel-tornado-safety/',
  '/tornado-season-readiness-checklist/': '/tornado-watch-prep-list/',
  '/tornado-shapes/': '/tornado-shapes-and-appearances/',
  '/tropical-spaghetti-models-explained/': '/hurricane-spaghetti-models-explained/',
  '/warning-vs-watch/': '/watch-vs-warning/',
  '/weather-alerts-guide/': '/weather-alert-guides/',
  '/weather-app-comparison/': '/weather-app-comparison-2026/',
  '/weather-radar-guide/': '/radar-map-reading-guides/',
  '/weather-satellites/': '/weather-satellite-guide/',
  '/weather-symbols-reference/': '/weather-map-symbols/',
  '/what-is-a-mesocyclone/': '/mesocyclone/',
  '/wildfire-smoke-weather-guide/': '/wildfire-smoke-forecast-guide/',
}));

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith('.html') || entry.name === 'content-index.js')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

let changedFiles = 0;
let replacementsMade = 0;

for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  let next = html;
  for (const [from, to] of replacements) {
    const parts = next.split(from);
    if (parts.length > 1) {
      replacementsMade += parts.length - 1;
      next = parts.join(to);
    }
  }
  if (next !== html) {
    fs.writeFileSync(file, next);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, replacementsMade }, null, 2));

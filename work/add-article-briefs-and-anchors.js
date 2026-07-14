import fs from 'fs';
import path from 'path';

const root = process.cwd();
const marker = 'data-generated="article-brief-v3"';
const today = '2026-07-14';

const skipDirs = new Set(['.git', '.agents', '.codex', 'node_modules', 'work', 'dist', 'outputs']);
const skipSlugs = new Set([
  '',
  'about',
  'about-us',
  'articles',
  'contact',
  'privacy-policy',
  'search',
  'simulator',
  'safety',
  'terms-and-conditions',
  'topics',
  'learn',
  'cloud-id-game',
  'dew-point-calculator',
  'ef-scale-explorer',
  'ef-scale-game',
  'hurricane-category-explorer',
  'hurricane-namer',
  'pressure-unit-converter',
  'radar-signature-game',
  'storm-chaser-game',
  'supercell-simulator',
  'thunder-distance',
  'tornadle',
  'tornado-kit-builder',
  'tornado-namer',
  'tornado-risk-calculator',
  'tornado-shape-game',
  'weather-crossword',
  'weather-memory-match',
  'weather-word-search',
  'which-storm-chaser-are-you',
  'which-tornado-are-you',
  'wind-speed-converter'
]);

const kindCopy = {
  tornado: {
    focus: 'tornado risk, warning context, storm structure, and shelter decisions',
    bestFor: 'understanding when a rotating storm becomes a practical shelter problem',
    decision: 'Move to shelter sooner when a warning, confirmed rotation, debris signature, or reliable local report lines up with your location.',
    watchFor: 'warning polygons, radar rotation, debris, fast storm motion, night timing, and weak shelter options',
    source: ['National Weather Service tornado safety', 'https://www.weather.gov/safety/tornado']
  },
  hurricane: {
    focus: 'tropical weather, surge, wind, rainfall, evacuation timing, and inland impacts',
    bestFor: 'separating the storm category from the hazards that actually affect a location',
    decision: 'Act before tropical-storm-force winds, water over roads, or local evacuation deadlines make movement harder.',
    watchFor: 'storm surge, rainfall totals, evacuation zones, cone updates, tornado risk, and power outage timing',
    source: ['National Hurricane Center', 'https://www.nhc.noaa.gov/']
  },
  flood: {
    focus: 'heavy rain, drainage, river response, flash flooding, and road safety',
    bestFor: 'spotting where water can cut off travel or damage property before the peak arrives',
    decision: 'Delay travel or choose higher ground when warnings, gauges, road closures, or repeated rain bands show water is rising.',
    watchFor: 'rainfall rate, training storms, saturated ground, river gauges, low crossings, and basement or underpass risk',
    source: ['National Weather Service flood safety', 'https://www.weather.gov/safety/flood']
  },
  winter: {
    focus: 'snow, ice, wind, visibility, cold, road conditions, and outage risk',
    bestFor: 'separating snow depth from ice, wind, cold, and visibility impacts',
    decision: 'Change travel plans early when ice, whiteout visibility, drifting snow, or dangerous wind chill enters the forecast.',
    watchFor: 'freezing rain, road temperature, wind gusts, snow bands, power lines, and the rain-snow transition',
    source: ['National Weather Service winter safety', 'https://www.weather.gov/safety/winter']
  },
  heat: {
    focus: 'heat, humidity, smoke, drought, fire weather, air quality, and health stress',
    bestFor: 'recognizing when weather becomes a health and infrastructure stress problem',
    decision: 'Move work, travel, pets, and vulnerable people into safer conditions before cooling options fail or air quality worsens.',
    watchFor: 'warm nights, humidity, smoke, stagnant air, fire weather, drought stress, and people without cooling',
    source: ['National Weather Service heat safety', 'https://www.weather.gov/safety/heat']
  },
  radar: {
    focus: 'forecast tools, radar, satellite, models, observations, and warning interpretation',
    bestFor: 'understanding what each weather product can and cannot tell you',
    decision: 'Trust trends more when several official tools agree, and stay cautious when radar, model guidance, and observations conflict.',
    watchFor: 'update time, radar mode, model spread, storm growth, official discussions, and local observations',
    source: ['NOAA/NSSL radar basics', 'https://www.nssl.noaa.gov/education/svrwx101/radar/']
  },
  safety: {
    focus: 'preparedness, sheltering, alerts, family plans, recovery, and practical safety actions',
    bestFor: 'turning weather information into a household, school, business, or travel plan',
    decision: 'Choose the action trigger in advance: shelter, delay travel, secure property, check on someone, or avoid a hazard area.',
    watchFor: 'building type, alert access, pets, mobility needs, medical devices, road closures, and post-storm hazards',
    source: ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
  },
  history: {
    focus: 'historical storms, damage surveys, warning lessons, exposure, and long-term context',
    bestFor: 'learning what a past event teaches without treating every detail as a forecast for the next storm',
    decision: 'Use the event as a planning lesson: what warning, shelter, building, communication, or recovery detail would change today?',
    watchFor: 'survey uncertainty, population exposure, building vulnerability, warning access, and revised historical records',
    source: ['NOAA Storm Events Database', 'https://www.ncei.noaa.gov/products/storm-events']
  },
  education: {
    focus: 'weather concepts, classroom learning, science projects, observation, and safe experiments',
    bestFor: 'connecting a weather idea to something a student or reader can observe, measure, or compare',
    decision: 'Keep activities indoors or observational whenever weather is active, and compare conclusions with official data.',
    watchFor: 'measurable variables, repeatable observations, unit confusion, safety limits, and what a model cannot prove',
    source: ['NOAA SciJinks weather resources', 'https://scijinks.gov/weather/']
  },
  marine: {
    focus: 'coastal weather, marine forecasts, tides, waves, currents, fog, and water safety',
    bestFor: 'recognizing when wind and water make familiar beaches, lakes, harbors, or routes unsafe',
    decision: 'Avoid exposed water and shorelines when waves, lightning, fog, cold water, or official marine warnings increase.',
    watchFor: 'onshore wind, wave height, tide timing, currents, water temperature, visibility, and beach or boating restrictions',
    source: ['National Weather Service marine weather safety', 'https://www.weather.gov/safety/safeboating']
  },
  international: {
    focus: 'country-specific warnings, local agencies, seasonal hazards, travel decisions, and regional context',
    bestFor: 'translating local warning systems into practical weather decisions',
    decision: 'Use the national meteorological service and local emergency authorities first, then compare regional context for background.',
    watchFor: 'warning colors, hazard wording, transport routes, coastal water, rivers, power outages, and local language differences',
    source: ['Meteoalarm live warnings', 'https://meteoalarm.org/']
  },
  general: {
    focus: 'weather science, forecast context, safety implications, and practical interpretation',
    bestFor: 'turning a weather term into a clearer decision about timing, exposure, and confidence',
    decision: 'Decide what the information changes: shelter, travel, outdoor plans, water safety, health, power, or continued monitoring.',
    watchFor: 'official updates, local terrain, time of day, overlapping hazards, observation trends, and confidence language',
    source: ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
  }
};

const signalRules = [
  ['tornado warning', 'tornado warning'],
  ['warning polygon', 'warning polygon'],
  ['tornado', 'tornado risk'],
  ['supercell', 'supercells'],
  ['radar', 'radar'],
  ['satellite', 'satellite'],
  ['forecast', 'forecast confidence'],
  ['model', 'weather models'],
  ['hurricane', 'hurricane impacts'],
  ['typhoon', 'typhoon impacts'],
  ['cyclone', 'cyclone impacts'],
  ['storm surge', 'storm surge'],
  ['flood', 'flooding'],
  ['rain', 'heavy rain'],
  ['river', 'river response'],
  ['winter', 'winter weather'],
  ['snow', 'snow'],
  ['ice', 'ice'],
  ['blizzard', 'blizzard conditions'],
  ['heat', 'heat stress'],
  ['drought', 'drought'],
  ['smoke', 'smoke'],
  ['air quality', 'air quality'],
  ['wildfire', 'fire weather'],
  ['wind', 'damaging wind'],
  ['hail', 'hail'],
  ['lightning', 'lightning'],
  ['marine', 'marine weather'],
  ['beach', 'beach hazards'],
  ['rip current', 'rip currents'],
  ['coastal', 'coastal impacts'],
  ['safety', 'safety planning'],
  ['shelter', 'shelter decisions'],
  ['emergency', 'emergency planning'],
  ['school', 'school planning'],
  ['business', 'business continuity'],
  ['history', 'historical context'],
  ['record', 'weather records'],
  ['career', 'weather careers'],
  ['classroom', 'classroom learning'],
  ['australia', 'Australia warnings'],
  ['finland', 'Finland warnings'],
  ['sweden', 'Sweden warnings'],
  ['latvia', 'Latvia warnings']
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.name === 'index.html') {
      files.push(fullPath);
    }
  }
  return files;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(html) {
  const text = stripTags(html);
  return text ? text.split(/\s+/).length : 0;
}

function textFromMatch(html, regex, fallback) {
  const match = html.match(regex);
  if (!match) return fallback;
  return stripTags(match[1]).replace(/\s+/g, ' ').trim() || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanTitle(title) {
  return title
    .replace(/\s*\|\s*Tornado Hub\s*$/i, '')
    .replace(/\s+-\s+Tornado Hub\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  const slug = stripTags(value)
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || 'section';
}

function classify(slug, title, category) {
  const haystack = `${slug} ${title} ${category}`.toLowerCase();
  if (/australia|finland|sweden|latvia|international|mete[o]?alarm|bom|fmi|smhi|gulf-of-riga|baltic|european-severe-weather|eswd/.test(haystack)) return 'international';
  if (/school|student|classroom|project|experiment|lesson|career|meteorologist|hydrologist|science-fair|vocabulary|kids|teacher|worksheet|activity|presentation/.test(haystack)) return 'education';
  if (/history|timeline|record|records|disaster|deadliest|costliest|outbreak|legacy|lessons|1974|2011|1936|1953|1925|1899|1999|2013|2020|2021|2022|2023|2024|xenia|joplin|moore|jarrell|tri-state|waco|tupelo|gainesville|greensburg|mayfield|plainfield|woodward|flint|fargo|barrie|edmonton|regina|vicksburg|natchez|topeka|wichita-falls/.test(haystack)) return 'history';
  if (/hurricane|typhoon|cyclone|tropical-storm|tropical-cyclone|tropical-depression|storm-surge|surge|evacuation-zone|andrew|katrina|harvey|sandy|galveston/.test(haystack)) return 'hurricane';
  if (/safety|preparedness|emergency|emergency-kit|kit|drill|shelter|go-bag|outage|generator|carbon-monoxide|downed-power|first-aid|action-plan|cleanup|recovery-guide|storm-prep|weather-prep|continuity|checklist|safe-room|family-communication|emergency-communication/.test(haystack)) return 'safety';
  if (/tornado|twister|supercell|funnel|wall-cloud|mesocyclone|hook-echo|dryline|ef-scale|fujita|wedge|rope|waterspout|landspout|qlcs|debris-signature|tornado-alley|dixie-alley|siren/.test(haystack)) return 'tornado';
  if (/flood|rainfall|rainstorm|river|atmospheric-river|qpf|excessive-rain|drainage|sump|mold|water-safety|coastal-flood|hundred-year/.test(haystack)) return 'flood';
  if (/winter|snow|blizzard|ice|icing|freezing|sleet|frost|whiteout|wind-chill|polar-vortex|lake-effect|nor-easter|cold-wave|snowfall/.test(haystack)) return 'winter';
  if (/heat|drought|wildfire|smoke|air-quality|uv-index|red-flag|burn-ban|stagnation|cooling-center|megadrought|urban-heat/.test(haystack)) return 'heat';
  if (/radar|satellite|forecast|model|spc|nws|noaa|metar|taf|skew|hodograph|weather-map|surface-analysis|upper-air|outlook|mesoanalysis|mesoscale|ensemble|nowcasting|probability|confidence|uncertainty|weather-app|velocity|reflectivity|correlation-coefficient|area-forecast/.test(haystack)) return 'radar';
  if (/marine|beach|rip-current|small-craft|gale|boating|coastal|king-tide|sea-fog|lake-breeze|waterfront|harbor|safeboating/.test(haystack)) return 'marine';
  return 'general';
}

function officialSource(slug, title, kind) {
  const haystack = `${slug} ${title}`.toLowerCase();
  if (haystack.includes('australia')) return ['Bureau of Meteorology warnings', 'https://www.bom.gov.au/australia/warnings/'];
  if (haystack.includes('finland')) return ['Finnish Meteorological Institute warnings', 'https://en.ilmatieteenlaitos.fi/warnings'];
  if (haystack.includes('sweden')) return ['SMHI warnings and advisories', 'https://www.smhi.se/en/weather/warnings-and-forecasts/warnings-and-advisories'];
  if (haystack.includes('latvia')) return ['Latvia weather warnings', 'https://warnings.meteo.lv/'];
  return kindCopy[kind]?.source || kindCopy.general.source;
}

function shouldSkip(filePath, slug) {
  const relative = path.relative(root, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return true;
  if (relative.startsWith('quiz/')) return true;
  if (relative.startsWith('weather-trivia/')) return true;
  return skipSlugs.has(slug);
}

function extractSignals(slug, title, description, category, kind) {
  const haystack = `${slug} ${title} ${description} ${category}`.toLowerCase();
  const found = [];
  for (const [needle, label] of signalRules) {
    if (haystack.includes(needle) && !found.includes(label)) found.push(label);
    if (found.length >= 6) break;
  }
  if (!found.length) found.push(kindCopy[kind]?.focus.split(',')[0] || 'weather risk');
  return found;
}

function removeExistingBrief(html) {
  const start = html.indexOf(`<section class="article-brief-v3" ${marker}`);
  if (start === -1) return html;
  const end = html.indexOf('</section>', start);
  if (end === -1) return html;
  return `${html.slice(0, start)}${html.slice(end + '</section>'.length)}`;
}

function splitAtContentCutoff(html) {
  const candidates = [
    html.indexOf('<section class="article-upgrade"'),
    html.indexOf(`<section class="article-depth-v2"`),
    html.indexOf('<section class="related"'),
    html.indexOf('</article>')
  ].filter((index) => index !== -1);
  const cutoff = Math.min(...candidates);
  return [html.slice(0, cutoff), html.slice(cutoff)];
}

function addHeadingAnchors(prefix) {
  const used = new Set();
  const headings = [];
  let changed = false;

  const nextPrefix = prefix.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const label = stripTags(inner);
    const existing = attrs.match(/\bid=(["'])(.*?)\1/i);
    let id = existing ? existing[2] : slugify(label);
    const base = id;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(id);

    if (!existing) {
      changed = true;
      match = `<h2${attrs} id="${id}">${inner}</h2>`;
    }

    const lower = label.toLowerCase();
    if (
      headings.length < 7 &&
      label &&
      !/related|sources|further reading|frequently asked|decision checklist|reader checklist|how to read this guide/i.test(lower)
    ) {
      headings.push({ id, label });
    }
    return match;
  });

  return { html: nextPrefix, headings, changed };
}

function ensureRobotsMeta(html) {
  if (/max-image-preview:large/i.test(html)) return html;
  const viewport = html.match(/<meta name="viewport"[^>]*>\s*/i);
  if (!viewport) return html.replace(/<head>\s*/i, (match) => `${match}<meta name="robots" content="max-image-preview:large" />\n`);
  return html.replace(viewport[0], `${viewport[0]}<meta name="robots" content="max-image-preview:large" />\n`);
}

function updateDateModified(html) {
  return html.replace(/"dateModified"\s*:\s*"[^"]+"/g, `"dateModified":"${today}"`);
}

function makeBrief({ slug, title, description, category, kind, words, headings }) {
  const copy = kindCopy[kind] || kindCopy.general;
  const [sourceLabel, sourceUrl] = officialSource(slug, title, kind);
  const readingMinutes = Math.max(2, Math.round(words / 225));
  const signals = extractSignals(slug, title, description, category, kind);
  const toc = headings.length
    ? headings.map((heading) => `<li><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.label)}</a></li>`).join('')
    : `<li>${escapeHtml(copy.bestFor)}</li><li>${escapeHtml(copy.watchFor)}</li><li>${escapeHtml(copy.decision)}</li>`;

  return `
<section class="article-brief-v3" ${marker} aria-label="Article overview">
  <style>
    .article-brief-v3{margin:28px 0 34px;padding:0}.article-brief-v3 .brief-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(220px,.9fr);gap:14px}.article-brief-v3 .brief-card{background:var(--surface,#fff);border:1px solid var(--border,#e5e1d8);border-radius:8px;padding:18px 20px;box-shadow:0 4px 16px rgba(20,22,28,.05)}.article-brief-v3 h2{font-family:var(--serif,Georgia,serif);font-size:21px;line-height:1.2;margin:0 0 12px;letter-spacing:0}.article-brief-v3 p{font-size:15.5px;line-height:1.58;margin:0 0 12px;color:var(--text-secondary,#4a5061)}.article-brief-v3 ul,.article-brief-v3 ol{margin:0 0 0 20px}.article-brief-v3 li{font-size:14.5px;line-height:1.55;margin-bottom:7px}.article-brief-v3 strong{color:var(--text,#14161c)}.article-brief-v3 .brief-signals{margin-top:12px;background:var(--bg-alt,#f4f1ea);border:1px solid var(--border,#e5e1d8);border-radius:8px;padding:12px 14px;font-size:14px;color:var(--text-secondary,#4a5061)}.article-brief-v3 .brief-signals span{display:inline-block;margin:3px 6px 3px 0;padding:3px 8px;border-radius:999px;background:var(--surface,#fff);border:1px solid var(--border,#e5e1d8);color:var(--text,#14161c)}@media(max-width:720px){.article-brief-v3 .brief-layout{grid-template-columns:1fr}}
  </style>
  <div class="brief-layout">
    <div class="brief-card">
      <h2 id="article-at-a-glance">At a glance</h2>
      <p>This guide is best for ${escapeHtml(copy.bestFor)}.</p>
      <ul>
        <li><strong>Reading time:</strong> about ${readingMinutes} minutes</li>
        <li><strong>Primary focus:</strong> ${escapeHtml(copy.focus)}</li>
        <li><strong>Watch for:</strong> ${escapeHtml(copy.watchFor)}</li>
        <li><strong>Decision point:</strong> ${escapeHtml(copy.decision)}</li>
        <li><strong>Official check:</strong> <a href="${sourceUrl}" rel="noopener">${escapeHtml(sourceLabel)}</a></li>
      </ul>
    </div>
    <div class="brief-card">
      <h2 id="article-section-guide">In this guide</h2>
      <ol>${toc}</ol>
    </div>
  </div>
  <div class="brief-signals"><strong>Key terms:</strong> ${signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join('')}</div>
</section>`;
}

function insertBrief(html, brief) {
  const headerEnd = html.indexOf('</header>');
  if (headerEnd !== -1) {
    const end = headerEnd + '</header>'.length;
    return `${html.slice(0, end)}${brief}${html.slice(end)}`;
  }
  const articleOpen = html.match(/<article\b[^>]*>/i);
  if (!articleOpen || articleOpen.index === undefined) return html;
  const end = articleOpen.index + articleOpen[0].length;
  return `${html.slice(0, end)}${brief}${html.slice(end)}`;
}

function auditPage(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(path.dirname(filePath));
  const title = cleanTitle(textFromMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, textFromMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i, slug)));
  const description = textFromMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i, '');
  const category = textFromMatch(html, /<div class="eyebrow">([\s\S]*?)<\/div>/i, textFromMatch(html, /<div class="page-eyebrow">([\s\S]*?)<\/div>/i, 'Weather'));
  const article = /<article\b/i.test(html);
  const skipped = shouldSkip(filePath, slug);
  const alreadyBriefed = html.includes(marker);
  const kind = classify(slug, title, category);
  const words = wordCount(html);

  return {
    filePath,
    slug,
    title,
    description,
    category,
    kind,
    words,
    article,
    skipped,
    alreadyBriefed,
    target: article && !skipped && !alreadyBriefed
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const refresh = args.has('--refresh');
  const pages = walk(root).map(auditPage);
  const articlePages = pages.filter((page) => page.article && !page.skipped);
  const targets = articlePages.filter((page) => refresh || page.target);
  const summary = {
    totalIndexPages: pages.length,
    articlePages: articlePages.length,
    alreadyBriefed: articlePages.filter((page) => page.alreadyBriefed).length,
    targets: targets.length,
    missingRobots: articlePages.filter((page) => !fs.readFileSync(page.filePath, 'utf8').includes('max-image-preview:large')).length,
    byKind: countBy(targets, 'kind')
  };

  console.log(JSON.stringify(summary, null, 2));
  if (dryRun) {
    for (const page of targets.slice(0, 40)) {
      console.log(`${page.kind}\t${page.words}\t${path.relative(root, page.filePath)}`);
    }
    if (targets.length > 40) console.log(`...and ${targets.length - 40} more`);
    return;
  }

  let changed = 0;
  for (const page of targets) {
    let html = fs.readFileSync(page.filePath, 'utf8');
    if (refresh) html = removeExistingBrief(html);

    let next = ensureRobotsMeta(updateDateModified(html));
    const [prefix, suffix] = splitAtContentCutoff(next);
    const anchored = addHeadingAnchors(prefix);
    const brief = makeBrief({ ...page, words: wordCount(next), headings: anchored.headings });
    next = insertBrief(`${anchored.html}${suffix}`, brief);

    if (next !== fs.readFileSync(page.filePath, 'utf8')) {
      fs.writeFileSync(page.filePath, next);
      changed += 1;
    }
  }
  console.log(`Added article briefs and heading anchors to ${changed} pages.`);
}

main();

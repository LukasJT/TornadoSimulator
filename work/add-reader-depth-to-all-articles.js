import fs from 'fs';
import path from 'path';

const root = process.cwd();
const marker = 'data-generated="article-depth-v2"';

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

const sources = {
  tornado: [
    ['NOAA/NSSL Severe Weather 101: Tornadoes', 'https://www.nssl.noaa.gov/education/svrwx101/tornadoes/'],
    ['NOAA Storm Prediction Center tornado FAQ', 'https://www.spc.noaa.gov/faq/tornado/'],
    ['National Weather Service tornado safety', 'https://www.weather.gov/safety/tornado']
  ],
  hurricane: [
    ['National Hurricane Center', 'https://www.nhc.noaa.gov/'],
    ['National Hurricane Center storm surge overview', 'https://www.nhc.noaa.gov/surge/'],
    ['National Weather Service hurricane safety', 'https://www.weather.gov/safety/hurricane']
  ],
  flood: [
    ['National Weather Service flood safety', 'https://www.weather.gov/safety/flood'],
    ['NOAA/NSSL Severe Weather 101: Floods', 'https://www.nssl.noaa.gov/education/svrwx101/floods/'],
    ['FEMA flood maps and information', 'https://www.fema.gov/flood-maps']
  ],
  winter: [
    ['National Weather Service winter safety', 'https://www.weather.gov/safety/winter'],
    ['NOAA/NSSL winter weather basics', 'https://www.nssl.noaa.gov/education/svrwx101/winter/'],
    ['Ready.gov winter weather', 'https://www.ready.gov/winter-weather']
  ],
  heat: [
    ['National Weather Service heat safety', 'https://www.weather.gov/safety/heat'],
    ['National Weather Service air quality safety', 'https://www.weather.gov/safety/airquality'],
    ['Ready.gov extreme heat', 'https://www.ready.gov/heat']
  ],
  radar: [
    ['NOAA/NSSL radar basics', 'https://www.nssl.noaa.gov/education/svrwx101/radar/'],
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
  ],
  safety: [
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
    ['Ready.gov severe weather', 'https://www.ready.gov/severe-weather'],
    ['NOAA Weather-Ready Nation', 'https://www.weather.gov/wrn/']
  ],
  history: [
    ['NOAA Storm Events Database', 'https://www.ncei.noaa.gov/products/storm-events'],
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
  ],
  education: [
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
    ['NOAA SciJinks weather resources', 'https://scijinks.gov/weather/'],
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
  ],
  marine: [
    ['National Weather Service marine weather safety', 'https://www.weather.gov/safety/safeboating'],
    ['National Weather Service beach safety', 'https://www.weather.gov/safety/beachhazards'],
    ['National Hurricane Center storm surge overview', 'https://www.nhc.noaa.gov/surge/']
  ],
  international: [
    ['Bureau of Meteorology severe weather knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/severe-weather-knowledge-centre'],
    ['Finnish Meteorological Institute warning information', 'https://en.ilmatieteenlaitos.fi/information-on-warnings'],
    ['SMHI radar and satellite', 'https://www.smhi.se/en/weather/radar-and-satellite'],
    ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/']
  ],
  general: [
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
    ['NOAA Climate.gov', 'https://www.climate.gov/']
  ]
};

const depthCopy = {
  tornado: {
    question: 'What threat would change a shelter decision?',
    meaning: 'Read this tornado article as a bridge between storm structure and action. The useful takeaway is not only what a tornado is, but what evidence would make a person stop watching and move to shelter.',
    compare: 'Compare the article with official warnings, radar-confirmed rotation, debris signatures, local spotter reports, and the building you are actually in. A well-built interior room and a mobile home do not offer the same margin.',
    confidence: 'Tornado science is strongest when it separates observed damage, radar evidence, environmental ingredients, and forecast probability. Those pieces support different levels of confidence.',
    update: 'Change the plan if a warning polygon includes your location, a storm becomes radar-confirmed, debris is reported, nightfall reduces visibility, or your only shelter option requires extra travel time.'
  },
  hurricane: {
    question: 'Which hazard arrives first: wind, water, rain, or evacuation timing?',
    meaning: 'Read this tropical-weather article as a multi-hazard guide. The category or storm label is only one clue; the practical danger may be surge, rainfall, tornadoes, waves, or roads becoming unusable before the peak wind.',
    compare: 'Compare the article with official forecast cones, watches and warnings, rainfall outlooks, surge products, local evacuation zones, and emergency management instructions.',
    confidence: 'Track forecasts usually become clearer with time, but intensity, rainfall placement, tornado risk, and surge details can remain uncertain. The safest plan accounts for that uncertainty early.',
    update: 'Change the plan if watches become warnings, evacuation orders are issued, tropical-storm-force wind timing moves earlier, or rainfall and surge forecasts increase for your location.'
  },
  flood: {
    question: 'Where can water block movement before people expect it?',
    meaning: 'Read this flood article as a timing and access problem. The main question is where water can rise, collect, or move fast enough to cut off roads, basements, underpasses, fields, and low crossings.',
    compare: 'Compare the article with official flood warnings, rainfall rates, river gauges, local road closures, drainage history, and whether the ground was already saturated before the event.',
    confidence: 'Flood confidence depends on rainfall placement, storm duration, soil moisture, terrain, drainage, and river response. Small location errors can matter when intense rain sits over one basin.',
    update: 'Change the plan if rainfall trains over the same area, water reaches roads, a flash flood warning is issued, upstream gauges rise quickly, or travel would require crossing low water.'
  },
  winter: {
    question: 'Is this a snow problem, an ice problem, a wind problem, or a cold problem?',
    meaning: 'Read this winter article by separating precipitation type from impact. Snow depth, ice glaze, wind, visibility, road temperature, and power reliability can each be the main hazard.',
    compare: 'Compare the article with winter storm warnings, ice forecasts, road-condition reports, wind chill products, timing of the heaviest precipitation, and whether temperatures are near freezing.',
    confidence: 'Winter forecast confidence can change quickly near the rain-snow-ice line. A one- or two-degree difference aloft or at the surface can change the entire impact.',
    update: 'Change the plan if freezing rain appears more likely, wind increases, road temperatures fall below freezing, visibility drops, or officials advise against travel.'
  },
  heat: {
    question: 'Who or what loses the ability to cool down?',
    meaning: 'Read this heat, drought, or smoke article as a cumulative-stress guide. The worst risk often builds over hours or days, especially when nights stay warm or air quality remains poor.',
    compare: 'Compare the article with heat alerts, air quality alerts, fire-weather products, drought indicators, indoor temperatures, workload, shade, hydration, medications, and access to cooling.',
    confidence: 'Heat risk is not captured by the high temperature alone. Humidity, direct sun, warm nights, stagnant air, smoke, and personal vulnerability change the outcome.',
    update: 'Change the plan if overnight temperatures stay high, cooling fails, smoke thickens, outdoor work continues longer than expected, or vulnerable people cannot access cooler air.'
  },
  radar: {
    question: 'What does this forecast tool show, and what does it leave out?',
    meaning: 'Read this forecasting article as a guide to evidence. Radar, satellite, outlooks, models, observations, and warning text each answer different questions, so no single graphic should carry the whole decision.',
    compare: 'Compare the article with official forecast discussions, warning text, radar trends, satellite loops, surface observations, model spread, and the timing of the next update.',
    confidence: 'Forecast confidence improves when independent tools point to the same outcome. It drops when models spread apart, radar modes are messy, or the key hazard is smaller than the observing network can resolve.',
    update: 'Change the plan if newer official guidance shifts timing, storms develop faster than expected, observed conditions differ from the forecast, or warnings are issued upstream.'
  },
  safety: {
    question: 'What action should happen before conditions become dangerous?',
    meaning: 'Read this safety article as an action plan rather than a fact sheet. The goal is to identify the trigger, the safest place, the backup alert path, and the first post-storm hazard to avoid.',
    compare: 'Compare the article with your building type, mobility needs, pets, medications, power dependence, school or workplace rules, and official local instructions.',
    confidence: 'Preparedness advice is strongest when it is specific to place and hazard. A safe tornado room, a flood evacuation route, and a generator plan solve different problems.',
    update: 'Change the plan if someone in the household has new medical needs, construction changes the shelter option, roads close, power fails, or officials give a more specific instruction.'
  },
  history: {
    question: 'What lesson survives after the event details change?',
    meaning: 'Read this history article as a case study. The value is not only the date, rating, or death toll, but how meteorology, warning access, exposure, buildings, and decisions combined.',
    compare: 'Compare the article with official storm databases, post-event surveys, reputable archives, inflation-adjusted damage context, population exposure, and changes in warning technology.',
    confidence: 'Historical confidence depends on the era. Modern radar and surveys give more detail than older newspaper accounts, but even recent events can have revised damage or casualty information.',
    update: 'Change the interpretation if official surveys are revised, better archives become available, or newer research changes whether an event was one tornado, a tornado family, or a broader wind event.'
  },
  education: {
    question: 'What can a reader observe, measure, or test safely?',
    meaning: 'Read this education article as a learning pathway. A strong weather lesson connects a concept to observations, simple measurements, official data, and clear safety boundaries.',
    compare: 'Compare the article with classroom observations, local forecasts, radar or satellite loops, official weather data, and what the activity can realistically prove.',
    confidence: 'Educational confidence grows when the activity is repeatable, measured in units, compared with official data, and honest about limits. A classroom model is a demonstration, not the whole atmosphere.',
    update: 'Change the lesson if weather becomes hazardous, tools are not available, measurements are inconsistent, or the activity would encourage students to go outside during dangerous conditions.'
  },
  marine: {
    question: 'What changes once the hazard is on water or near the coast?',
    meaning: 'Read this marine article as an exposure guide. Wind, waves, tides, currents, fog, cold water, and lightning can make a familiar beach, lake, harbor, or ferry route unsafe.',
    compare: 'Compare the article with marine forecasts, beach hazard statements, tide and water-level information, lifeguard guidance, harbor notices, and the weakest person in the group.',
    confidence: 'Marine confidence depends on timing, fetch, wind direction, water temperature, visibility, and how quickly people can reach shelter or shore. A calm-looking sky does not guarantee safe water.',
    update: 'Change the plan if waves build, wind shifts onshore, thunder is heard, fog thickens, water levels rise, or officials restrict boating, swimming, beach access, or ferry operations.'
  },
  international: {
    question: 'Which official warning system applies in this country?',
    meaning: 'Read this international article as a translation layer between local warning language and weather science. The country, season, coastline, road network, and official agency matter as much as the hazard name.',
    compare: 'Compare the article with the national meteorological service, regional portals such as Meteoalarm where relevant, local emergency authorities, road or marine agencies, and the source links already listed on the page.',
    confidence: 'International guidance is strongest when it cites the country agency directly and avoids importing U.S.-only warning habits into places with different alert systems.',
    update: 'Change the plan if the national warning color increases, local authorities issue instructions, transport routes are affected, coastal water or river levels rise, or the warning text names your exact area.'
  },
  general: {
    question: 'What decision does this weather concept change?',
    meaning: 'Read this article as a concept-to-action guide. Weather terms matter most when they help a person understand timing, exposure, confidence, and what to do next.',
    compare: 'Compare the article with official forecasts, observations, local terrain, time of day, and whether the hazard affects travel, buildings, health, water, power, or outdoor plans.',
    confidence: 'General weather confidence improves when a concept is tied to evidence: observations, physical ingredients, official warnings, and consistent trends across multiple tools.',
    update: 'Change the plan if the hazard overlaps with another one, timing shifts into a vulnerable period, official guidance changes, or local conditions are worse than the broad forecast suggests.'
  }
};

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

function shouldSkip(filePath, slug) {
  const relative = path.relative(root, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return true;
  if (relative.startsWith('quiz/')) return true;
  if (relative.startsWith('weather-trivia/')) return true;
  return skipSlugs.has(slug);
}

function sourceList(kind) {
  const chosen = sources[kind] || sources.general;
  return chosen.map(([label, url]) => `<li><a href="${url}" rel="noopener">${escapeHtml(label)}</a></li>`).join('');
}

function makeDepthSection({ title, kind }) {
  const copy = depthCopy[kind] || depthCopy.general;
  const safeTitle = escapeHtml(title);
  return `
<section class="article-depth-v2" ${marker}>
  <style>
    .article-depth-v2{margin:42px 0 0;padding:28px 0 4px;border-top:1px solid var(--border,#e5e1d8)}.article-depth-v2 h2{margin-top:28px}.article-depth-v2 .depth-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:18px 0 24px}.article-depth-v2 .depth-card{background:var(--surface,#fff);border:1px solid var(--border,#e5e1d8);border-radius:8px;padding:16px}.article-depth-v2 .depth-card strong{display:block;margin-bottom:6px;color:var(--accent,#a02818);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.article-depth-v2 .depth-card p{font-size:15px;line-height:1.55;margin:0;color:var(--text-secondary,#4a5061)}.article-depth-v2 .depth-checklist{margin:12px 0 20px 22px}.article-depth-v2 .depth-checklist li{margin-bottom:8px}.article-depth-v2 .depth-source-box{background:var(--surface,#fff);border-left:4px solid var(--accent,#a02818);padding:18px 20px;margin:24px 0}.article-depth-v2 .depth-source-box ul{margin:10px 0 0 20px}.article-depth-v2 .depth-note{font-size:15px;color:var(--text-secondary,#4a5061)}
  </style>
  <h2>How to read this guide</h2>
  <p><strong>${safeTitle}</strong> is most useful when it is read as a decision guide, not just a definition. The goal is to connect the weather setup, the warning language, and the practical action a reader may need before conditions become dangerous.</p>
  <div class="depth-grid">
    <div class="depth-card"><strong>Main question</strong><p>${escapeHtml(copy.question)}</p></div>
    <div class="depth-card"><strong>Reader takeaway</strong><p>${escapeHtml(copy.meaning)}</p></div>
  </div>
  <h2>What to compare with official guidance</h2>
  <p>${escapeHtml(copy.compare)}</p>
  <p>${escapeHtml(copy.confidence)}</p>
  <h2>Decision checklist</h2>
  <ul class="depth-checklist">
    <li>Identify the main hazard first: wind, water, lightning, heat, cold, visibility, air quality, or travel disruption.</li>
    <li>Check whether the article is explaining a forecast ingredient, an observed hazard, a safety action, or a historical lesson.</li>
    <li>Compare the page with the latest official warning, local emergency instruction, or agency update before acting.</li>
    <li>Decide what would change your plan: sheltering sooner, delaying travel, avoiding water, preparing for outage, or checking on someone vulnerable.</li>
    <li>Keep a backup alert path in case power, cell service, internet, sirens, or social media updates fail.</li>
  </ul>
  <p>${escapeHtml(copy.update)}</p>
  <div class="depth-source-box">
    <strong>Additional sources and further reading:</strong>
    <ul>${sourceList(kind)}</ul>
    <p class="depth-note">This added section is part of Tornado Hub's broader article-quality pass. It is educational context, not a live warning. During active weather, use official alerts and local instructions first.</p>
  </div>
</section>`;
}

function insertSection(html, section) {
  const relatedIndex = html.indexOf('<section class="related">');
  if (relatedIndex !== -1) return `${html.slice(0, relatedIndex)}${section}${html.slice(relatedIndex)}`;
  const articleCloseIndex = html.indexOf('</article>');
  if (articleCloseIndex !== -1) return `${html.slice(0, articleCloseIndex)}${section}${html.slice(articleCloseIndex)}`;
  return html;
}

function removeExistingSection(html) {
  const start = html.indexOf(`<section class="article-depth-v2" ${marker}>`);
  if (start === -1) return html;
  const relatedIndex = html.indexOf('<section class="related">', start);
  const articleCloseIndex = html.indexOf('</article>', start);
  const end = relatedIndex !== -1 ? relatedIndex : articleCloseIndex;
  if (end === -1) return html;
  return `${html.slice(0, start)}${html.slice(end)}`;
}

function auditPage(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(path.dirname(filePath));
  const title = cleanTitle(textFromMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, textFromMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i, slug)));
  const category = textFromMatch(html, /<div class="eyebrow">([\s\S]*?)<\/div>/i, textFromMatch(html, /<div class="page-eyebrow">([\s\S]*?)<\/div>/i, 'Weather'));
  const article = /<article\b/i.test(html);
  const alreadyEnhanced = html.includes(marker);
  const skipped = shouldSkip(filePath, slug);
  const kind = classify(slug, title, category);
  const words = wordCount(html);

  return {
    filePath,
    slug,
    title,
    category,
    kind,
    words,
    article,
    alreadyEnhanced,
    skipped,
    target: article && !skipped && !alreadyEnhanced
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
    alreadyEnhanced: articlePages.filter((page) => page.alreadyEnhanced).length,
    targets: targets.length,
    under1000Before: articlePages.filter((page) => page.words < 1000).length,
    under1200Before: articlePages.filter((page) => page.words < 1200).length,
    byKind: countBy(targets, 'kind')
  };

  console.log(JSON.stringify(summary, null, 2));
  if (dryRun) {
    for (const page of targets.slice(0, 40)) {
      console.log(`${page.words}\t${page.kind}\t${path.relative(root, page.filePath)}`);
    }
    if (targets.length > 40) console.log(`...and ${targets.length - 40} more`);
    return;
  }

  let changed = 0;
  for (const page of targets) {
    const html = fs.readFileSync(page.filePath, 'utf8');
    const withoutExisting = refresh ? removeExistingSection(html) : html;
    if (!/<article\b/i.test(withoutExisting)) continue;
    const next = insertSection(withoutExisting, makeDepthSection(page));
    if (next !== html) {
      fs.writeFileSync(page.filePath, next);
      changed += 1;
    }
  }
  console.log(`Enhanced ${changed} article pages with article-depth-v2.`);
}

main();

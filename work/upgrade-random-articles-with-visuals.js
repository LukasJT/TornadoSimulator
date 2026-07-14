import fs from 'fs';
import path from 'path';

const root = process.cwd();
const marker = 'data-generated="random-depth-v4"';
const defaultCount = 40;
const seedText = 'tornado-hub-random-depth-2026-07-14-v4';
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

const kindData = {
  tornado: {
    label: 'Tornado Analysis',
    accent: '#a02818',
    fields: ['Ingredients', 'Detection', 'Warning', 'Shelter'],
    sourceLinks: [
      ['NOAA/NSSL Severe Weather 101: Tornadoes', 'https://www.nssl.noaa.gov/education/svrwx101/tornadoes/'],
      ['NOAA Storm Prediction Center tornado FAQ', 'https://www.spc.noaa.gov/faq/tornado/'],
      ['National Weather Service tornado safety', 'https://www.weather.gov/safety/tornado'],
      ['NOAA Storm Events Database', 'https://www.ncei.noaa.gov/products/storm-events']
    ],
    extra: {
      why: 'A tornado article is strongest when it keeps four layers separate: the environment that supports rotation, the radar or spotter evidence that raises confidence, the warning language that communicates urgency, and the shelter decision a person has to make quickly.',
      picture: 'The diagram below treats the storm as a chain of decisions. Ingredients create the possibility, detection raises confidence, warnings narrow the action area, and shelter quality controls the human outcome.',
      reader: 'When reading this page, ask what kind of statement is being made. A climatology statement tells you what is common, a warning statement tells you what is urgent, and a damage-rating statement describes what investigators found after the event.',
      source: 'The source trail matters because tornado science mixes real-time warning operations with after-the-fact surveys. NOAA/NSSL and SPC explain the atmospheric side, while NWS safety guidance explains the action side.'
    }
  },
  hurricane: {
    label: 'Tropical Cyclone Analysis',
    accent: '#1e3a5f',
    fields: ['Track', 'Wind', 'Water', 'Timing'],
    sourceLinks: [
      ['National Hurricane Center', 'https://www.nhc.noaa.gov/'],
      ['National Hurricane Center storm surge overview', 'https://www.nhc.noaa.gov/surge/'],
      ['National Weather Service hurricane safety', 'https://www.weather.gov/safety/hurricane'],
      ['Ready.gov hurricanes', 'https://www.ready.gov/hurricanes']
    ],
    extra: {
      why: 'A tropical cyclone article should not stop at the category number. Track, size, rainfall, surge, waves, tornadoes, evacuation timing, and power loss can all become the real story for a reader.',
      picture: 'The visual separates the storm center from its impacts. A useful hurricane, typhoon, or cyclone guide follows the hazards outward from the eye into wind fields, surge zones, rain bands, and inland routes.',
      reader: 'Read the forecast cone as a track-uncertainty product, not as the full hazard footprint. Wind and water can extend well outside the center line, especially when the storm is large or slow.',
      source: 'The source trail should lead readers back to the National Hurricane Center, local warning offices, and emergency managers because tropical decisions are time-sensitive and location-specific.'
    }
  },
  flood: {
    label: 'Flood Risk Analysis',
    accent: '#2d6a4f',
    fields: ['Rain Rate', 'Drainage', 'Rivers', 'Roads'],
    sourceLinks: [
      ['National Weather Service flood safety', 'https://www.weather.gov/safety/flood'],
      ['NOAA/NSSL Severe Weather 101: Floods', 'https://www.nssl.noaa.gov/education/svrwx101/floods/'],
      ['USGS Water Data', 'https://waterdata.usgs.gov/'],
      ['FEMA flood maps', 'https://www.fema.gov/flood-maps']
    ],
    extra: {
      why: 'Flood articles work best when they describe water as a moving, delayed, and local hazard. The heaviest rain is only one piece; drainage, soil, terrain, rivers, and roads decide where the danger appears.',
      picture: 'The image follows water from rain rate to drainage, river response, and travel impact. That sequence helps readers understand why a flood problem may continue after the thunderstorm has moved away.',
      reader: 'The key question is whether water changes access. A flooded underpass, creek crossing, basement, or low road can become the most important part of the forecast even when broader maps look ordinary.',
      source: 'Use NWS flood guidance for safety language, USGS gauges for observed water levels, and FEMA resources for longer-term floodplain and property context.'
    }
  },
  winter: {
    label: 'Winter Weather Analysis',
    accent: '#496d89',
    fields: ['Precip Type', 'Road Temp', 'Wind', 'Power'],
    sourceLinks: [
      ['National Weather Service winter safety', 'https://www.weather.gov/safety/winter'],
      ['Ready.gov winter weather', 'https://www.ready.gov/winter-weather'],
      ['NOAA/NSSL winter weather basics', 'https://www.nssl.noaa.gov/education/svrwx101/winter/'],
      ['National Weather Service road weather safety', 'https://www.weather.gov/safety/winter-during']
    ],
    extra: {
      why: 'Winter articles need to separate snow depth from impact. A small amount of freezing rain can be more disruptive than several inches of dry snow, and wind can turn a manageable snowfall into a visibility and power problem.',
      picture: 'The diagram breaks winter risk into precipitation type, road temperature, wind, and power reliability. Each layer can dominate the outcome in a different storm.',
      reader: 'Pay special attention to the rain-snow-ice line. When temperatures are near freezing, a small forecast shift can change travel conditions, tree load, and outage risk.',
      source: 'Official winter guidance is important because road agencies, emergency managers, and weather offices may update impact language faster than a static article can.'
    }
  },
  heat: {
    label: 'Heat And Fire Weather Analysis',
    accent: '#b8620f',
    fields: ['Humidity', 'Night Heat', 'Smoke', 'Fire Risk'],
    sourceLinks: [
      ['National Weather Service heat safety', 'https://www.weather.gov/safety/heat'],
      ['Ready.gov extreme heat', 'https://www.ready.gov/heat'],
      ['National Weather Service air quality safety', 'https://www.weather.gov/safety/airquality'],
      ['National Weather Service fire weather', 'https://www.weather.gov/fire/']
    ],
    extra: {
      why: 'Heat, smoke, drought, and fire-weather articles are really about accumulated stress. The danger builds when warm nights, humidity, poor air quality, dry fuels, or limited cooling options overlap.',
      picture: 'The visual groups the human and environmental stressors: humidity, warm nights, smoke, and fire risk. A reader can use those layers to decide whether a day is merely uncomfortable or genuinely dangerous.',
      reader: 'The daily high temperature is not enough. Look for heat index, overnight low temperatures, air quality, wind, dry fuels, and whether vulnerable people have reliable cooling.',
      source: 'NWS and Ready.gov sources are useful because they connect weather thresholds to health actions, workplace planning, outdoor schedules, and cooling decisions.'
    }
  },
  radar: {
    label: 'Forecast Tool Analysis',
    accent: '#5b5f6f',
    fields: ['Observation', 'Model', 'Radar', 'Update'],
    sourceLinks: [
      ['NOAA/NSSL radar basics', 'https://www.nssl.noaa.gov/education/svrwx101/radar/'],
      ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
      ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
      ['NOAA Weather-Ready Nation', 'https://www.weather.gov/wrn/']
    ],
    extra: {
      why: 'Forecast and radar articles should explain what each tool can prove. Radar shows precipitation and motion near the beam, models show possible future states, and official text explains confidence and action.',
      picture: 'The diagram shows the evidence stack: observations, model guidance, radar signatures, and update timing. Good decisions usually compare all four rather than trusting one screen.',
      reader: 'Always check timestamps. A radar image, model run, outlook, or warning can be useful and still be too old to answer the decision in front of you.',
      source: 'NOAA and NWS sources are the right anchor because forecast tools are easy to over-interpret without the operational context that explains uncertainty.'
    }
  },
  safety: {
    label: 'Preparedness Analysis',
    accent: '#7d1f13',
    fields: ['Trigger', 'Place', 'Backup', 'Aftermath'],
    sourceLinks: [
      ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
      ['Ready.gov severe weather', 'https://www.ready.gov/severe-weather'],
      ['NOAA Weather-Ready Nation', 'https://www.weather.gov/wrn/'],
      ['FEMA preparedness resources', 'https://www.ready.gov/plan']
    ],
    extra: {
      why: 'Safety articles are most useful when they name the action trigger. People need to know when to shelter, when to leave, when to stop driving, when to avoid water, and what to check after the weather passes.',
      picture: 'The visual turns the article into a plan: trigger, safe place, backup alert path, and aftermath. That keeps the page practical instead of becoming just another list of weather facts.',
      reader: 'The safest plan is boring on purpose. It should be simple enough to use when power is out, phones are noisy, roads are changing, or people are under stress.',
      source: 'NWS, Ready.gov, and Weather-Ready Nation sources help keep preparedness advice aligned with official public-safety language.'
    }
  },
  history: {
    label: 'Storm History Analysis',
    accent: '#8a5a22',
    fields: ['Weather', 'Exposure', 'Warnings', 'Lessons'],
    sourceLinks: [
      ['NOAA Storm Events Database', 'https://www.ncei.noaa.gov/products/storm-events'],
      ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
      ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
      ['NOAA Billion-Dollar Disasters', 'https://www.ncei.noaa.gov/access/billions/']
    ],
    extra: {
      why: 'Historical weather articles should do more than retell damage. The best case studies separate the meteorology, the exposure, the warning system, the built environment, and the lessons that still apply.',
      picture: 'The graphic treats a past storm as a layered case study. Weather created the hazard, exposure put people and property in the path, warnings shaped decisions, and lessons changed future planning.',
      reader: 'Do not compare events by one number alone. A death toll, damage total, path length, rating, or pressure record can each tell a different part of the story.',
      source: 'NOAA event databases and NWS summaries are especially important for history pages because older records can be revised as surveys, archives, and research improve.'
    }
  },
  education: {
    label: 'Weather Learning Analysis',
    accent: '#4a6f45',
    fields: ['Observe', 'Measure', 'Compare', 'Explain'],
    sourceLinks: [
      ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
      ['NOAA SciJinks weather resources', 'https://scijinks.gov/weather/'],
      ['UCAR Center for Science Education', 'https://scied.ucar.edu/'],
      ['National Weather Service safety portal', 'https://www.weather.gov/safety/']
    ],
    extra: {
      why: 'Education articles get better when they give readers something safe to observe, measure, compare, and explain. That turns weather vocabulary into a learning path.',
      picture: 'The diagram follows a classroom-friendly loop: observe the sky or data, measure a variable, compare with official information, and explain what changed.',
      reader: 'A good weather activity is honest about limits. A jar, map, chart, or model can demonstrate one idea, but it cannot recreate the whole atmosphere.',
      source: 'NOAA, SciJinks, and science-education sources help keep classroom explanations simple without drifting away from real meteorology.'
    }
  },
  marine: {
    label: 'Coastal And Marine Analysis',
    accent: '#0f5b6f',
    fields: ['Wind', 'Waves', 'Water Level', 'Visibility'],
    sourceLinks: [
      ['National Weather Service marine weather safety', 'https://www.weather.gov/safety/safeboating'],
      ['National Weather Service beach safety', 'https://www.weather.gov/safety/beachhazards'],
      ['NOAA Tides and Currents', 'https://tidesandcurrents.noaa.gov/'],
      ['National Hurricane Center storm surge overview', 'https://www.nhc.noaa.gov/surge/']
    ],
    extra: {
      why: 'Marine and coastal articles need to treat water as its own hazard. Wind, waves, currents, water level, cold water, fog, and lightning can make a familiar beach or lake unsafe quickly.',
      picture: 'The visual separates wind, waves, water level, and visibility. Those four layers explain why a nice-looking coastline can still be dangerous.',
      reader: 'The most important question is how fast people can get out of the hazard. Water, shorelines, boats, and beaches leave less margin than many land-based plans.',
      source: 'NWS marine guidance, beach hazard pages, NOAA tide data, and NHC surge material connect local conditions with larger water-level hazards.'
    }
  },
  international: {
    label: 'International Weather Analysis',
    accent: '#6a4c93',
    fields: ['Local Agency', 'Warning Color', 'Transport', 'Terrain'],
    sourceLinks: [
      ['Bureau of Meteorology warnings', 'https://www.bom.gov.au/australia/warnings/'],
      ['Finnish Meteorological Institute warnings', 'https://en.ilmatieteenlaitos.fi/warnings'],
      ['SMHI warnings and advisories', 'https://www.smhi.se/en/weather/warnings-and-forecasts/warnings-and-advisories'],
      ['Meteoalarm live warnings', 'https://meteoalarm.org/'],
      ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/']
    ],
    extra: {
      why: 'International weather articles should not import U.S. warning habits into countries with different agencies, colors, products, languages, and transportation systems.',
      picture: 'The diagram starts with the national meteorological agency, then adds warning color, transport exposure, and terrain or coastline. That order keeps local authority first.',
      reader: 'For country guides, the most useful question is which official source controls the live decision. Regional context is helpful, but national warning text and local authorities come first.',
      source: 'Country-specific agencies and regional portals are the source trail that keeps these pages useful for Australia, Finland, Sweden, Latvia, and other international readers.'
    }
  },
  general: {
    label: 'Weather Context Analysis',
    accent: '#1e3a5f',
    fields: ['Setup', 'Signal', 'Impact', 'Action'],
    sourceLinks: [
      ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
      ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
      ['NOAA Climate.gov', 'https://www.climate.gov/'],
      ['NOAA Weather-Ready Nation', 'https://www.weather.gov/wrn/']
    ],
    extra: {
      why: 'General weather articles become more useful when they connect a concept to a decision. The reader should know what the setup is, what signal to watch, what impact matters, and what action changes.',
      picture: 'The image below turns the topic into a simple chain: setup, signal, impact, action. That pattern works for weather maps, clouds, pressure, fronts, observations, and many everyday forecasts.',
      reader: 'A weather term is only valuable if it changes understanding. Ask whether the page helps with timing, location, confidence, exposure, safety, or long-term context.',
      source: 'NOAA, NWS, Climate.gov, and Weather-Ready Nation links are useful anchors because they connect public weather education to official warning and preparedness language.'
    }
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
  const slugText = slug.toLowerCase();
  const internationalPattern = /\baustralia\b|\bfinland\b|\bsweden\b|\blatvia\b|\binternational\b|mete[o]?alarm|\bbom\b|\bfmi\b|\bsmhi\b|gulf-of-riga|baltic|european-severe-weather|eswd/;
  const radarPattern = /dual-pol|radar|satellite|forecast|forecasting|model|spc|nws|noaa|metar|taf|skew|hodograph|weather-map|surface-analysis|upper-air|outlook|mesoanalysis|mesoscale|ensemble|nowcasting|probability|confidence|uncertainty|weather-app|velocity|reflectivity|correlation-coefficient|area-forecast/;
  const historyPattern = /history|timeline|record|records|disaster|deadliest|costliest|outbreak|legacy|lessons|1974|2011|1936|1953|1925|1899|1999|2013|2020|2021|2022|2023|2024|xenia|joplin|moore|jarrell|tri-state|waco|tupelo|gainesville|greensburg|mayfield|plainfield|woodward|flint|fargo|barrie|edmonton|regina|vicksburg|natchez|topeka|wichita-falls|dust-bowl/;
  const educationPattern = /school|student|classroom|project|experiment|lesson|career|meteorologist|hydrologist|science-fair|vocabulary|kids|teacher|worksheet|activity|presentation/;
  const floodPattern = /flood|rainfall|rainstorm|river|atmospheric-river|qpf|excessive-rain|drainage|sump|mold|water-safety|coastal-flood|hundred-year/;
  const marinePattern = /marine|beach|rip-current|small-craft|gale|boating|coastal|king-tide|sea-fog|lake-breeze|waterfront|harbor|safeboating/;
  const winterPattern = /winter|snow|blizzard|ice|icing|freezing|sleet|frost|whiteout|wind-chill|polar-vortex|lake-effect|nor-easter|cold-wave|snowfall|bomb-cyclone|noreaster|extra-tropical-cyclone|extratropical-cyclone/;
  const hurricanePattern = /hurricane|typhoon|tropical-storm|tropical-cyclone|tropical-depression|severe-tropical-cyclone|storm-surge|surge|evacuation-zone|andrew|katrina|harvey|sandy|galveston/;
  const safetyPattern = /safety|preparedness|emergency|emergency-kit|kit|drill|shelter|go-bag|outage|generator|carbon-monoxide|downed-power|first-aid|action-plan|cleanup|recovery-guide|storm-prep|weather-prep|continuity|checklist|safe-room|family-communication|emergency-communication/;
  const tornadoPattern = /tornado|twister|supercell|funnel|wall-cloud|mesocyclone|hook-echo|dryline|ef-scale|fujita|wedge|rope|waterspout|landspout|qlcs|debris-signature|tornado-alley|dixie-alley|siren/;
  const heatPattern = /heat|drought|wildfire|smoke|air-quality|uv-index|red-flag|burn-ban|stagnation|cooling-center|megadrought|urban-heat|fire-tornado|pyrocumulonimbus/;

  if (internationalPattern.test(haystack)) return 'international';
  if (radarPattern.test(slugText)) return 'radar';
  if (floodPattern.test(slugText)) return 'flood';
  if (marinePattern.test(slugText)) return 'marine';
  if (historyPattern.test(slugText)) return 'history';
  if (educationPattern.test(slugText)) return 'education';
  if (winterPattern.test(slugText)) return 'winter';
  if (hurricanePattern.test(slugText)) return 'hurricane';
  if (safetyPattern.test(slugText)) return 'safety';
  if (tornadoPattern.test(slugText)) return 'tornado';
  if (heatPattern.test(slugText)) return 'heat';

  if (educationPattern.test(haystack)) return 'education';
  if (historyPattern.test(haystack)) return 'history';
  if (winterPattern.test(haystack)) return 'winter';
  if (hurricanePattern.test(haystack)) return 'hurricane';
  if (safetyPattern.test(haystack)) return 'safety';
  if (tornadoPattern.test(haystack)) return 'tornado';
  if (floodPattern.test(haystack)) return 'flood';
  if (heatPattern.test(haystack)) return 'heat';
  if (radarPattern.test(haystack)) return 'radar';
  if (marinePattern.test(haystack)) return 'marine';
  return 'general';
}

function shouldSkip(filePath, slug) {
  const relative = path.relative(root, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return true;
  if (relative.startsWith('quiz/')) return true;
  if (relative.startsWith('weather-trivia/')) return true;
  return skipSlugs.has(slug);
}

function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomScore(seed, slug) {
  const hash = hashSeed(`${seed}:${slug}`);
  return hash / 0xffffffff;
}

function removeExisting(html) {
  const start = html.indexOf(`<section class="random-depth-v4" ${marker}`);
  if (start === -1) return html;
  const end = html.indexOf('</section>', start);
  if (end === -1) return html;
  return `${html.slice(0, start).replace(/[ \t]*\r?\n[ \t]*$/, '\n')}${html.slice(end + '</section>'.length).replace(/^[ \t]*\r?\n[ \t]*/, '')}`;
}

function updateDateModified(html) {
  return html.replace(/"dateModified"\s*:\s*"[^"]+"/g, `"dateModified":"${today}"`);
}

function sourceList(kind) {
  const links = (kindData[kind] || kindData.general).sourceLinks;
  return links.map(([label, url]) => `<li><a href="${url}" rel="noopener">${escapeHtml(label)}</a></li>`).join('');
}

function diagramSvg({ title, slug, kind }) {
  const data = kindData[kind] || kindData.general;
  const safeTitle = escapeHtml(title);
  const safeLabel = escapeHtml(data.label);
  const fieldText = data.fields.map((field) => escapeHtml(field));
  return `<svg viewBox="0 0 760 380" role="img" aria-labelledby="random-fig-title-${slug} random-fig-desc-${slug}" xmlns="http://www.w3.org/2000/svg">
      <title id="random-fig-title-${slug}">${safeTitle} visual source guide</title>
      <desc id="random-fig-desc-${slug}">A custom Tornado Hub diagram showing the evidence layers readers should compare for this weather topic.</desc>
      <rect width="760" height="380" rx="12" fill="#f4f1ea"/>
      <rect x="34" y="34" width="692" height="312" rx="10" fill="#ffffff" stroke="#e5e1d8"/>
      <text x="62" y="76" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${data.accent}" letter-spacing="0">${safeLabel}</text>
      <text x="62" y="111" font-family="Georgia,serif" font-size="25" font-weight="700" fill="#14161c">${safeTitle.length > 56 ? `${safeTitle.slice(0, 56)}...` : safeTitle}</text>
      <path d="M80 250 C160 150 250 150 330 218 C410 286 500 120 610 156 C670 176 700 230 710 280" fill="none" stroke="#d4cfc3" stroke-width="18" stroke-linecap="round"/>
      <path d="M80 250 C160 150 250 150 330 218 C410 286 500 120 610 156 C670 176 700 230 710 280" fill="none" stroke="${data.accent}" stroke-width="4" stroke-dasharray="10 12" stroke-linecap="round"/>
      <g>
        <circle cx="140" cy="230" r="44" fill="${data.accent}" opacity=".92"/>
        <text x="140" y="235" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">${fieldText[0]}</text>
      </g>
      <g>
        <circle cx="310" cy="176" r="44" fill="#1e3a5f" opacity=".92"/>
        <text x="310" y="181" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">${fieldText[1]}</text>
      </g>
      <g>
        <circle cx="480" cy="226" r="44" fill="#2d6a4f" opacity=".92"/>
        <text x="480" y="231" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">${fieldText[2]}</text>
      </g>
      <g>
        <circle cx="650" cy="178" r="44" fill="#b8620f" opacity=".92"/>
        <text x="650" y="183" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">${fieldText[3]}</text>
      </g>
      <text x="62" y="320" font-family="Inter,Arial,sans-serif" font-size="14" fill="#4a5061">Use this as an evidence map: compare the concept, official source, local exposure, and action trigger.</text>
    </svg>`;
}

function upgradeSection(page) {
  const data = kindData[page.kind] || kindData.general;
  const safeTitle = escapeHtml(page.title);
  return `
<section class="random-depth-v4" ${marker}>
  <style>
    .random-depth-v4{margin:46px 0 0;padding:30px 0 0;border-top:1px solid var(--border,#e5e1d8)}.random-depth-v4 .random-visual{margin:20px 0 24px;background:var(--surface,#fff);border:1px solid var(--border,#e5e1d8);border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(20,22,28,.08)}.random-depth-v4 .random-visual svg{display:block;width:100%;height:auto}.random-depth-v4 .random-visual figcaption{border-top:1px solid var(--border,#e5e1d8);padding:12px 16px;font-size:14px;line-height:1.5;color:var(--text-secondary,#4a5061)}.random-depth-v4 .random-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:20px 0 24px}.random-depth-v4 .random-card{background:var(--surface,#fff);border:1px solid var(--border,#e5e1d8);border-radius:8px;padding:17px 18px}.random-depth-v4 .random-card strong{display:block;margin-bottom:6px;color:${data.accent};font-size:12px;text-transform:uppercase;letter-spacing:0}.random-depth-v4 .random-card p{font-size:15.5px;line-height:1.58;margin:0;color:var(--text-secondary,#4a5061)}.random-depth-v4 .random-sources{background:var(--surface,#fff);border-left:4px solid ${data.accent};padding:18px 20px;margin:24px 0}.random-depth-v4 .random-sources ul{margin:10px 0 0 20px}.random-depth-v4 .random-note{font-size:15px;color:var(--text-secondary,#4a5061)}
  </style>
  <h2 id="field-notes-and-source-map">Field notes and source map</h2>
  <p><strong>${safeTitle}</strong> benefits from one more layer of context: what evidence a reader should compare, what the official sources actually cover, and what practical decision the article should support. This added section is intentionally written like a newsroom sidebar: quick to scan, but deep enough to make the page more useful than a short definition.</p>
  <figure class="random-visual">
    ${diagramSvg(page)}
    <figcaption>${escapeHtml(data.extra.picture)} This custom Tornado Hub visual is original to this article and is meant for education, not live warning use.</figcaption>
  </figure>
  <div class="random-grid">
    <div class="random-card"><strong>Why it matters</strong><p>${escapeHtml(data.extra.why)}</p></div>
    <div class="random-card"><strong>How to read it</strong><p>${escapeHtml(data.extra.reader)}</p></div>
  </div>
  <h2 id="what-to-check-next">What to check next</h2>
  <p>After reading this page, compare the article with the latest official information, the local terrain or building exposure, and the time window in which the hazard matters. A weather concept becomes useful when it changes one of those things: where you go, when you travel, how you shelter, what you monitor, or whether you wait for a safer window.</p>
  <p>For readers coming from search, the key is to avoid treating one term as the whole answer. A headline may name the storm type, but the useful details are usually smaller: the warning wording, the observation trend, the affected road or coast, the people who need extra time, and the source that will update first.</p>
  <h2 id="source-trail">Source trail</h2>
  <p>${escapeHtml(data.extra.source)}</p>
  <div class="random-sources">
    <strong>Primary sources to compare:</strong>
    <ul>${sourceList(page.kind)}</ul>
    <p class="random-note">These links are provided so readers can move from Tornado Hub's plain-English explanation to official meteorological, warning, safety, or archive sources.</p>
  </div>
</section>`;
}

function insertSection(html, section) {
  const relatedIndex = html.indexOf('<section class="related"');
  if (relatedIndex !== -1) return `${html.slice(0, relatedIndex).replace(/[ \t]*\r?\n[ \t]*$/, '\n')}${section}${html.slice(relatedIndex)}`;
  const articleCloseIndex = html.indexOf('</article>');
  if (articleCloseIndex !== -1) return `${html.slice(0, articleCloseIndex).replace(/[ \t]*\r?\n[ \t]*$/, '\n')}${section}${html.slice(articleCloseIndex)}`;
  return html;
}

function auditPage(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(path.dirname(filePath));
  const title = cleanTitle(textFromMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, textFromMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i, slug)));
  const category = textFromMatch(html, /<div class="eyebrow">([\s\S]*?)<\/div>/i, textFromMatch(html, /<div class="page-eyebrow">([\s\S]*?)<\/div>/i, 'Weather'));
  const article = /<article\b/i.test(html);
  const skipped = shouldSkip(filePath, slug);
  const alreadyUpgraded = html.includes(marker);
  const kind = classify(slug, title, category);
  const score = randomScore(seedText, slug);

  return {
    filePath,
    slug,
    title,
    category,
    kind,
    score,
    article,
    skipped,
    alreadyUpgraded,
    targetable: article && !skipped && !alreadyUpgraded
  };
}

function chooseTargets(pages, count) {
  const targetable = pages.filter((page) => page.targetable).sort((a, b) => a.score - b.score);
  const quotas = [
    ['tornado', 6],
    ['history', 5],
    ['safety', 5],
    ['hurricane', 4],
    ['radar', 4],
    ['education', 4],
    ['international', 4],
    ['general', 3],
    ['flood', 2],
    ['winter', 1],
    ['heat', 1],
    ['marine', 1]
  ];
  const chosen = [];
  const chosenPaths = new Set();
  for (const [kind, quota] of quotas) {
    for (const page of targetable.filter((item) => item.kind === kind).slice(0, quota)) {
      if (chosen.length >= count) break;
      chosen.push(page);
      chosenPaths.add(page.filePath);
    }
  }
  for (const page of targetable) {
    if (chosen.length >= count) break;
    if (!chosenPaths.has(page.filePath)) {
      chosen.push(page);
      chosenPaths.add(page.filePath);
    }
  }
  return chosen.sort((a, b) => a.score - b.score);
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
  const countArg = process.argv.find((arg) => arg.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : defaultCount;

  const pages = walk(root).map(auditPage);
  const articlePages = pages.filter((page) => page.article && !page.skipped);
  const already = articlePages.filter((page) => page.alreadyUpgraded).length;
  const targets = refresh
    ? chooseTargets(articlePages.map((page) => ({ ...page, alreadyUpgraded: false, targetable: true })), count)
    : chooseTargets(pages, count);
  const summary = {
    totalIndexPages: pages.length,
    articlePages: articlePages.length,
    alreadyUpgraded: already,
    targetCount: targets.length,
    byKind: countBy(targets, 'kind')
  };

  console.log(JSON.stringify(summary, null, 2));
  if (dryRun) {
    for (const page of targets) {
      console.log(`${page.kind}\t${page.score.toFixed(6)}\t${path.relative(root, page.filePath)}`);
    }
    return;
  }

  let changed = 0;
  for (const page of targets) {
    const original = fs.readFileSync(page.filePath, 'utf8');
    const cleaned = refresh ? removeExisting(original) : original;
    const next = insertSection(updateDateModified(cleaned), upgradeSection(page));
    if (next !== original) {
      fs.writeFileSync(page.filePath, next);
      changed += 1;
    }
  }
  console.log(`Upgraded ${changed} random article pages with custom visuals, sources, and extra text.`);
}

main();

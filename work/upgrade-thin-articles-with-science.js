import fs from 'fs';
import path from 'path';

const root = process.cwd();
const marker = 'data-generated="science-depth-v1"';

const skipDirs = new Set(['.git', 'node_modules', 'work', 'dist']);
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
    ['NOAA Storm Prediction Center Tornado FAQ', 'https://www.spc.noaa.gov/faq/tornado/'],
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
    ['FEMA flood information', 'https://www.fema.gov/flood-maps']
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
  general: [
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/'],
    ['National Weather Service safety portal', 'https://www.weather.gov/safety/'],
    ['NOAA Climate.gov', 'https://www.climate.gov/']
  ]
};

const topicCopy = {
  tornado: {
    label: 'Tornado science',
    caption: 'A severe thunderstorm can organize rotation, lower a rotating wall cloud, and focus damaging wind into a narrow path near the ground.',
    why: 'Tornado topics deserve more than a one-line answer because the hazard changes quickly at neighborhood scale. A tornado warning, a visible funnel, a debris signature on radar, and a damage rating all describe different parts of the same story. Readers need to know which part is about the atmosphere, which part is about confirmation, and which part is about what to do next.',
    science: 'The core science is the overlap of moisture, instability, lift, and changing wind with height. NOAA severe-weather education materials describe tornadoes as rotating columns of air connected to a thunderstorm and the ground, but they also emphasize that the exact details of tornadogenesis are still an active research problem. That uncertainty matters: two storms can look similar on radar while only one produces a damaging tornado.',
    use: 'Use this article as a bridge between curiosity and action. If the topic is about formation, look for ingredients such as strong low-level moisture and wind shear. If it is about safety, focus on shelter quality, warning access, and how fast you can get to an interior room or rated shelter. If it is about a past event, separate the storm environment from the human exposure that made the outcome worse.',
    watch: 'The most important warning signs are official alerts, a storm with strong rotation, a lowering cloud base, rising dust or debris under a storm, and a sudden change from normal thunderstorm noise to a more violent wind signal. None of those signs should be used as a reason to wait outside. Night, rain wrapping, hills, trees, and buildings can hide a tornado until it is too close.',
    mistakes: 'A common mistake is treating Tornado Alley as the only place that matters. Another is assuming a weaker rating means a safe storm. Ratings describe damage after the fact, not what a storm can do to a person in the path. It is also risky to chase photos, drive away at the last minute, or wait for sirens when phone alerts and NOAA Weather Radio are available.'
  },
  hurricane: {
    label: 'Tropical cyclone science',
    caption: 'A tropical cyclone is a wide hazard field: wind, surge, rain, tornadoes, waves, and rip currents can affect different places at different times.',
    why: 'Hurricane and typhoon articles need context because the category number is only a wind scale. A lower-category storm can still create catastrophic water impacts, while a stronger storm that stays offshore may miss the worst-case outcome for a specific town. The useful question is not only "how strong is it?" but "which hazards can reach this place, and when?"',
    science: 'Tropical cyclones draw energy from warm ocean water and organized thunderstorms around a low-pressure center. Track depends on steering winds, nearby ridges and troughs, land interaction, and internal storm structure. Impacts depend on storm size, forward speed, coastal shape, rainfall efficiency, tides, and how many people and buildings sit in vulnerable areas.',
    use: 'Use this article with official National Hurricane Center products, local emergency management instructions, and your own evacuation or shelter plan. If the topic involves storm surge, remember that evacuation zones are usually about water risk and access, not just distance from the beach. If the topic involves track models, treat model lines as uncertainty guidance rather than a personal forecast.',
    watch: 'Watch for changes in watches and warnings, forecast cone shifts, rainfall outlooks, surge products, local evacuation orders, and the timing of tropical-storm-force winds. Preparations need to finish before bridges, causeways, and exposed roads become unsafe. Waiting until the eye or center track is certain can leave too little time.',
    mistakes: 'The biggest mistake is judging the entire threat by the category. Surge and inland flooding can dominate the losses even when wind is not the headline. Another mistake is focusing only on the center line: damaging weather can extend far from the center, and tornadoes in outer rainbands can affect communities that are not near landfall.'
  },
  flood: {
    label: 'Flood and rainfall science',
    caption: 'Flood risk comes from rainfall rate, drainage, soil saturation, terrain, rivers, and the choices people make around moving water.',
    why: 'Flood articles need more depth because water hazards look deceptively simple. A road may look shallow from a windshield, a creek may look calm between bursts of rain, and a forecast rainfall total may not reveal where the most intense band will sit. The real danger often comes from how fast water rises and how little margin people have once roads are cut off.',
    science: 'Flooding is controlled by rainfall intensity, rainfall duration, soil moisture, land cover, terrain, drainage capacity, river stage, and tide or surge effects near the coast. Flash flooding is especially dangerous because it can happen quickly in small basins, urban streets, slot canyons, burn scars, and places where water is forced through culverts or low-water crossings.',
    use: 'Use this article to connect the forecast to local geography. Check whether the problem is street flooding, river flooding, coastal flooding, basement backup, or a fast flash-flood threat. For property planning, look at drainage, sump pumps, gutters, grading, and insurance. For travel, the safest decision is usually to avoid flooded roads entirely.',
    watch: 'Watch for training thunderstorms, stalled fronts, tropical rain bands, excessive rainfall outlooks, rapidly rising creeks, water over pavement, and official flash flood warnings. Night flooding is especially dangerous because depth, current, and road damage are hard to see. Moving water can hide washed-out pavement and debris.',
    mistakes: 'The classic mistake is driving through water because another vehicle made it across or because the destination feels close. Another is assuming a familiar road is safe during an unusual rainfall setup. Flood risk also does not end when rain stops; rivers can rise later, saturated slopes can fail, and standing water can hide electrical, chemical, or sanitation hazards.'
  },
  winter: {
    label: 'Winter weather science',
    caption: 'Winter impacts depend on temperature layers, moisture, wind, road temperature, and how long ice or snow can accumulate.',
    why: 'Winter weather articles need careful explanation because small temperature differences can create totally different outcomes. Snow, sleet, freezing rain, freezing drizzle, whiteouts, and dangerous cold all require different decisions. The public forecast may use one headline, but the local impact often depends on road surface temperature and timing.',
    science: 'Winter precipitation depends on the temperature profile from cloud to ground. Snow can melt into rain in a warm layer, refreeze into sleet, or become freezing rain if liquid drops reach a subfreezing surface. Wind can turn falling or existing snow into whiteouts, while cold air and power outages can create hazards long after the main storm leaves.',
    use: 'Use this article to decide what kind of problem you are preparing for. Snow may be a shoveling and travel problem. Ice may be a tree, power, and walking problem. Wind and cold may be a heating, frostbite, and stranded-vehicle problem. The safest plan accounts for both the precipitation and the conditions after it ends.',
    watch: 'Watch for winter storm watches and warnings, ice storm warnings, wind chill products, blizzard warnings, rapid temperature drops, and road-treatment limits. Bridges, ramps, shaded roads, and untreated neighborhood streets often become hazardous before main roads look bad. Visibility can collapse quickly in blowing snow.',
    mistakes: 'A common mistake is measuring risk only by snow depth. A thin glaze of ice can cause more travel disruption than several inches of dry snow. Another mistake is assuming four-wheel drive solves braking distance. It helps a vehicle move, but it does not make icy pavement safe or stop carbon monoxide from a blocked tailpipe or generator mistake.'
  },
  heat: {
    label: 'Heat, drought, and air quality science',
    caption: 'Heat and smoke hazards build through temperature, humidity, overnight relief, air stagnation, exposure, and the ability to cool down.',
    why: 'Heat, drought, and smoke pages need more than a forecast high because the body and the landscape respond to accumulated stress. A single hot afternoon is different from a multi-day heat wave with warm nights. A smoky sky is different from a ground-level air quality episode. Drought is not only low rainfall; it is a chain of soil, vegetation, water-supply, and fire-weather impacts.',
    science: 'Heat risk increases when temperature, humidity, sun angle, light wind, urban surfaces, and warm nights prevent people from cooling. Drought risk builds when precipitation deficits combine with evaporation, soil moisture loss, and water demand. Smoke and stagnant air can trap pollutants near the ground, especially when inversions or weak winds limit mixing.',
    use: 'Use this article to identify who or what is most exposed: outdoor workers, athletes, older adults, infants, pets, people without reliable cooling, crops, livestock, and people with respiratory conditions. Good decisions include shifting activity times, checking cooling access, hydrating, monitoring indoor temperature, and following official air quality guidance.',
    watch: 'Watch for heat advisories, excessive heat warnings, red flag warnings, air quality alerts, smoke forecasts, burn bans, drought monitor changes, and unusually warm nights. Conditions can become dangerous before they look dramatic. Clear skies and sunshine can be as important as storm clouds when the hazard is heat.',
    mistakes: 'The most common mistake is treating heat as ordinary summer weather until symptoms appear. Another is using only the afternoon high and ignoring humidity, direct sun, workload, medications, indoor temperature, and nighttime recovery. For smoke, do not rely only on smell; pollution levels can vary by location and time.'
  },
  radar: {
    label: 'Forecast and radar science',
    caption: 'Forecast tools are evidence, not certainty: radar, satellite, models, and outlooks each answer a different question.',
    why: 'Forecast and radar topics need depth because the graphics can look more precise than they are. A model run, radar frame, or outlook category is not a promise. It is one piece of evidence about an evolving atmosphere. The best readers compare tools, timing, confidence, and official warnings instead of anchoring on one image.',
    science: 'Radar samples precipitation and motion in the atmosphere, while satellite shows cloud-top and moisture patterns. Forecast models simulate the atmosphere from observations and physics, then diverge as uncertainty grows. Outlooks and discussions add human forecaster interpretation. None of these tools removes uncertainty; they help locate the more likely scenarios.',
    use: 'Use this article by asking what the product is designed to show. Reflectivity highlights precipitation intensity, velocity can show rotation or wind, correlation coefficient can help identify debris or non-weather targets, and model guidance explores possible future states. Official warnings and local forecast updates should outrank a single social media screenshot.',
    watch: 'Watch for consistency across tools: strengthening rotation near the ground, storms moving into a more unstable air mass, model agreement on timing, or satellite trends showing rapid storm growth. Also watch for disagreement. A wide ensemble spread or a messy radar mode means decisions should leave extra margin.',
    mistakes: 'A common mistake is reading radar colors as a simple danger scale. Bright colors can mean heavy rain or hail, but the threat depends on storm structure and environment. Another mistake is assuming a forecast bust means forecasting is useless. Busts are often lessons about uncertainty, scale, timing, and missing observations.'
  },
  safety: {
    label: 'Preparedness and safety',
    caption: 'The best weather plan is boring before the storm and fast during the storm: alerts, shelter, supplies, and clear decisions.',
    why: 'Safety articles need practical depth because the right answer depends on location, building type, mobility, pets, medical needs, and time of day. A generic instruction like "take shelter" is useful, but a real plan answers where, how fast, with whom, and what happens if power or cell service fails.',
    science: 'Weather safety starts with hazard timing and exposure. Tornado wind, flash flooding, storm surge, lightning, extreme heat, winter cold, and downed power lines injure people in different ways. The safest plan reduces exposure before the hazard peaks and uses official alerts to trigger action before conditions are obvious.',
    use: 'Use this article to build a specific checklist. Identify your safest room, backup alert methods, family communication plan, medication needs, pet plan, charging plan, and post-storm hazards. For workplaces, schools, events, and apartments, the plan should assign responsibilities instead of assuming everyone will improvise correctly under stress.',
    watch: 'Watch for watches, warnings, evacuation orders, school or workplace notices, power outage risk, road closures, and changing conditions after the main storm. Many injuries happen during cleanup, generator use, driving through water, or walking near debris and downed lines. The end of the warning is not always the end of the hazard.',
    mistakes: 'The main mistake is waiting for a perfect confirmation before acting. Another is relying on one alert method, especially outdoor sirens that may not be heard indoors. Plans also fail when supplies are stored in one place but shelter is somewhere else, or when people do not practice how long it takes to reach safety.'
  },
  history: {
    label: 'Weather history and records',
    caption: 'Historic weather events combine meteorology with exposure, warning access, building vulnerability, and recovery.',
    why: 'History articles need context because disaster rankings can flatten complicated events into one number. The deadliest storm is not always the strongest storm. The costliest event is not always the most meteorologically extreme. Population, building quality, time of day, communication, and preparedness all shape the outcome.',
    science: "A historic weather event should be read in layers: the atmospheric setup, the hazard path, the warning environment, the people and buildings in harm's way, and the recovery that followed. Official databases and post-event summaries help separate measured or surveyed facts from later retellings, myths, and exaggerated claims.",
    use: 'Use this article as a case study. Ask what ingredients came together, what officials and residents knew at the time, which decisions had the biggest consequences, and which lessons still apply. For older events, remember that reporting, radar, communications, and damage surveys were often less complete than they are today.',
    watch: 'When reading any historic account, watch for source quality. Primary sources, official storm databases, NWS event summaries, and reputable historical archives are stronger than recycled lists without citations. Also watch for changing inflation, population, and damage-rating methods when comparing events across decades.',
    mistakes: 'The biggest mistake is treating a famous event as a template for every future event. Weather repeats patterns but not exact details. Another mistake is ranking events without explaining the metric. Fatalities, inflation-adjusted cost, path length, rating, pressure, rainfall, and social impact answer different questions.'
  },
  education: {
    label: 'Weather learning',
    caption: 'Good weather learning connects observation, repeatable experiments, official data, and clear safety boundaries.',
    why: 'Education articles need enough depth to be useful for students, teachers, and curious readers. A short definition may help with homework, but the stronger lesson explains what to observe, what to measure, what can go wrong, and how the same idea appears in real forecasts or warnings.',
    science: 'Weather science is built from observations: temperature, moisture, pressure, wind, clouds, precipitation, radar, satellite, and upper-air measurements. Simple classroom projects can demonstrate pressure, condensation, convection, evaporation, and wind, but they should also explain the limits of small experiments compared with the open atmosphere.',
    use: 'Use this article to turn curiosity into a safe activity. Define the question, gather observations, record what changed, compare with an official forecast, and write down what the experiment did not prove. That habit is more valuable than memorizing a single weather fact.',
    watch: 'Watch for projects that use heat, glass, pressure, sharp tools, electricity, or outdoor storms. Student weather activities should not send people outside during lightning, high wind, floodwater, extreme heat, or severe weather warnings. The best classroom connection is often made after the storm using safe data and observations.',
    mistakes: 'A common mistake is calling a demonstration a full model of the atmosphere. A bottle vortex, cloud jar, or barometer project shows one process, not every process. Another mistake is leaving out measurement units, repeated trials, or a control comparison, which makes the result harder to trust.'
  },
  marine: {
    label: 'Marine and coastal weather',
    caption: 'Coastal risk comes from wind, waves, currents, surge, tides, visibility, lightning, and how fast conditions change on the water.',
    why: 'Marine and beach weather articles need context because shore hazards can look calm from land. Rip currents, sneaker waves, fog, thunderstorm outflows, and small craft conditions may not match the sky overhead. The decision window is often shorter on a boat, beach, pier, or causeway than it is at home.',
    science: 'Marine weather depends on pressure gradients, wind duration, fetch, water depth, tides, coastal shape, and thunderstorms. Long-period swell can arrive from distant storms, while local squalls can create sudden wind shifts. Tropical systems add surge and waves that can affect the coast well before or after landfall.',
    use: 'Use this article with official marine forecasts, beach hazard statements, tide information, and local lifeguard or harbor guidance. Boaters should think about return routes, fuel, communications, life jackets, and whether the weakest person on board can handle the conditions.',
    watch: 'Watch for small craft advisories, gale warnings, beach hazard statements, rip current forecasts, dense fog, lightning, cold water, and increasing onshore wind. If storms are nearby, conditions on open water can deteriorate faster than a casual forecast check suggests.',
    mistakes: 'A common mistake is judging safety only by whether it is raining. Wind, waves, current, fog, and water temperature can be dangerous under a bright sky. Another mistake is assuming a familiar beach or lake behaves the same way every day; currents and water levels change with weather patterns.'
  },
  general: {
    label: 'Weather science',
    caption: 'Weather risk comes from the overlap of atmospheric ingredients, local geography, exposure, and timing.',
    why: 'General weather articles need enough depth to connect the headline to the atmosphere behind it. A term may sound simple, but the useful meaning often depends on scale: what is happening in the cloud, what is happening across a region, and what it means for people on the ground.',
    science: 'Most weather changes begin with uneven heating, pressure differences, moisture, and air motion. Fronts, clouds, storms, fog, drought, and wind all reflect the atmosphere trying to balance temperature and pressure while water changes phase between vapor, liquid, and ice. Local terrain and land use can sharpen or soften those patterns.',
    use: 'Use this article by connecting the concept to decisions. Is the issue visibility, wind, heat, water, lightning, air quality, or travel timing? Once the hazard is clear, official forecasts and local alerts become easier to interpret. The goal is not to memorize every term; it is to know which signal should change your plan.',
    watch: 'Watch for forecast confidence, timing, terrain effects, time of day, and whether several hazards overlap. A modest storm with bad timing can create more disruption than a stronger storm that misses populated areas. Small changes in temperature, moisture, or storm track can shift the impact zone.',
    mistakes: 'A common mistake is treating weather terms as fixed labels instead of clues. Another is comparing events only by one number, such as temperature, wind speed, or rainfall total. Impacts usually come from the combination of intensity, duration, exposure, and vulnerability.'
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

function visualsCount(html) {
  return (html.match(/<img\b|<svg\b|<figure\b/gi) || []).length;
}

function hasSources(html) {
  return /sources|citation|further reading|NOAA|NWS|Storm Prediction Center|National Hurricane Center|FEMA|Ready\.gov|Climate\.gov/i.test(html);
}

function textFromMatch(html, regex, fallback) {
  const match = html.match(regex);
  if (!match) return fallback;
  return stripTags(match[1]).replace(/\s+/g, ' ').trim() || fallback;
}

function escapeHtml(value) {
  return value
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
  const explicitSafety = /safety|preparedness|emergency|emergency-kit|kit|drill|shelter|go-bag|outage|generator|carbon-monoxide|downed-power|first-aid|action-plan|cleanup|recovery-guide|storm-prep|weather-prep|continuity|checklist|safe-room|family-communication|emergency-communication/;
  const historyPattern = /history|timeline|record|records|disaster|deadliest|costliest|outbreak|legacy|lessons|1974|2011|1936|1953|1925|1899|1999|2013|2020|2021|2022|2023|2024|xenia|joplin|moore|jarrell|tri-state|waco|tupelo|gainesville|greensburg|mayfield|plainfield|woodward|flint|fargo|barrie|edmonton|regina|vicksburg|natchez|topeka|wichita-falls/;

  if (/school|student|classroom|project|experiment|lesson|career|meteorologist|hydrologist|science-fair|vocabulary|kids|teacher|worksheet|activity|presentation/.test(haystack)) return 'education';
  if (historyPattern.test(haystack)) return 'history';
  if (/hurricane|typhoon|cyclone|tropical-storm|tropical-cyclone|tropical-depression|storm-surge|surge|evacuation-zone|andrew|katrina|harvey|sandy|galveston/.test(haystack)) return 'hurricane';
  if (explicitSafety.test(haystack)) return 'safety';
  if (/tornado|twister|supercell|funnel|wall-cloud|mesocyclone|hook-echo|dryline|ef-scale|fujita|wedge|rope|waterspout|landspout|qlcs|debris-signature|tornado-alley|dixie-alley|siren/.test(haystack)) return 'tornado';
  if (/flood|rainfall|rainstorm|river|atmospheric-river|qpf|excessive-rain|drainage|sump|mold|water-safety|coastal-flood|hundred-year/.test(haystack)) return 'flood';
  if (/winter|snow|blizzard|ice|icing|freezing|sleet|frost|whiteout|wind-chill|polar-vortex|lake-effect|nor-easter|cold-wave|snowfall/.test(haystack)) return 'winter';
  if (/heat|drought|wildfire|smoke|air-quality|uv-index|red-flag|burn-ban|stagnation|cooling-center|megadrought|urban-heat/.test(haystack)) return 'heat';
  if (/radar|satellite|forecast|model|spc|nws|noaa|metar|taf|skew|hodograph|weather-map|surface-analysis|upper-air|outlook|mesoanalysis|mesoscale|ensemble|nowcasting|probability|confidence|uncertainty|weather-app|velocity|reflectivity|correlation-coefficient|area-forecast/.test(haystack)) return 'radar';
  if (/marine|beach|rip-current|small-craft|gale|boating|coastal|king-tide|sea-fog|lake-breeze|waterfront|harbor|safeboating/.test(haystack)) return 'marine';

  return 'general';
}

function slugId(slug) {
  return slug.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'article';
}

function figureSvg(kind, title, slug) {
  const id = slugId(slug);
  const titleText = escapeHtml(`${title} visual guide`);
  const copy = topicCopy[kind] || topicCopy.general;
  const caption = escapeHtml(copy.caption);
  const base = {
    tornado: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f4f7fb"/><path d="M0 260h720v60H0z" fill="#d9e7d3"/>
      <path d="M75 118c70-64 151-67 214-26 34-38 109-45 157-12 62-22 132 7 166 58H75z" fill="#34465c"/>
      <path d="M134 151c60 18 137 22 213 6 95-20 159 2 226 45" fill="none" stroke="#72839a" stroke-width="18" stroke-linecap="round"/>
      <path d="M352 140c-31 28-24 69-53 101-17 19-40 32-67 45 53-1 90-12 116-38 42-42 22-81 63-112z" fill="#9aa7b5"/>
      <path d="M254 274c34 9 77 9 118 0" stroke="#7b4f2a" stroke-width="10" stroke-linecap="round"/>
      <path d="M500 95l40-22m-18 52l55-6m-94 31l39 22" stroke="#f4b844" stroke-width="7" stroke-linecap="round"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Storm base, rotation, and damage path</text>
    </svg>`,
    hurricane: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#edf7fb"/><path d="M0 242c90-18 160-10 230 1s141 24 232 1 162-26 258-2v78H0z" fill="#8fc7dc"/>
      <path d="M514 72c-80-35-184-7-219 66-18 38 0 68 36 76 48 10 87-21 103-59-31 22-74 24-92 1-21-28 17-81 82-91 60-9 117 13 150 55-6-20-26-37-60-48z" fill="#24658f"/>
      <circle cx="399" cy="151" r="28" fill="#edf7fb"/><path d="M398 151c-52 41-116 39-167 17 28 50 95 80 161 69 73-12 120-67 121-127-20 19-57 27-115 41z" fill="#54a3c4"/>
      <path d="M64 238h210" stroke="#124559" stroke-width="8" stroke-linecap="round"/><path d="M93 204v34m50-52v52m50-24v24" stroke="#124559" stroke-width="7" stroke-linecap="round"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Wind, water, and track uncertainty</text>
    </svg>`,
    flood: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f2f7fb"/><path d="M0 236c74-28 142-17 213 0s137 31 220 0 178-28 287 0v84H0z" fill="#4f9ec2"/>
      <path d="M95 188h145v52H95zM117 156h101v32H117z" fill="#e1ded4"/><path d="M478 149h106v93H478zM506 113h50v36h-50z" fill="#d5d0c2"/>
      <path d="M60 68c44-33 94-34 134-5 42-29 102-23 136 16H60z" fill="#536779"/><path d="M410 71c44-33 94-34 134-5 42-29 102-23 136 16H410z" fill="#536779"/>
      <path d="M113 99l-15 41m62-41l-15 41m62-41l-15 41m306-38l-15 41m62-41l-15 41m62-41l-15 41" stroke="#2e82aa" stroke-width="6" stroke-linecap="round"/>
      <path d="M313 218h88" stroke="#26384c" stroke-width="9" stroke-linecap="round"/><path d="M351 176v67" stroke="#26384c" stroke-width="7"/><text x="365" y="196" font-family="Inter,Arial,sans-serif" font-size="16" fill="#26384c">gauge</text>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Rain rate plus drainage equals flood risk</text>
    </svg>`,
    winter: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#eef6fb"/><path d="M0 248h720v72H0z" fill="#dcebf3"/><path d="M75 112c66-58 144-60 203-24 38-35 104-36 149-4 65-18 131 11 165 60H75z" fill="#62768a"/>
      <path d="M138 174l-20 20m20 0l-20-20m103 8l-20 20m20 0l-20-20m103-8l-20 20m20 0l-20-20m103 12l-20 20m20 0l-20-20m103-4l-20 20m20 0l-20-20" stroke="#2c7ba0" stroke-width="5" stroke-linecap="round"/>
      <path d="M94 260c113-34 224-34 332 0s175 33 250-3" stroke="#a7bdc9" stroke-width="18" fill="none"/><path d="M521 205h88v48h-88zM544 174h42v31h-42z" fill="#bfcbd3"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Temperature layers change the hazard</text>
    </svg>`,
    heat: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#fff5e6"/><circle cx="596" cy="83" r="47" fill="#f7b733"/><path d="M596 15v-13m0 164v-13m-68-68h-13m164 0h-13m-116-48l-10-10m116 116l-10-10m0-96l10-10m-116 116l10-10" stroke="#f2992e" stroke-width="7" stroke-linecap="round"/>
      <path d="M79 222h85v98H79zm122-56h85v154h-85zm122 35h85v119h-85zm122-77h85v196h-85z" fill="#8d99a8"/><path d="M0 260h720v60H0z" fill="#5f6f7a"/>
      <path d="M115 68h39v141a45 45 0 1 1-39 0z" fill="#fff" stroke="#a23b2b" stroke-width="8"/><path d="M134 126v118" stroke="#d94f31" stroke-width="15" stroke-linecap="round"/><circle cx="134" cy="255" r="24" fill="#d94f31"/>
      <path d="M39 112c80-18 153-4 223 11 71 15 139 28 222 0" stroke="#c97847" stroke-width="9" stroke-linecap="round" fill="none" opacity=".65"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Exposure builds over hours and days</text>
    </svg>`,
    radar: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f4f7f1"/><circle cx="238" cy="172" r="112" fill="none" stroke="#6c8f73" stroke-width="4"/><circle cx="238" cy="172" r="73" fill="none" stroke="#6c8f73" stroke-width="3"/><circle cx="238" cy="172" r="34" fill="none" stroke="#6c8f73" stroke-width="3"/><path d="M238 172L347 108" stroke="#2f6f4e" stroke-width="9" stroke-linecap="round"/><circle cx="238" cy="172" r="8" fill="#172033"/>
      <path d="M438 212c-52-7-73-48-52-83 24-41 94-42 137-5 45 39 32 94-14 118-27 14-56 14-82 4 43 1 78-16 89-43 15-36-23-76-76-70-41 4-66 31-58 60 6 23 29 37 56 39z" fill="#d94f31"/>
      <path d="M440 149c25 5 52 17 70 41" stroke="#f7b733" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M458 227c34-6 61-24 75-53" stroke="#2f6f4e" stroke-width="10" stroke-linecap="round" fill="none"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Each forecast tool answers one question</text>
    </svg>`,
    safety: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f7f3ee"/><path d="M110 153l104-82 104 82v126H110z" fill="#d8c4a8" stroke="#6f5c49" stroke-width="8"/><path d="M174 279v-76h78v76" fill="#fbfaf7" stroke="#6f5c49" stroke-width="7"/><path d="M214 71v208" stroke="#a02818" stroke-width="8" opacity=".3"/>
      <path d="M458 73l105 39v64c0 64-44 104-105 128-61-24-105-64-105-128v-64z" fill="#e8eef5" stroke="#24435f" stroke-width="8"/><path d="M411 178l31 31 72-86" fill="none" stroke="#2f6f4e" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M77 96h71m374 198h77M74 284h44" stroke="#f4b844" stroke-width="9" stroke-linecap="round"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Alerts plus shelter plus a practiced plan</text>
    </svg>`,
    history: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#fbfaf7"/><path d="M92 174h536" stroke="#31445a" stroke-width="8" stroke-linecap="round"/><circle cx="143" cy="174" r="21" fill="#a02818"/><circle cx="282" cy="174" r="21" fill="#f4b844"/><circle cx="421" cy="174" r="21" fill="#2f6f4e"/><circle cx="560" cy="174" r="21" fill="#24658f"/>
      <path d="M143 146V92m139 82v58m139-58V94m139 80v58" stroke="#31445a" stroke-width="5"/><rect x="96" y="58" width="95" height="42" rx="6" fill="#fff" stroke="#e1d9cc"/><rect x="236" y="230" width="95" height="42" rx="6" fill="#fff" stroke="#e1d9cc"/><rect x="374" y="60" width="95" height="42" rx="6" fill="#fff" stroke="#e1d9cc"/><rect x="513" y="230" width="95" height="42" rx="6" fill="#fff" stroke="#e1d9cc"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Events are science plus exposure over time</text>
    </svg>`,
    education: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f4f7fb"/><path d="M116 248h196v32H116z" fill="#31445a"/><path d="M181 82h68v166h-68z" fill="#dcebf3" stroke="#31445a" stroke-width="7"/><path d="M181 149h68v99h-68z" fill="#6ab0cf"/><path d="M464 72c47 0 85 38 85 85s-38 85-85 85-85-38-85-85 38-85 85-85z" fill="#fff" stroke="#31445a" stroke-width="7"/><path d="M464 157l51-29m-51 29v-60" stroke="#a02818" stroke-width="8" stroke-linecap="round"/><path d="M430 235l-34 49m102-49l34 49" stroke="#31445a" stroke-width="8" stroke-linecap="round"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Observe, measure, compare, explain</text>
    </svg>`,
    marine: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#eaf5f8"/><path d="M0 221c79-28 151-24 219-2s129 38 211 2 167-42 290-4v103H0z" fill="#347f9f"/><path d="M72 250c71-20 139-18 204 0s124 32 196 0 143-29 209-3" stroke="#9fd1e4" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M224 195h148l-28 42H254z" fill="#f4b844" stroke="#22465c" stroke-width="7"/><path d="M289 86v109" stroke="#22465c" stroke-width="8"/><path d="M294 96l92 69h-92z" fill="#fff" stroke="#22465c" stroke-width="6"/><path d="M482 85c52-23 104-19 156 13" stroke="#5f6f7a" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M504 123c38-16 76-13 114 10" stroke="#5f6f7a" stroke-width="8" stroke-linecap="round" fill="none"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Wind, waves, water level, and visibility</text>
    </svg>`,
    general: `<svg viewBox="0 0 720 320" role="img" aria-labelledby="fig-title-${id} fig-desc-${id}" xmlns="http://www.w3.org/2000/svg">
      <title id="fig-title-${id}">${titleText}</title><desc id="fig-desc-${id}">${caption}</desc>
      <rect width="720" height="320" fill="#f4f7fb"/><path d="M0 253h720v67H0z" fill="#d7e6d2"/><path d="M93 132c56-49 124-51 175-20 34-31 91-32 130-3 56-16 113 10 142 53H93z" fill="#637489"/>
      <path d="M119 218c43-29 93-33 150-12s113 28 170 2 107-31 161-7" stroke="#2f6f4e" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M201 96c17-48 54-72 111-73m-46 25l46-25-11 50" stroke="#f4b844" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M515 85c-23 62-14 109 27 141m-48-10l48 10-18-46" stroke="#a02818" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="44" y="48" font-family="Inter,Arial,sans-serif" font-size="22" fill="#172033" font-weight="700">Ingredients, timing, and local exposure</text>
    </svg>`
  };

  return base[kind] || base.general;
}

function sourceList(kind) {
  const chosen = sources[kind] || sources.general;
  return chosen.map(([label, url]) => `<li><a href="${url}" rel="noopener">${escapeHtml(label)}</a></li>`).join('');
}

function makeUpgradeSection({ title, category, slug, kind }) {
  const copy = topicCopy[kind] || topicCopy.general;
  const safeTitle = escapeHtml(title);
  const safeCategory = escapeHtml(category || copy.label);
  const figure = figureSvg(kind, title, slug);
  const label = escapeHtml(copy.label);

  return `
<section class="article-upgrade" ${marker}>
  <style>
    .article-upgrade{margin:42px 0 0;padding-top:10px}.article-upgrade .science-figure{margin:24px 0 28px;background:#fff;border:1px solid var(--border,#e5e1d8);border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(20,22,28,.08)}.article-upgrade .science-figure svg{display:block;width:100%;height:auto}.article-upgrade .science-figure figcaption{padding:12px 16px;color:var(--text-secondary,#4a5061);font-size:14px;line-height:1.5;border-top:1px solid var(--border,#e5e1d8)}.article-upgrade .article-checklist{margin:12px 0 18px 22px}.article-upgrade .article-checklist li{margin-bottom:8px}.article-upgrade .source-box{background:var(--surface,#fff);border-left:4px solid var(--accent,#a02818);padding:18px 20px;margin:28px 0;box-shadow:0 2px 10px rgba(0,0,0,.04)}.article-upgrade .source-box ul{margin:10px 0 0 20px}.article-upgrade .reader-note{font-size:15px;color:var(--text-secondary,#4a5061)}
  </style>
  <figure class="science-figure">
    ${figure}
    <figcaption>${escapeHtml(copy.caption)} This original Tornado Hub figure is designed as an educational diagram for ${safeTitle}.</figcaption>
  </figure>
  <h2>Why this ${safeCategory.toLowerCase()} story matters</h2>
  <p>${escapeHtml(copy.why)}</p>
  <p>For <strong>${safeTitle}</strong>, the practical value is context. A reader should leave with a clearer sense of what the term means, what evidence supports it, and what choices it should influence before, during, or after hazardous weather.</p>
  <h2>The science in plain English</h2>
  <p>${escapeHtml(copy.science)}</p>
  <p>Weather is rarely controlled by one ingredient. The same headline can play out differently depending on storm timing, terrain, building quality, warning access, and how many people are exposed. That is why official meteorology sources usually describe risk as a combination of probability, severity, and confidence rather than as a single yes-or-no answer.</p>
  <h2>How to use this information</h2>
  <p>${escapeHtml(copy.use)}</p>
  <p>If you are comparing this page with another guide, look for the scale of the question. Some pages explain what happens inside a storm, some explain what forecasters can detect, and others explain what a household, school, business, or community should do. Mixing those scales is how weather myths spread.</p>
  <h2>What to watch for</h2>
  <p>${escapeHtml(copy.watch)}</p>
  <p>Pay attention to update timing. Forecasts and warnings are snapshots of the best available information, and high-impact weather can evolve between updates. When official guidance changes, treat the change as new information rather than as a contradiction.</p>
  <h2>Common mistakes</h2>
  <p>${escapeHtml(copy.mistakes)}</p>
  <p>Another general mistake is using old experience as the only guide. People often prepare for the last event they remember, but the next event may arrive at a different time of day, affect a different road, or stress a different part of the home or community.</p>
  <h2>Reader checklist</h2>
  <p>Before moving on from ${safeTitle}, use this quick checklist to separate useful weather information from noise:</p>
  <ul class="article-checklist">
    <li>Can you name the main hazard: wind, water, lightning, heat, cold, visibility, or air quality?</li>
    <li>Do you know whether the page is explaining formation, detection, forecasting, safety, history, or recovery?</li>
    <li>Have you checked whether the official source is describing probability, observed damage, or immediate action?</li>
    <li>Can you identify the decision point: shelter, delay travel, evacuate, protect property, or keep monitoring?</li>
    <li>Do you have a second alert path if power, cell service, sirens, or internet access fail?</li>
  </ul>
  <p>That checklist is intentionally conservative. Weather education is most valuable when it helps a reader make a calmer decision under pressure, not when it simply adds more dramatic storm vocabulary.</p>
  <div class="source-box">
    <strong>Sources and further reading:</strong>
    <ul>${sourceList(kind)}</ul>
    <p class="reader-note">Tornado Hub articles are educational explainers and are not a live warning service. For immediate decisions, use official alerts from your local National Weather Service office, emergency management agency, or equivalent national weather authority.</p>
  </div>
</section>`;
}

function shouldSkip(filePath, slug) {
  const relative = path.relative(root, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return true;
  if (relative.startsWith('quiz/')) return true;
  if (relative.startsWith('weather-trivia/')) return true;
  return skipSlugs.has(slug);
}

function insertSection(html, section) {
  const relatedIndex = html.indexOf('<section class="related">');
  if (relatedIndex !== -1) {
    return `${html.slice(0, relatedIndex)}${section}${html.slice(relatedIndex)}`;
  }
  const articleCloseIndex = html.indexOf('</article>');
  if (articleCloseIndex !== -1) {
    return `${html.slice(0, articleCloseIndex)}${section}${html.slice(articleCloseIndex)}`;
  }
  return html;
}

function removeExistingSection(html) {
  const start = html.indexOf(`<section class="article-upgrade" ${marker}>`);
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
  const category = textFromMatch(html, /<div class="eyebrow">([\s\S]*?)<\/div>/i, 'Weather');
  const words = wordCount(html);
  const visuals = visualsCount(html);
  const sourcePresent = hasSources(html);
  const article = /<article\b/i.test(html);
  const alreadyUpgraded = html.includes(marker);
  const skipped = shouldSkip(filePath, slug);
  const needsUpgrade = article && !alreadyUpgraded && !skipped && (words < 1200 || visuals === 0 || !sourcePresent);

  return {
    filePath,
    slug,
    title,
    category,
    kind: classify(slug, title, category),
    words,
    visuals,
    sourcePresent,
    article,
    alreadyUpgraded,
    skipped,
    needsUpgrade
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const refresh = args.has('--refresh');
  const pages = walk(root).map(auditPage);
  const articlePages = pages.filter((page) => page.article && !page.skipped);
  const targets = articlePages.filter((page) => refresh ? page.alreadyUpgraded : page.needsUpgrade);

  const summary = {
    totalIndexPages: pages.length,
    articlePages: articlePages.length,
    alreadyUpgraded: articlePages.filter((page) => page.alreadyUpgraded).length,
    targets: targets.length,
    under700: articlePages.filter((page) => page.words < 700).length,
    under1000: articlePages.filter((page) => page.words < 1000).length,
    missingVisuals: articlePages.filter((page) => page.visuals === 0).length,
    missingSources: articlePages.filter((page) => !page.sourcePresent).length,
    byKind: targets.reduce((acc, page) => {
      acc[page.kind] = (acc[page.kind] || 0) + 1;
      return acc;
    }, {})
  };

  if (dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    console.log(targets.slice(0, 40).map((page) => `${page.words}\t${page.visuals}\t${page.sourcePresent ? 'src' : 'no-src'}\t${page.kind}\t${path.relative(root, page.filePath)}`).join('\n'));
    return;
  }

  for (const page of targets) {
    const html = removeExistingSection(fs.readFileSync(page.filePath, 'utf8'));
    const section = makeUpgradeSection(page);
    const updated = insertSection(html, section);
    if (updated !== html) {
      fs.writeFileSync(page.filePath, updated);
    }
  }

  console.log(JSON.stringify({ ...summary, changed: targets.length }, null, 2));
}

main();

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  ['area-forecast-discussion-explained', 'Forecasting', 'Area Forecast Discussion Explained: How to Read the Meteorologist Notes', 'What an Area Forecast Discussion is, why meteorologists write it, and how to use it for confidence, timing, hazards, and uncertainty.', 'An Area Forecast Discussion is a plain-language technical note from forecasters explaining the reasoning behind the forecast.', ['What it contains', 'Forecast discussions often explain timing, uncertainty, model differences, hazards, and local reasoning that may not fit in a short app forecast.', 'They can mention confidence levels, fronts, storm ingredients, snow ratios, aviation concerns, or marine hazards.'], ['How to read it', 'Start with the short term section for today and tonight, then scan long term, aviation, marine, and watches or warnings if present.', 'Do not worry about every abbreviation. Look for words like confidence, timing, uncertainty, severe, flooding, snow, wind, and changes.'], ['Why it helps', 'Apps compress forecasts into icons. Discussions show the human reasoning behind those icons.', 'For high-impact weather, that extra context can help you decide when to prepare.']],
  ['probability-of-precipitation-explained', 'Forecasting', 'Probability of Precipitation Explained: What a 40 Percent Chance of Rain Means', 'What PoP means in weather forecasts, why it is not simply how much of the day it will rain, and how to use rain chances correctly.', 'Probability of precipitation is the chance that measurable precipitation will occur at a point during the forecast period.', ['The common misunderstanding', 'A 40 percent chance does not mean it will rain for 40 percent of the day. It also does not necessarily mean 40 percent of the area will get rain in every forecast system.', 'Think of it as a probability signal for measurable precipitation at your location or forecast point.'], ['Coverage and confidence', 'Rain chances combine uncertainty about whether precipitation will form with uncertainty about where it will fall.', 'A scattered thunderstorm day may have a moderate chance even if many hours stay dry.'], ['Planning use', 'Use PoP with timing, radar, cloud cover, and event sensitivity.', 'A 30 percent storm chance matters more for an outdoor wedding than for a normal commute.']],
  ['qpf-weather-forecast-explained', 'Forecasting', 'QPF Weather Forecast Explained: How Much Rain or Snow Water Is Expected', 'What quantitative precipitation forecast means, how QPF differs from rain chance, and why snow totals depend on more than QPF alone.', 'QPF estimates how much liquid precipitation may fall. For snow, QPF is only the water amount before applying snow ratio and other factors.', ['QPF basics', 'Quantitative precipitation forecast is usually shown as liquid water. A forecast of 0.50 inches means half an inch of liquid equivalent.', 'It can come from rain, melted snow, sleet, or mixed precipitation.'], ['Snow connection', 'Snow totals depend on QPF multiplied by snow ratio, but ratios vary with temperature, crystal type, wind, compaction, and mixing.', 'That is why the same QPF can produce very different snow amounts.'], ['Flooding use', 'QPF helps forecasters judge flood risk, especially when heavy rain repeats over the same area.', 'Soil moisture, terrain, drainage, and storm speed affect whether a given QPF becomes flooding.']],
  ['snow-to-liquid-ratio-explained', 'Winter Weather', 'Snow-to-Liquid Ratio Explained: Why One Inch of Water Can Make Different Snow Totals', 'Why snow ratios vary, what 10-to-1 means, and how temperature, wind, and snow crystal type change snowfall totals.', 'Snow-to-liquid ratio compares snow depth to melted water. A 10-to-1 ratio means 10 inches of snow melts to about 1 inch of water.', ['The 10-to-1 shortcut', 'Many people hear 10-to-1 as a default ratio, but real storms can be lower or higher.', 'Wet heavy snow may have a lower ratio, while cold fluffy snow can have a higher ratio.'], ['What changes ratio', 'Temperature through the cloud, dendritic growth zones, wind, compaction, sleet, and rain mixing all affect accumulation.', 'Strong wind can break flakes and reduce measured depth.'], ['Forecast impact', 'A small ratio change can shift snow totals a lot when QPF is high.', 'This is one reason snowfall maps can change close to the event.']],
  ['weather-station-model-explained', 'Weather Maps', 'Weather Station Model Explained: How to Read the Little Weather Map Symbols', 'How station models show temperature, dew point, pressure, wind, cloud cover, and weather using compact symbols on surface maps.', 'A station model is a compact weather symbol that packs current observations into a small plot on a map.', ['What is plotted', 'Station models can show temperature, dew point, wind direction and speed, pressure, pressure tendency, cloud cover, and present weather.', 'The layout looks cryptic at first, but each number or symbol has a standard position.'], ['Wind barbs', 'The stem points from the direction the wind is coming from. Barbs and flags show speed.', 'Once you learn wind barbs, surface maps become much easier to scan.'], ['Why it matters', 'Station models reveal fronts, drylines, pressure systems, and air mass boundaries.', 'They are especially useful when radar is quiet but the atmosphere is changing.']],
  ['surface-analysis-map-explained', 'Weather Maps', 'Surface Analysis Map Explained: Fronts, Pressure, Isobars, and Weather Symbols', 'How to read a surface analysis map, including highs, lows, fronts, drylines, troughs, isobars, and station observations.', 'A surface analysis map shows what is happening near the ground: pressure systems, fronts, boundaries, winds, and observations.', ['Highs, lows, and isobars', 'High and low pressure centers shape wind and weather. Isobars connect equal pressure and reveal pressure gradients.', 'Tighter isobars usually mean stronger winds.'], ['Fronts and boundaries', 'Cold fronts, warm fronts, stationary fronts, occluded fronts, troughs, drylines, and outflow boundaries can all focus weather changes.', 'These features help explain why storms form in one corridor and not another.'], ['Using the map', 'Compare surface analysis with radar, satellite, and forecasts.', 'A single map shows one moment; loops and updates show how the pattern evolves.']],
  ['upper-air-weather-map-explained', 'Forecasting', 'Upper-Air Weather Maps Explained: 500 mb, 700 mb, 850 mb, and Jet-Level Charts', 'What upper-air maps show, why meteorologists use pressure levels, and how upper-level patterns guide storms, temperatures, and precipitation.', 'Upper-air maps show the atmosphere above the surface at pressure levels such as 850, 700, 500, and 250 mb.', ['Why pressure levels', 'Meteorologists use pressure surfaces because they follow the atmosphere better than fixed heights in many analyses.', 'Each level highlights different features: low-level temperature, moisture, lift, steering flow, and jet streams.'], ['Common levels', '850 mb is useful for low-level temperature and moisture. 700 mb can show lift and dry layers. 500 mb shows troughs and ridges. 250 or 300 mb shows jet streams.', 'No level tells the whole story alone.'], ['Forecast use', 'Upper-air maps help explain why surface weather changes.', 'A storm at the ground often depends on support from the atmosphere above it.']],
  ['radar-loop-how-to-read', 'Radar', 'How to Read a Weather Radar Loop Without Getting Fooled', 'How to use radar loops for storm movement, intensity trends, training storms, gaps, and common mistakes like relying on one old frame.', 'A radar loop is more useful than a single image because it shows motion, trends, and whether storms are growing, weakening, or repeating over the same area.', ['Motion matters', 'Watch where storms are moving, not just where they are now. A loop helps you estimate arrival and whether the storm is turning or expanding.', 'Fast storms can cover a lot of distance between radar scans.'], ['Training storms', 'A loop can reveal storms moving over the same area repeatedly. That is a flash flood clue even if individual cells do not look extreme.', 'Training is especially dangerous at night or over urban areas.'], ['Common mistakes', 'Do not use one stale frame. Do not assume green is always harmless or red is always severe.', 'Use warnings, velocity, lightning, and local reports with the loop.']],
  ['metar-report-explained', 'Aviation Weather', 'METAR Report Explained: Reading Airport Weather Observations', 'A beginner-friendly guide to METAR reports, including wind, visibility, clouds, temperature, dew point, pressure, and present weather codes.', 'A METAR is a coded airport weather observation that reports current conditions such as wind, visibility, clouds, temperature, dew point, and pressure.', ['Why METARs exist', 'Aviation needs compact, standardized observations. METARs let pilots and forecasters compare conditions quickly across airports.', 'They update regularly and can change fast during fog, storms, snow, or wind shifts.'], ['Key pieces', 'Wind, visibility, present weather, cloud layers, temperature, dew point, and altimeter setting are core parts.', 'Learning just those pieces makes METARs much less intimidating.'], ['Everyday use', 'METARs are useful beyond aviation because airports often have reliable weather sensors.', 'They can reveal local fog, gusts, ceiling, and pressure trends.']],
  ['taf-forecast-explained', 'Aviation Weather', 'TAF Forecast Explained: How Airport Forecasts Describe Changing Weather', 'What a TAF is, how it differs from a METAR, and how aviation forecasts communicate wind, visibility, clouds, and timing changes.', 'A TAF is an airport forecast. While a METAR reports current conditions, a TAF predicts expected conditions over a future period.', ['TAF vs METAR', 'METARs observe what is happening now. TAFs forecast what is expected at an airport.', 'Together they help users compare current conditions to expected changes.'], ['Timing groups', 'TAFs use time groups to show when wind, visibility, weather, or cloud ceilings may change.', 'Temporary and probability groups communicate uncertainty or shorter-lived conditions.'], ['Why it helps', 'TAFs are useful when fog, storms, snow, wind, or low clouds may affect travel.', 'Even non-pilots can use them for local timing clues if they learn the basics.']],
  ['cloud-ceiling-explained', 'Aviation Weather', 'Cloud Ceiling Explained: Why Low Clouds Matter for Aviation and Travel', 'What cloud ceiling means, how it differs from cloud cover, and why low ceilings affect aviation, mountain travel, and gloomy weather days.', 'Cloud ceiling is the height of the lowest broken or overcast cloud layer, important for aviation and visibility-related travel decisions.', ['Ceiling vs clouds', 'A few scattered clouds do not usually count as a ceiling. Broken or overcast layers matter more because they cover enough sky to affect flight rules.', 'Ceiling is about height, not just whether clouds exist.'], ['Travel impacts', 'Low ceilings can delay flights, hide terrain, reduce pilot options, and make mountain travel more hazardous.', 'They often occur with fog, drizzle, warm fronts, marine layers, or winter storms.'], ['How it changes', 'Ceilings can lift with daytime mixing or fall when moisture deepens.', 'Forecast discussions and TAFs often mention expected ceiling trends.']],
  ['weather-normal-vs-record', 'Climate Data', 'Weather Normal vs Record: What Climate Numbers Really Mean', 'The difference between normals, averages, records, daily climate data, and why a warm day does not mean the same thing as a long-term trend.', 'A weather normal is a long-term reference value, while a record is an extreme observed value for a specific date or period.', ['Normals', 'Climate normals are usually calculated over a multi-decade period to give context for typical temperatures or precipitation.', 'They help answer whether today is warmer, colder, wetter, or drier than usual.'], ['Records', 'Records are the highest, lowest, wettest, or snowiest values observed for a date or location.', 'A record can be broken by one event, while normals describe the baseline.'], ['Using both', 'Normals and records answer different questions.', 'For climate trends, look at many observations over time rather than one unusual day.']],
  ['seasonal-outlook-explained', 'Forecasting', 'Seasonal Outlook Explained: What Long-Range Temperature and Precipitation Maps Mean', 'How seasonal outlooks work, what above and below normal categories mean, and why long-range outlooks are probabilities rather than day-by-day forecasts.', 'A seasonal outlook shows whether odds lean toward above, near, or below normal conditions over a broad period.', ['Probability not schedule', 'A seasonal outlook does not tell you the weather on a specific day. It gives a broad tilt in the odds across weeks or months.', 'A warmer-than-normal outlook can still include cold outbreaks.'], ['Above and below normal', 'The categories compare expected conditions to historical normals.', 'Equal chances means no strong tilt toward above, near, or below normal.'], ['How to use it', 'Seasonal outlooks help with broad planning for energy, agriculture, drought, water, and preparedness.', 'Use short-range forecasts for actual daily decisions.']],
  ['weather-model-run-timing', 'Forecasting', 'Weather Model Run Timing: Why Forecast Maps Update Several Times a Day', 'Why weather models run on schedules, what model initialization means, and why one new run should not be treated as a guaranteed forecast change.', 'Weather models update on regular cycles after ingesting observations. A single new run is guidance, not a finished forecast.', ['Model cycles', 'Models start from an analyzed snapshot of the atmosphere and then simulate forward.', 'Major models update at set times, though products can arrive later after processing.'], ['One run problem', 'One model run can jump around because of new data, model physics, or uncertainty.', 'Forecasters look for trends across runs and agreement across models.'], ['Better habits', 'Do not overreact to one dramatic snow map or hurricane track.', 'Compare ensembles, official forecasts, and forecast discussions for confidence.']],
  ['local-climate-zone-explained', 'Climate Data', 'Local Climate Zone Explained: Why Neighborhood Weather Can Differ', 'Why temperatures and wind can vary across neighborhoods, including urban heat, elevation, water, trees, pavement, and local exposure.', 'Local climate zones describe how land cover, buildings, vegetation, water, and terrain influence neighborhood-scale weather.', ['Urban and rural differences', 'Pavement and buildings store heat, while vegetation and open land cool differently.', 'That can make nighttime temperatures several degrees different across the same metro area.'], ['Terrain and water', 'Cold air drains into low spots, slopes change sun exposure, and lakes or oceans moderate temperatures.', 'A nearby station may not perfectly match your yard or street.'], ['Why it matters', 'Local climate affects frost, heat stress, energy use, air quality, and comfort.', 'Understanding microclimates helps explain why your forecast feels slightly off.']],
  ['home-rain-gauge-guide', 'Weather Instruments', 'Home Rain Gauge Guide: Placement, Reading, and Common Mistakes', 'How to place and read a home rain gauge, why siting matters, and what causes bad rainfall measurements.', 'A rain gauge needs open exposure, level placement, and distance from roofs, trees, fences, and splash sources to measure well.', ['Placement', 'Place the gauge in an open area away from obstacles that block rain or cause splash.', 'A roof edge or tree canopy can make totals much too high or too low.'], ['Reading', 'Read at the same time each day if tracking daily rainfall, and empty the gauge after reading.', 'For heavy rain, make sure the gauge capacity is high enough or check more often.'], ['Common errors', 'Wind, splash, poor leveling, evaporation, snow, and clogged funnels can affect accuracy.', 'Even imperfect gauges can be useful if you understand the limitations.']],
  ['home-anemometer-guide', 'Weather Instruments', 'Home Anemometer Guide: Measuring Wind Speed Without Fooling Yourself', 'How home wind sensors work, where to place them, and why roofs, trees, fences, and buildings can distort wind readings.', 'A home anemometer measures wind speed, but placement strongly affects whether the number represents open exposure or a sheltered microclimate.', ['Exposure', 'Official wind measurements are taken in open exposure. Home sensors near roofs, trees, and buildings often read turbulence or shelter effects.', 'That does not make them useless, but it changes what the data means.'], ['Gusts', 'Gust readings depend on sampling interval, sensor quality, and exposure.', 'A dramatic gust on a home station may not match the official airport gust nearby.'], ['Use cases', 'Home wind data can help with gardening, sailing, storms, and curiosity.', 'For warnings and records, use official observations.']],
  ['weather-app-radar-delay', 'Weather Apps', 'Weather App Radar Delay: Why Radar Images Are Not Truly Live', 'Why weather radar in apps can be delayed, how scan times and processing work, and why fast storms may be closer than they appear.', 'Most radar images are delayed by scanning, processing, transmission, and app display time. They are near-real-time, not perfectly live.', ['Why delay happens', 'Radar scans take time, then data must be processed and delivered to apps.', 'Some apps also smooth, composite, or cache imagery.'], ['Why it matters', 'Fast storms can move miles between the scan and what you see on screen.', 'This is especially important for tornado warnings, damaging wind, and lightning.'], ['Better use', 'Check timestamps, watch loops, and follow warnings rather than relying on the latest frame alone.', 'If a warning says shelter, shelter even if the radar image looks slightly offset.']]
];

const hubs = [
  ['weather-map-reading-guides', 'Weather Map Reading', 'Weather Map Reading Guides: Radar, Surface Maps, Station Models, and Upper-Air Charts', 'A hub for practical weather map reading guides, including radar loops, station models, surface analysis, upper-air maps, QPF, and forecast discussions.', ['/radar-loop-how-to-read/', '/weather-station-model-explained/', '/surface-analysis-map-explained/', '/upper-air-weather-map-explained/', '/qpf-weather-forecast-explained/', '/area-forecast-discussion-explained/', '/probability-of-precipitation-explained/', '/weather-model-run-timing/']],
  ['aviation-weather-guides', 'Aviation Weather', 'Aviation Weather Guides: METAR, TAF, Ceiling, Visibility, and Travel Weather', 'A hub for beginner-friendly aviation weather guides that also help travelers understand fog, low clouds, airport observations, and changing local conditions.', ['/metar-report-explained/', '/taf-forecast-explained/', '/cloud-ceiling-explained/', '/ceiling-vs-visibility-weather/', '/aviation-weather-explained/', '/aviation-weather-glossary/', '/dense-fog-advisory-explained/', '/weather-balloon-sounding-explained/']],
  ['weather-instrument-guides', 'Weather Instruments', 'Weather Instrument Guides: Rain Gauges, Anemometers, Home Stations, and Local Climate', 'A hub for home weather measurement and local climate context, including rain gauges, wind sensors, weather stations, normals, records, and app radar delays.', ['/home-rain-gauge-guide/', '/home-anemometer-guide/', '/home-weather-station-buying-guide/', '/weather-station-installation/', '/local-climate-zone-explained/', '/weather-normal-vs-record/', '/weather-app-radar-delay/', '/seasonal-outlook-explained/']]
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function labelFromPath(href) {
  return href.replace(/^\/|\/$/g, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function base({ slug, category, title, description, quick, body, related, isHub = false }) {
  const url = `${site}/${slug}/`;
  const relatedList = related.map((href) => `<li><a href="${href}">${escapeHtml(labelFromPath(href))}</a></li>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:card" content="summary" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="${isHub ? 'website' : 'article'}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:site_name" content="Tornado Hub" />
<link rel="canonical" href="${url}" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': isHub ? 'CollectionPage' : 'Article', headline: title, name: title, description, author: { '@type': 'Organization', name: 'Tornado Hub' }, publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site }, datePublished: today, dateModified: today, mainEntityOfPage: url })}</script>
<script type="application/ld+json" data-seo="page">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, isPartOf: { '@id': `${site}/#website` }, publisher: { '@id': `${site}/#organization` }, inLanguage: 'en' }, { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` }, { '@type': 'ListItem', position: 2, name: title, item: url }] }] })}</script>
<style>
:root { --bg:#fbfaf7; --bg-alt:#f4f1ea; --surface:#fff; --text:#14161c; --text-secondary:#4a5061; --text-muted:#8b8f9c; --border:#e5e1d8; --accent:#a02818; --link:#1e3a5f; --serif:"Fraunces",Georgia,serif; --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:var(--sans); background:var(--bg); color:var(--text); line-height:1.65; }
a { color:var(--link); text-decoration:none; }
a:hover { color:var(--accent); text-decoration:underline; }
.nav { background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
.nav-inner { max-width:1200px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
.nav-brand { font-family:var(--serif); font-weight:700; font-size:20px; color:var(--text); }
.nav-links { display:flex; gap:4px; flex-wrap:wrap; }
.nav-links a { color:var(--text-secondary); padding:8px 12px; font-size:14px; font-weight:500; border-radius:6px; }
.nav-links a:hover { background:var(--bg-alt); color:var(--text); text-decoration:none; }
.breadcrumb,.article { max-width:760px; margin:0 auto; padding-left:24px; padding-right:24px; }
.breadcrumb { padding-top:16px; font-size:13px; color:var(--text-muted); }
.article { padding-top:28px; padding-bottom:56px; }
.article-header { padding-bottom:30px; border-bottom:1px solid var(--border); margin-bottom:30px; }
.eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:12px; font-weight:700; margin-bottom:12px; }
h1 { font-family:var(--serif); font-size:clamp(30px,4vw,46px); line-height:1.12; margin-bottom:14px; }
.lede { font-size:19px; color:var(--text-secondary); }
h2 { font-family:var(--serif); font-size:26px; margin:42px 0 12px; }
p { font-size:17px; margin-bottom:16px; }
.quick-answer { background:var(--surface); border-left:4px solid var(--accent); padding:18px 20px; margin:26px 0; box-shadow:0 2px 10px rgba(0,0,0,.04); }
.inline-ad { text-align:center; margin:32px 0; min-height:90px; }
.related { margin-top:44px; padding-top:28px; border-top:1px solid var(--border); }
.related ul { list-style:none; margin-top:12px; }
.related li { margin-bottom:8px; }
.hub-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; margin:20px 0 6px; }
.hub-card { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.hub-card span { color:var(--text-muted); font-size:13px; }
.footer { background:#14161c; color:#94a3b8; padding:40px 24px; border-top:4px solid var(--accent); }
.footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:20px; font-size:13px; }
.footer a { color:white; }
@media (max-width:650px) { .nav-inner { align-items:flex-start; flex-direction:column; } .nav-links a { padding:6px 8px; font-size:13px; } }
</style>
</head>
<body>
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/weather-map-reading-guides/">Maps</a><a href="/aviation-weather-guides/">Aviation</a><a href="/weather-instrument-guides/">Instruments</a><a href="/simulator/">Simulator</a></div></div></nav>
<div class="breadcrumb"><a href="/">Home</a> - <a href="/articles/">Articles</a> - ${escapeHtml(title)}</div>
<article class="article"><header class="article-header"><div class="eyebrow">${escapeHtml(category)}</div><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></header>
<div class="quick-answer"><strong>Quick answer:</strong> ${escapeHtml(quick)}</div>
<div class="inline-ad"><script type="text/javascript">atOptions={'key':'1fe957d85bb2cf92027de309038cd17b','format':'iframe','height':250,'width':300,'params':{}};</script><script type="text/javascript" src="https://www.highperformanceformat.com/1fe957d85bb2cf92027de309038cd17b/invoke.js"></script></div>
${body}
<section class="related"><h2>Related Guides</h2><ul>${relatedList}</ul></section></article>
<footer class="footer"><div class="footer-inner"><span>Tornado Hub. Educational resource, not a live warning system.</span><span><a href="/">Home</a> - <a href="/articles/">Articles</a> - <a href="/safety/">Safety</a> - <a href="/simulator/">Simulator</a></span></div></footer>
<script src="/assets/article-tracker.js" defer></script><script src="/assets/ads-config.js" defer></script><script src="/assets/ads.js" defer></script><script src="/assets/house-ads.js" defer></script>
</body></html>`;
}

function renderArticle(page) {
  const [slug, category, title, description, quick, ...sections] = page;
  const body = sections.map(([heading, p1, p2]) => `<h2>${escapeHtml(heading)}</h2>\n<p>${escapeHtml(p1)}</p>\n<p>${escapeHtml(p2)}</p>`).join('\n');
  return base({ slug, category, title, description, quick, body, related: ['/weather-map-reading-guides/', '/aviation-weather-guides/', '/weather-instrument-guides/', '/forecasting-guides/'] });
}

function renderHub([slug, category, title, description, links]) {
  const cards = links.map((href) => `<a class="hub-card" href="${href}"><strong>${escapeHtml(labelFromPath(href))}</strong><span>Read the guide</span></a>`).join('\n');
  const body = `<h2>Start here</h2><p>This hub organizes practical weather reading and measurement guides so readers can move from symbols and products to useful decisions.</p><div class="hub-grid">${cards}</div><h2>Why this cluster helps</h2><p>Forecast products are easier to trust when readers understand what the numbers, maps, airport reports, and instruments are actually measuring.</p>`;
  return base({ slug, category, title, description, quick: description, body, related: links.slice(0, 4), isHub: true });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'work'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function textBetween(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function categoryFor(file, html) {
  const eyebrow = textBetween(html, /class=["'][^"']*(?:eyebrow|page-eyebrow|article-cat|section-eyebrow)[^"']*["'][^>]*>([^<]+)/i);
  if (eyebrow) return eyebrow;
  if (file.includes(`${path.sep}quiz${path.sep}`)) return 'Quiz';
  if (file.includes('simulator') || file.includes('game')) return 'Interactive';
  if (file.includes('safety') || file.includes('shelter')) return 'Safety';
  return 'Guide';
}

function rebuildContentIndexAndSitemap() {
  const files = [path.join(root, 'index.html'), ...walk(root).filter((file) => file !== path.join(root, 'index.html'))];
  const items = files.map((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const relDir = path.relative(root, path.dirname(file)).replace(/\\/g, '/');
    const pathName = relDir === '' ? '/' : `/${relDir}/`;
    const title = textBetween(html, /<title>([\s\S]*?)<\/title>/i) || textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || 'Tornado Hub';
    const description = textBetween(html, /<meta name=["']description["'] content=["']([\s\S]*?)["']\s*\/?>/i);
    return { title, path: pathName, description, category: categoryFor(file, html), keywords: `${title} ${description} ${relDir.replace(/-/g, ' ')}` };
  }).sort((a, b) => a.path.localeCompare(b.path));
  fs.writeFileSync(path.join(root, 'assets', 'content-index.js'), `window.TORNADO_CONTENT_INDEX = ${JSON.stringify(items, null, 2)};\n`);
  const urls = items.map((item) => `  <url>\n    <loc>${site}${item.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.path === '/' ? 'daily' : 'monthly'}</changefreq>\n    <priority>${item.path === '/' ? '1.0' : item.path.includes('guides') ? '0.8' : '0.7'}</priority>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  return items.length;
}

function updateArticlesIndex() {
  const file = path.join(root, 'articles', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const hubSection = `<section class="cat-section" data-generated="forecast-map-hubs">
  <h2 class="cat-heading">Map, aviation, and instrument hubs <span class="cat-count">${hubs.length} hubs</span></h2>
  <p class="cat-sub">Cluster pages for weather-map reading, aviation reports, and home weather measurement.</p>
  <div class="link-grid">
${hubs.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  const articleSection = `<section class="cat-section" data-generated="forecast-map-expansion">
  <h2 class="cat-heading">Forecast maps and weather data <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Practical explainers for forecast discussions, radar loops, QPF, PoP, station models, upper-air maps, METARs, TAFs, and home instruments.</p>
  <div class="link-grid">
${pages.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="forecast-map-hubs">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="forecast-map-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="weather-depth-hubs">/, hubSection + articleSection + '<section class="cat-section" data-generated="weather-depth-hubs">');
  fs.writeFileSync(file, html);
}

for (const page of pages) {
  const dir = path.join(root, page[0]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderArticle(page));
}

for (const hub of hubs) {
  const dir = path.join(root, hub[0]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderHub(hub));
}

updateArticlesIndex();
const total = rebuildContentIndexAndSitemap();
console.log(`Added ${pages.length} forecast/map articles, ${hubs.length} hubs, and rebuilt ${total} indexed URLs.`);

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  ['dew-point-vs-humidity', 'Weather Science', 'Dew Point vs Humidity: Which One Tells You How Sticky It Feels?', 'Dew point and relative humidity both describe moisture, but dew point is often better for understanding comfort, storms, fog, and oppressive summer air.', 'Dew point is the temperature air must cool to for saturation. Relative humidity is a percentage that changes with temperature. For how muggy it feels, dew point is usually the better number.', ['Dew point basics', 'A higher dew point means more moisture is actually present in the air. A 72 degree dew point feels much more oppressive than a 50 degree dew point because sweat evaporates less easily.', 'Relative humidity can look high on a cool morning even when the air does not feel tropical. That is why humidity percentages alone can mislead people.'], ['Why storm forecasters care', 'Moisture is one ingredient in thunderstorms. Higher dew points can help support instability when warm air rises, especially when wind shear and lift are also present.', 'Dew point does not create severe weather by itself, but it helps describe the fuel available to storms.'], ['Comfort and safety', 'Low dew points usually feel drier and more comfortable. High dew points make heat more stressful because sweat evaporates more slowly.', 'During heat waves, dew point and heat index together can show why the same air temperature feels much harder on the body.']],
  ['wet-bulb-temperature-explained', 'Heat', 'Wet-Bulb Temperature Explained: The Heat Metric That Matters for the Human Body', 'Learn what wet-bulb temperature means, why it combines heat and humidity, and why high wet-bulb values can become dangerous even in shade.', 'Wet-bulb temperature estimates how much the body can cool through evaporation. When wet-bulb values are very high, sweating stops working well and heat illness risk rises sharply.', ['What wet bulb means', 'Wet-bulb temperature is measured by cooling a thermometer with evaporation. It combines heat and moisture in a way that relates closely to human cooling.', 'The more humid the air is, the less evaporation can cool the thermometer or your body.'], ['Why it matters', 'A hot dry day can be dangerous, but shade and evaporation may help. A hot humid day can be more dangerous because the body has fewer ways to shed heat.', 'This is why overnight humidity and warm nights are so stressful during heat waves.'], ['Practical use', 'Most public forecasts use heat index, but wet-bulb temperature helps explain why humidity changes the risk.', 'If heat alerts are issued, reduce exertion, seek cooling, hydrate, and check on vulnerable people.']],
  ['uv-index-guide', 'Sun Safety', 'UV Index Guide: What the Numbers Mean for Sunburn and Skin Risk', 'A simple UV Index guide explaining low, moderate, high, very high, and extreme UV levels, plus clouds, shade, altitude, snow, water, and sunscreen timing.', 'The UV Index estimates how strong sunburn-producing ultraviolet radiation is at midday. Higher numbers mean skin and eyes can be damaged faster.', ['What the numbers mean', 'Low UV still deserves attention for long exposure. High, very high, and extreme UV can burn unprotected skin quickly, especially near midday.', 'Clouds can reduce UV, but thin or broken clouds do not make sun protection unnecessary.'], ['What changes UV', 'Season, time of day, latitude, altitude, ozone, clouds, reflection from water or snow, and shade all change exposure.', 'Mountain locations and beaches can surprise people because reflected light and thinner atmosphere increase risk.'], ['Better habits', 'Use shade, hats, sunglasses, protective clothing, and sunscreen. Reapply sunscreen after swimming, sweating, or towel drying.', 'Do not use temperature as a UV guide. Cool sunny days can still have strong UV.']],
  ['lake-effect-snow-explained', 'Winter Weather', 'Lake-Effect Snow Explained: Why Narrow Snow Bands Dump So Much Snow', 'How lake-effect snow forms, why bands can be intense and narrow, and why one town can get buried while another nearby town sees little snow.', 'Lake-effect snow forms when cold air crosses relatively warmer lake water, picking up heat and moisture before dropping snow downwind.', ['The setup', 'Cold air moving over warmer water becomes unstable. The lake adds moisture and heat from below, helping snow showers grow into bands.', 'Longer fetch across the lake gives air more time to gather moisture, which can make bands heavier.'], ['Why it is so local', 'Wind direction controls where the band goes. A small wind shift can move the heaviest snow from one community to another.', 'This is why forecasts often describe narrow corridors rather than a uniform snowfall map.'], ['Travel risk', 'Visibility and road conditions can change suddenly when driving into a lake-effect band.', 'If warnings are posted, expect sharp local gradients, whiteouts, drifting, and difficult plowing conditions.']],
  ['frost-watch-vs-freeze-warning', 'Agriculture Weather', 'Frost Watch vs Freeze Warning: What Gardeners and Growers Should Know', 'The difference between frost advisories, freeze watches, and freeze warnings, plus practical steps for plants, pipes, pets, and outdoor water.', 'A frost alert focuses on frost formation near the ground. A freeze warning means temperatures are expected to drop low enough to end or damage sensitive vegetation.', ['Frost vs freeze', 'Frost can form when surfaces cool below freezing even if the official air temperature is slightly above 32 degrees. Clear skies, calm wind, and dry air help surfaces cool quickly.', 'A freeze is a broader temperature hazard and can damage plants, outdoor plumbing, and sensitive systems.'], ['Why locations differ', 'Cold air drains into valleys and low spots. Urban areas, slopes, soil moisture, wind, and cloud cover all affect local temperature.', 'Your yard can be colder than the official reporting station.'], ['What to do', 'Cover sensitive plants, bring containers inside, disconnect hoses, protect exposed pipes, and bring pets indoors.', 'Remove covers after temperatures rise so plants do not overheat in sun.']],
  ['radar-reflectivity-explained', 'Radar', 'Radar Reflectivity Explained: What the Colors on Weather Radar Mean', 'Understand radar reflectivity colors, rain and hail intensity, bright banding, ground clutter, and why radar colors are not a perfect severe weather scale.', 'Reflectivity shows how much energy radar gets back from precipitation or objects in the air. Brighter colors often mean heavier precipitation, but context matters.', ['The color idea', 'Radar sends out energy and listens for the return signal. Bigger drops, more drops, hail, and wet snow can return more energy.', 'Apps colorize that return signal, but color tables differ between products.'], ['Common traps', 'Bright colors do not always mean damaging weather. Melting snow can create a bright band, and ground clutter can show returns where precipitation is not falling.', 'Hail can cause very high reflectivity, but radar velocity, dual-pol data, warnings, and storm environment matter too.'], ['How to use it', 'Use reflectivity to see precipitation shape and movement. For severe storms, pair it with velocity, warnings, and local reports.', 'Never use one radar frame alone for safety decisions.']],
  ['radar-velocity-explained', 'Radar', 'Radar Velocity Explained: Reading Wind on Doppler Radar', 'A plain-language guide to radar velocity, inbound and outbound winds, rotation, couplets, limitations, and why meteorologists use velocity during tornado warnings.', 'Velocity shows motion toward or away from the radar. Tight inbound and outbound winds near each other can indicate rotation, but radar interpretation depends on location and context.', ['Inbound and outbound', 'Doppler radar measures motion along the radar beam. One color often shows air moving toward the radar and another shows air moving away.', 'The exact colors depend on the app, but the concept is direction relative to the radar site.'], ['Rotation signatures', 'When strong inbound and outbound winds sit close together, meteorologists look for a velocity couplet. In the right storm environment, that can support a tornado warning.', 'Not every couplet is a tornado, and some tornadoes are hard to sample due to distance, terrain, or storm structure.'], ['Limitations', 'Radar beams rise with distance, so faraway storms are sampled higher above the ground. Velocity can also fold or appear confusing when winds exceed display limits.', 'Use official warnings and storm reports, not amateur radar interpretation alone.']],
  ['ensemble-forecast-explained', 'Forecasting', 'Ensemble Forecast Explained: Why Meteorologists Run Many Forecasts at Once', 'What ensemble forecasts are, why they show uncertainty, and how probabilities can be more useful than a single deterministic weather model run.', 'An ensemble forecast runs many related model versions to see a range of possible outcomes. The spread helps forecasters judge uncertainty.', ['Why ensembles exist', 'The atmosphere is sensitive to small starting differences. A single model run can look precise while still being wrong.', 'Ensembles test many plausible starting points or model variations to see how outcomes cluster or spread out.'], ['What spread means', 'A tight cluster often suggests higher confidence. A wide spread means the forecast details are more uncertain.', 'Spread can grow quickly for storm tracks, snowfall gradients, temperature changes, and hurricane paths.'], ['How to use it', 'Probabilities help planning. A 30 percent chance of heavy snow or flooding may matter a lot if the impact is high.', 'Use ensembles as context, not as a replacement for official forecasts.']],
  ['weather-models-gfs-vs-euro', 'Forecasting', 'GFS vs European Model: Why Weather Models Disagree', 'Why the GFS and European model can show different storm tracks, snow totals, hurricane paths, or temperatures, and how forecasters weigh model guidance.', 'Weather models differ because they use different physics, resolution, data assimilation, and update schedules. The best forecast is usually not just picking one favorite model.', ['Why they differ', 'Models divide the atmosphere into grids and approximate physical processes. Different assumptions can lead to different outcomes, especially several days out.', 'Small differences early can grow into big differences in storm track, precipitation type, or timing.'], ['The model war problem', 'Online posts often frame forecasts as one model versus another. That can be misleading because one run is only a snapshot.', 'Forecasters look at trends, ensembles, bias, observations, and consistency across guidance.'], ['Better reading habits', 'Ask whether multiple runs and multiple models support the same idea. Watch for uncertainty language in official forecasts.', 'For high-impact weather, prepare for reasonable scenarios rather than betting on the most convenient model.']],
  ['pressure-gradient-wind-explained', 'Weather Science', 'Pressure Gradient Explained: Why Tight Isobars Mean Stronger Wind', 'How pressure differences create wind, why tight isobars signal stronger winds, and how pressure gradients shape storms, fronts, and coastal gales.', 'Wind is driven by pressure differences. When pressure changes quickly over a short distance, the pressure gradient is stronger and winds often increase.', ['The basic force', 'Air moves in response to pressure differences, modified by Earth rotation, friction, terrain, and storm structure.', 'On weather maps, tightly packed isobars usually show a stronger pressure gradient.'], ['Where it matters', 'Strong gradients can form around deep low-pressure systems, strong high pressure, fronts, mountain gaps, and coastal storms.', 'This can produce damaging non-thunderstorm winds even without a severe thunderstorm warning.'], ['Forecast clues', 'Look for wind advisories, high wind warnings, marine warnings, and forecast gusts.', 'Loose outdoor items, trees, power lines, high-profile vehicles, and boats can all be affected.']],
  ['shelf-cloud-vs-wall-cloud', 'Storm Clouds', 'Shelf Cloud vs Wall Cloud: How to Tell the Difference', 'Shelf clouds and wall clouds are often confused. Learn where each forms, what they mean, and why one is linked more closely with tornado potential.', 'A shelf cloud usually forms along thunderstorm outflow at the leading edge of rain-cooled air. A wall cloud forms under the storm updraft and can be closer to tornado development.', ['Shelf clouds', 'Shelf clouds often look like a long horizontal wedge or arc along the front of a storm. They can arrive with gusty wind, heavy rain, and lightning.', 'They are dramatic, but they are usually tied to outflow rather than the rotating updraft.'], ['Wall clouds', 'A wall cloud is a lowered cloud base beneath the updraft region of a severe thunderstorm. Persistent rotation in a wall cloud can be an important warning sign.', 'Wall clouds are often found away from the leading gust front, closer to the inflow side of the storm.'], ['Safety', 'Do not stand outside trying to classify clouds during an active warning. If a storm is severe or tornado-warned, move to shelter.', 'Photos can wait until you are safe.']],
  ['mammatus-clouds-explained', 'Clouds', 'Mammatus Clouds Explained: What Those Pouch-Shaped Clouds Mean', 'Mammatus clouds look ominous, but what do they actually mean? Learn how they form and why they often appear near strong thunderstorms.', 'Mammatus are pouch-like cloud features that hang from a cloud base, often near anvils of strong thunderstorms. They look dramatic but are not tornado clouds by themselves.', ['What they look like', 'Mammatus clouds appear as rounded lobes or pouches on the underside of a cloud layer. They can glow at sunset and look especially dramatic after storms.', 'Their appearance often attracts attention because they seem unusual and textured.'], ['How they form', 'They are associated with sinking pockets of air and cloud material. The exact processes can vary, but they are often linked to thunderstorm anvils and turbulent environments.', 'They can occur near strong storms but are not proof that a tornado is happening.'], ['What to do', 'If mammatus appear after a storm has passed, the immediate threat may be lower, but check radar and warnings before assuming all danger is over.', 'Lightning can still be a hazard near storm anvils.']],
  ['heat-dome-explained', 'Heat', 'Heat Dome Explained: Why Some Heat Waves Get Stuck', 'What a heat dome is, why high pressure can trap hot air, and why long-duration heat waves are especially dangerous for people, pets, roads, and power grids.', 'A heat dome is a persistent high-pressure pattern that helps hot air build and linger. The danger grows when heat lasts for days and nights stay warm.', ['The pattern', 'High pressure can suppress clouds and storms, allowing sunshine to heat the ground day after day. Sinking air can also warm and dry as it descends.', 'When the pattern stalls, heat accumulates and relief is delayed.'], ['Why nights matter', 'Warm nights prevent bodies, buildings, and pavement from cooling. Health risk rises over multiple days, especially without reliable air conditioning.', 'Urban areas can stay hotter at night due to stored heat in roads and buildings.'], ['Impacts', 'Heat domes can strain power grids, buckle roads, worsen air quality, and increase heat illness.', 'Cooling centers, hydration, shade, and checking on vulnerable people become crucial.']],
  ['polar-vortex-explained', 'Winter Weather', 'Polar Vortex Explained: What It Is and What It Is Not', 'The polar vortex is often blamed for cold snaps. Learn what it actually is, how disruptions can affect winter weather, and why not every cold day is a polar vortex event.', 'The polar vortex is a large circulation of cold air high in the atmosphere near the poles. When disrupted, it can sometimes help send Arctic air farther south.', ['What it is', 'The polar vortex exists every winter. It is not a single storm and it does not literally visit your town.', 'Media shorthand can make the term sound more mysterious than it is.'], ['Disruptions', 'Changes in the upper atmosphere can weaken or displace the vortex. That can influence jet stream patterns and cold air outbreaks.', 'The chain of events is complex, and local cold still depends on surface weather patterns.'], ['Practical meaning', 'For everyday planning, watch local forecasts for wind chill, snow, ice, and cold alerts.', 'The phrase polar vortex is less important than the actual temperature, wind, duration, and exposure risk.']],
  ['bomb-cyclone-explained', 'Storm Systems', 'Bomb Cyclone Explained: Rapidly Strengthening Storms and Big Weather Impacts', 'What bomb cyclone means, why pressure can fall quickly, and how rapidly intensifying storms can create wind, snow, rain, coastal flooding, and travel disruptions.', 'A bomb cyclone is a low-pressure system that strengthens very rapidly. The term describes pressure fall, not a specific type of damage.', ['The definition idea', 'Meteorologists use bombogenesis for rapid pressure deepening over a set time. The exact threshold depends on latitude.', 'A storm can meet the definition over ocean or land, and impacts depend on track, moisture, cold air, and pressure gradient.'], ['Possible impacts', 'Rapidly strengthening storms can produce strong wind, heavy precipitation, coastal flooding, blizzard conditions, or severe thunderstorms depending on the setup.', 'The strongest impacts are often near tight pressure gradients and intense precipitation bands.'], ['Planning', 'Pay attention to wind alerts, coastal flood products, winter storm warnings, and travel guidance.', 'The label is less important than the hazards in your location.']],
  ['squall-line-explained', 'Thunderstorms', 'Squall Line Explained: Fast-Moving Thunderstorm Lines and Damaging Wind Risk', 'How squall lines form, why they can produce damaging straight-line winds, embedded tornadoes, hail, and sudden travel hazards.', 'A squall line is a line of thunderstorms, often along or ahead of a front. It can move quickly and produce widespread damaging winds.', ['How it forms', 'Squall lines often form when lift, instability, moisture, and wind shear align along a boundary.', 'Cold outflow from storms can help maintain the line as it pushes forward.'], ['Main hazards', 'Damaging straight-line winds are common, and embedded circulations can sometimes produce brief tornadoes.', 'Heavy rain, frequent lightning, hail, and rapid visibility drops can make travel dangerous.'], ['What to watch', 'Warnings may arrive county by county as the line advances. Do not wait for a tornado warning if a severe thunderstorm warning mentions destructive wind.', 'Move indoors, away from windows, and avoid driving through the line if possible.']]
];

const hubs = [
  ['hurricane-guides', 'Hurricane Guides', 'Hurricane Guides: Storm Surge, Forecasts, Evacuation, and Tropical Alerts', 'A hub for Tornado Hub hurricane and tropical cyclone guides, including storm surge, spaghetti models, evacuation zones, typhoons, and hurricane safety.', ['/storm-surge-explained/', '/hurricane-evacuation-zone-vs-flood-zone/', '/hurricane-spaghetti-models-explained/', '/tropical-storm-watch-vs-warning/', '/hurricane-season-preparedness/', '/hurricane-vs-typhoon-vs-cyclone/', '/super-typhoon-explained/', '/western-pacific-typhoon-season/']],
  ['forecasting-guides', 'Forecasting Guides', 'Weather Forecasting Guides: Models, Ensembles, Radar, and Uncertainty', 'A practical forecasting hub covering weather models, ensembles, radar basics, forecast uncertainty, and how to read weather guidance without overreacting to one model run.', ['/ensemble-forecast-explained/', '/weather-models-gfs-vs-euro/', '/forecast-uncertainty-explained/', '/hurricane-spaghetti-models-explained/', '/radar-reflectivity-explained/', '/radar-velocity-explained/', '/weather-fronts-explained/', '/barometric-pressure-weather-guide/']],
  ['weather-safety-guides', 'Weather Safety', 'Weather Safety Guides: Heat, Lightning, Flooding, Winter Storms, Hail, and Smoke', 'Safety-focused weather guides for fast decisions during heat waves, lightning, floods, winter storms, hail, smoke, rip currents, and severe thunderstorms.', ['/heat-index-danger-levels/', '/wet-bulb-temperature-explained/', '/lightning-at-home-safety/', '/flash-flood-watch-vs-warning/', '/winter-storm-watch-vs-warning/', '/blizzard-whiteout-driving-safety/', '/air-quality-smoke-weather-guide/', '/rip-current-weather-safety/']],
  ['weather-science-guides', 'Weather Science', 'Weather Science Guides: Dew Point, Pressure, Fronts, Clouds, and Storm Systems', 'Beginner-friendly weather science explainers about humidity, pressure, fronts, clouds, heat domes, polar vortex events, bomb cyclones, and squall lines.', ['/dew-point-vs-humidity/', '/barometric-pressure-weather-guide/', '/pressure-gradient-wind-explained/', '/weather-fronts-explained/', '/shelf-cloud-vs-wall-cloud/', '/mammatus-clouds-explained/', '/heat-dome-explained/', '/polar-vortex-explained/', '/bomb-cyclone-explained/', '/squall-line-explained/']]
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function titleFromPath(href) {
  return href.replace(/^\/|\/$/g, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function renderArticle([slug, category, title, description, quick, ...sections]) {
  const url = `${site}/${slug}/`;
  const sectionHtml = sections.map(([heading, p1, p2]) => `<h2>${escapeHtml(heading)}</h2>\n<p>${escapeHtml(p1)}</p>\n<p>${escapeHtml(p2)}</p>`).join('\n');
  const faq = [
    [`Is ${title.replace(/:.*/, '').toLowerCase()} important for everyday weather?`, 'Yes. It helps explain forecast impacts in plain language, especially when conditions are changing quickly.'],
    ['Should I use this instead of official warnings?', 'No. Use official watches, warnings, and local guidance for safety decisions. This guide is educational context.'],
    ['Where should I go next?', 'Use the related guides and article library to compare this topic with other weather hazards and forecasting tools.']
  ];
  return basePage({ slug, category, title, description, quick, url, body: sectionHtml, faq, related: ['/articles/', '/weather-safety-guides/', '/forecasting-guides/', '/weather-science-guides/'] });
}

function renderHub([slug, category, title, description, links]) {
  const url = `${site}/${slug}/`;
  const cards = links.map((href) => `<a class="hub-card" href="${href}"><strong>${escapeHtml(titleFromPath(href))}</strong><span>Read the guide</span></a>`).join('\n');
  const body = `<h2>Start here</h2><p>This hub groups related guides so readers can move from a broad weather question into specific safety, science, and forecasting topics.</p><div class="hub-grid">${cards}</div><h2>Why this cluster matters</h2><p>Search visitors often arrive with one narrow question. A hub page helps them find the next useful guide without hunting through the full article library.</p>`;
  return basePage({ slug, category, title, description, quick: description, url, body, faq: [], related: links.slice(0, 4), isHub: true });
}

function basePage({ slug, category, title, description, quick, url, body, faq, related, isHub = false }) {
  const faqSchema = faq.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) })}</script>` : '';
  const faqHtml = faq.length ? `<section class="faq"><h2>Frequently Asked Questions</h2>${faq.map(([q, a]) => `<h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p>`).join('')}</section>` : '';
  const relatedHtml = related.map((href) => `<li><a href="${href}">${escapeHtml(titleFromPath(href))}</a></li>`).join('');
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
${faqSchema}
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
.article { max-width:760px; margin:0 auto; padding:28px 24px 56px; }
.breadcrumb { max-width:760px; margin:0 auto; padding:16px 24px 0; font-size:13px; color:var(--text-muted); }
.article-header { padding-bottom:30px; border-bottom:1px solid var(--border); margin-bottom:30px; }
.eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:12px; font-weight:700; margin-bottom:12px; }
h1 { font-family:var(--serif); font-size:clamp(30px,4vw,46px); line-height:1.12; margin-bottom:14px; }
.lede { font-size:19px; color:var(--text-secondary); }
h2 { font-family:var(--serif); font-size:26px; margin:42px 0 12px; }
h3 { font-family:var(--serif); font-size:20px; margin:26px 0 8px; }
p { font-size:17px; margin-bottom:16px; }
.quick-answer { background:var(--surface); border-left:4px solid var(--accent); padding:18px 20px; margin:26px 0; box-shadow:0 2px 10px rgba(0,0,0,.04); }
.inline-ad { text-align:center; margin:32px 0; min-height:90px; }
.faq,.related { margin-top:44px; padding-top:28px; border-top:1px solid var(--border); }
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
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/hurricane-guides/">Hurricanes</a><a href="/forecasting-guides/">Forecasting</a><a href="/weather-safety-guides/">Safety</a><a href="/simulator/">Simulator</a></div></div></nav>
<div class="breadcrumb"><a href="/">Home</a> - <a href="/articles/">Articles</a> - ${escapeHtml(title)}</div>
<article class="article"><header class="article-header"><div class="eyebrow">${escapeHtml(category)}</div><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></header>
<div class="quick-answer"><strong>Quick answer:</strong> ${escapeHtml(quick)}</div>
<div class="inline-ad"><script type="text/javascript">atOptions={'key':'1fe957d85bb2cf92027de309038cd17b','format':'iframe','height':250,'width':300,'params':{}};</script><script type="text/javascript" src="https://www.highperformanceformat.com/1fe957d85bb2cf92027de309038cd17b/invoke.js"></script></div>
${body}
${faqHtml}
<section class="related"><h2>Related Guides</h2><ul>${relatedHtml}</ul></section></article>
<footer class="footer"><div class="footer-inner"><span>Tornado Hub. Educational resource, not a live warning system.</span><span><a href="/">Home</a> - <a href="/articles/">Articles</a> - <a href="/safety/">Safety</a> - <a href="/simulator/">Simulator</a></span></div></footer>
<script src="/assets/article-tracker.js" defer></script><script src="/assets/ads-config.js" defer></script><script src="/assets/ads.js" defer></script><script src="/assets/house-ads.js" defer></script>
</body></html>`;
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
  const hubSection = `<section class="cat-section" data-generated="seo-hubs">
  <h2 class="cat-heading">Weather topic hubs <span class="cat-count">${hubs.length} hubs</span></h2>
  <p class="cat-sub">Cluster pages that group related guides for hurricanes, forecasting, weather safety, and weather science.</p>
  <div class="link-grid">
${hubs.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  const articleSection = `<section class="cat-section" data-generated="weather-science-expansion">
  <h2 class="cat-heading">Forecasting and weather science <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Long-tail explainers for radar, models, humidity, heat, winter alerts, storm systems, clouds, wind, UV, and lake-effect snow.</p>
  <div class="link-grid">
${pages.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="seo-hubs">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="weather-science-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="weather-expansion">/, hubSection + articleSection + '<section class="cat-section" data-generated="weather-expansion">');
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
console.log(`Added ${pages.length} weather articles, ${hubs.length} hubs, and rebuilt ${total} indexed URLs.`);

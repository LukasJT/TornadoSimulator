import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  ['severe-thunderstorm-watch-vs-warning', 'Severe Storms', 'Severe Thunderstorm Watch vs Warning: What Each Alert Means', 'The difference between a severe thunderstorm watch and warning, what hazards to expect, and when damaging wind or hail deserves shelter-like action.', 'A severe thunderstorm watch means severe storms are possible. A severe thunderstorm warning means a storm is happening or expected soon in the warned area.', ['Watch means prepare', 'During a watch, storms have not necessarily reached you yet. Secure loose outdoor items, charge phones, and keep radar or alerts nearby.', 'If you have outdoor plans, decide where you will go if a warning is issued.'], ['Warning means act', 'A warning means severe wind, large hail, or other dangerous storm hazards are occurring or expected. Move indoors and away from windows.', 'Warnings can include language about destructive wind that should be treated very seriously, even without a tornado warning.'], ['Tornado overlap', 'Some severe thunderstorms can produce tornadoes quickly. Keep alerts on after the first warning because storms can cycle and new warnings can follow.']],
  ['excessive-rainfall-outlook-explained', 'Flooding', 'Excessive Rainfall Outlook Explained: Marginal, Slight, Moderate, and High Risk', 'How excessive rainfall outlooks describe flash flood potential, what the risk categories mean, and how to use them before heavy rain starts.', 'An excessive rainfall outlook highlights where rainfall may exceed what the ground, streams, drains, or terrain can handle. Higher risk categories mean greater flash flood concern.', ['What it forecasts', 'The outlook is about rainfall capable of producing flash flooding, not just total rain. Terrain, soil moisture, urban drainage, and storm speed all matter.', 'A lower category can still produce serious flooding in a vulnerable spot.'], ['Risk categories', 'Marginal and slight risks are common but still worth attention. Moderate and high risks are more serious signals that flooding may be more widespread or dangerous.', 'The category is a planning cue, not a guarantee of what will happen at one address.'], ['How to use it', 'If your area is highlighted, avoid low-water crossings, check drainage, and plan around routes that flood easily.', 'At night, take flash flood warnings especially seriously because water depth is harder to judge.']],
  ['convective-outlook-categories', 'Forecasting', 'SPC Convective Outlook Categories: Marginal to High Risk Explained', 'A guide to severe weather outlook categories, including marginal, slight, enhanced, moderate, and high risk, and what they mean for storm planning.', 'Convective outlook categories describe the organized severe thunderstorm risk for a region. They are not a promise of storms at your exact house, but they help set readiness level.', ['The category ladder', 'Marginal means isolated severe storms are possible. Slight and enhanced indicate more organized or numerous severe storms. Moderate and high are serious signals for higher-end events.', 'The exact threat may be hail, wind, tornadoes, or a combination.'], ['Read the hazards', 'The category alone is not enough. Look at whether tornado, wind, or hail probabilities are driving the outlook.', 'A day with modest tornado risk may need a different plan than a day driven mainly by hail.'], ['Planning use', 'Use outlooks early in the day or several days ahead to adjust plans, charge devices, and review shelter options.', 'Once storms form, warnings and local radar become more important than the broad outlook.']],
  ['red-flag-warning-explained', 'Fire Weather', 'Red Flag Warning Explained: Wind, Humidity, and Fast Fire Spread', 'What a red flag warning means, why wind and low humidity matter, and how to reduce wildfire risk during dangerous fire weather.', 'A red flag warning means critical fire weather conditions are occurring or expected. Fires can start more easily and spread faster.', ['The ingredients', 'Low humidity dries fuels, strong wind spreads flames, and warm temperatures can increase fire behavior. Dry lightning can also matter in some regions.', 'The exact criteria vary by local climate and fuels.'], ['What to avoid', 'Avoid outdoor burning, careless sparks, dragging chains, parking on dry grass, and activities that can start a fire.', 'Follow local burn bans and emergency instructions.'], ['Why weather changes fast', 'A front, wind shift, or thunderstorm outflow can change fire direction and speed quickly.', 'If smoke or fire is nearby, be ready for evacuation guidance and air quality impacts.']],
  ['fire-weather-watch-vs-red-flag-warning', 'Fire Weather', 'Fire Weather Watch vs Red Flag Warning: What Is the Difference?', 'The difference between a fire weather watch and red flag warning, plus what homeowners, campers, and outdoor workers should do.', 'A fire weather watch means critical fire weather may develop. A red flag warning means critical fire weather is expected or happening.', ['Watch timing', 'A watch gives advance notice. Use it to postpone risky outdoor burning, check local restrictions, and prepare for fast-changing conditions.', 'It is a heads-up for people who manage land, work outdoors, camp, or live near wildland areas.'], ['Warning timing', 'A warning is more urgent. Avoid spark-producing activities and follow local fire restrictions.', 'Wind and humidity can make small fires become dangerous quickly.'], ['Personal planning', 'Know evacuation routes, keep vehicles fueled if fire risk is high, and pay attention to local alerts.', 'Smoke can affect areas far from the flame front, especially when wind patterns shift.']],
  ['wind-advisory-vs-high-wind-warning', 'Wind', 'Wind Advisory vs High Wind Warning: Gusts, Damage, and Travel Risk', 'What wind advisories and high wind warnings mean, how gusts cause damage, and why high-profile vehicles, trees, and power lines are vulnerable.', 'A wind advisory means strong winds could cause inconvenience or minor damage. A high wind warning means damaging winds are expected or occurring.', ['Advisory conditions', 'Advisory-level wind can blow around trash cans, branches, signs, and outdoor furniture. Driving can be harder for high-profile vehicles.', 'Even without thunderstorms, gradient winds can create rough conditions.'], ['Warning conditions', 'High wind warnings are more serious. Trees, power lines, roofs, and travel can be affected.', 'Avoid unnecessary travel in exposed areas and secure outdoor objects before winds peak.'], ['Gusts vs sustained wind', 'Gusts are short bursts that often cause damage. Sustained wind describes a longer average.', 'Forecasts often mention both because impacts depend on each.']],
  ['dense-fog-advisory-explained', 'Travel Weather', 'Dense Fog Advisory Explained: Visibility, Driving, and Freezing Fog', 'What a dense fog advisory means, why fog can form quickly, and how to drive more safely when visibility drops.', 'A dense fog advisory means visibility is expected to be greatly reduced, often making driving more dangerous.', ['How fog forms', 'Fog forms when air near the ground becomes saturated. Clear nights, light wind, moist ground, snow cover, or nearby water can all help.', 'Fog can be patchy, which makes it especially dangerous on roads.'], ['Driving risk', 'Slow down, use low beams, leave extra space, and avoid sudden stops. High beams can reflect back and make visibility worse.', 'Visibility can drop rapidly near valleys, rivers, bridges, and low spots.'], ['Freezing fog', 'When fog droplets freeze on contact, roads, sidewalks, and elevated surfaces can become slick.', 'Treat freezing fog as both a visibility hazard and an icing hazard.']],
  ['coastal-flood-advisory-vs-warning', 'Coastal Weather', 'Coastal Flood Advisory vs Warning: Tides, Surge, and Shoreline Impacts', 'The difference between coastal flood advisories and warnings, why tides and wind matter, and how coastal flooding differs from storm surge.', 'Coastal flood products alert people to water levels that can affect roads, shorelines, property, and travel. A warning is more serious than an advisory.', ['What causes it', 'Coastal flooding can come from onshore wind, high tides, storm surge, large waves, and low pressure.', 'It does not always require a landfalling hurricane. Nor’easters and strong coastal lows can cause major flooding.'], ['Advisory vs warning', 'An advisory usually means minor flooding or travel issues are expected. A warning means more significant flooding is expected or occurring.', 'Local thresholds vary because shorelines and infrastructure differ.'], ['What to do', 'Avoid flooded coastal roads, move vehicles from low lots, and follow local closures.', 'Saltwater can damage vehicles and electrical systems even when water looks shallow.']],
  ['small-craft-advisory-explained', 'Marine Weather', 'Small Craft Advisory Explained: Wind, Waves, and Boating Decisions', 'What a small craft advisory means, why boat size and operator experience matter, and how wind and waves combine to create dangerous marine conditions.', 'A small craft advisory means wind, waves, or sea conditions may be hazardous for smaller boats or less experienced operators.', ['Small craft depends', 'There is no single universal boat size that defines small craft. Vessel design, operator experience, water temperature, and distance from safe harbor all matter.', 'Conditions that are manageable for one boat may be dangerous for another.'], ['Wind and waves', 'Wind speed, gusts, wave height, wave period, current, and fetch all shape the risk.', 'Short steep waves can be punishing even when wave heights do not sound extreme.'], ['Decision making', 'Check marine forecasts before leaving, carry required safety gear, and delay trips if conditions exceed your comfort or vessel capability.', 'Weather can deteriorate faster on open water than it appears from shore.']],
  ['gale-warning-explained', 'Marine Weather', 'Gale Warning Explained: When Marine Winds Become Dangerous', 'What a gale warning means for boaters, coastal areas, and rough seas, plus how gales differ from storm warnings and small craft advisories.', 'A gale warning means strong marine winds are expected or occurring. Conditions can become dangerous for many vessels and coastal activities.', ['What gale means', 'Gale warnings cover strong sustained winds or frequent gusts over marine areas. Exact thresholds depend on marine forecast definitions.', 'These winds can build steep seas and make navigation difficult.'], ['Why seas matter', 'Wave height is only part of the story. Wave period, direction, current, and fetch all affect how rough the water feels.', 'Gales can create hazardous inlet and harbor entrances.'], ['Safety choices', 'Check the full marine forecast, not just the headline. Consider postponing trips and securing boats before winds increase.', 'Coastal walkers should also watch for wave run-up and spray near rocks, piers, and seawalls.']],
  ['river-flood-warning-explained', 'Flooding', 'River Flood Warning Explained: Crest, Gauge, and Flood Stage', 'How river flood warnings work, what flood stage and crest mean, and why rivers can keep rising after rain ends.', 'A river flood warning means a river or stream is expected to exceed flood stage or is already flooding.', ['Flood stage', 'Flood stage is a gauge level where water begins to cause impacts in that area. It is not the same everywhere.', 'Minor, moderate, and major flood categories describe increasing impacts.'], ['Crest timing', 'A crest is the highest level expected during an event. Rivers can keep rising long after the heaviest rain stops because water drains downstream.', 'Forecast crests can change as new rain falls or upstream flows arrive.'], ['Safety', 'Do not drive through flooded roads near rivers. Water can hide washed-out pavement and strong current.', 'Respect closures and give levees, bridges, and flooded banks plenty of space.']],
  ['air-stagnation-advisory-explained', 'Air Quality', 'Air Stagnation Advisory Explained: Why Pollution Gets Trapped', 'What an air stagnation advisory means, how weather traps pollution, and why inversions can worsen smoke, haze, and winter air quality.', 'An air stagnation advisory means light winds and stable air may allow pollution, smoke, or haze to build near the surface.', ['The weather setup', 'High pressure, light winds, and inversions can limit vertical mixing. Pollutants then linger instead of dispersing.', 'Valleys are especially prone to trapped air during stable patterns.'], ['Health impacts', 'People with asthma, heart disease, lung disease, older adults, children, and outdoor workers may notice symptoms sooner.', 'Air quality can change during the day as mixing improves or weakens.'], ['What helps', 'Limit unnecessary burning, reduce vehicle idling, check AQI, and use cleaner indoor air when conditions are poor.', 'A front or stronger wind often helps clear stagnant air.']],
  ['visible-satellite-explained', 'Satellite', 'Visible Satellite Explained: Clouds, Shadows, Smoke, and Daylight Limits', 'How visible satellite imagery works, what it can reveal during daylight, and why it is useful for clouds, smoke, snow cover, and storm structure.', 'Visible satellite imagery is like a weather photo from space using reflected sunlight. It works best during the day and shows cloud texture, shadows, snow, and smoke.', ['What it shows', 'Visible imagery can reveal cloud shapes, thunderstorm towers, fog edges, snow cover, smoke plumes, and boundaries.', 'High-resolution loops are useful for seeing storms grow in real time.'], ['Daylight limits', 'Because visible imagery depends on sunlight, it is not useful at night in the same way infrared imagery is.', 'Low sun angle can create shadows that help show cloud height and texture.'], ['How to use it', 'Use visible satellite with radar and warnings. Satellite shows cloud development, while radar shows precipitation and some storm structure.', 'For smoke or dust, visible imagery can be especially helpful during daylight.']],
  ['infrared-satellite-explained', 'Satellite', 'Infrared Satellite Explained: Cloud-Top Temperatures and Nighttime Weather', 'How infrared satellite imagery works at night, why colder cloud tops matter, and how meteorologists use it for storms and tropical cyclones.', 'Infrared satellite senses temperature. Cold cloud tops often indicate tall clouds, which can be important for thunderstorms and tropical cyclones.', ['Temperature view', 'Infrared imagery does not need daylight. It estimates temperatures of cloud tops, land, and water surfaces.', 'Taller thunderstorm clouds are usually colder because they reach higher into the atmosphere.'], ['Storm clues', 'Very cold cloud tops can highlight strong convection, but they do not prove severe weather at the ground.', 'Meteorologists compare infrared trends with radar, lightning, model data, and observations.'], ['Tropical use', 'Infrared imagery is useful over oceans where radar coverage is limited.', 'Changes in cloud-top patterns can show bursts of convection near tropical cyclone centers.']],
  ['water-vapor-satellite-explained', 'Satellite', 'Water Vapor Satellite Explained: Dry Air, Jet Streams, and Storm Energy', 'What water vapor satellite imagery shows, why it is not a simple humidity map, and how it helps reveal storm systems and upper-level energy.', 'Water vapor satellite imagery highlights moisture and motion in parts of the atmosphere, especially higher levels. It helps show dry slots, jet stream features, and storm structure.', ['Not surface humidity', 'Water vapor imagery does not show how muggy it feels at the ground. It mainly samples moisture and temperature higher in the atmosphere.', 'That is why it can look dry aloft while the surface still feels humid.'], ['Storm patterns', 'Dry slots, upper-level lows, jet streaks, and atmospheric waves can stand out in water vapor loops.', 'Forecasters use these clues to understand lift, storm development, and changing weather patterns.'], ['Best use', 'Use it as a big-picture tool. It is excellent for seeing motion and structure, but local safety decisions still depend on watches, warnings, radar, and forecasts.', 'Loops are more useful than single images because motion reveals features.']],
  ['weather-balloon-sounding-explained', 'Forecasting', 'Weather Balloon Sounding Explained: Skew-T Charts Without the Headache', 'What weather balloon soundings measure, why they matter for storms and winter weather, and how Skew-T charts help meteorologists see the atmosphere vertically.', 'A weather balloon sounding measures temperature, moisture, wind, and pressure from the surface upward. It gives forecasters a vertical profile of the atmosphere.', ['What balloons measure', 'Weather balloons carry instruments that report conditions as they rise. The data shows layers of warm air, dry air, wind shear, and instability.', 'This vertical view is something surface observations alone cannot provide.'], ['Why it matters', 'Soundings help forecast thunderstorms, hail, tornado potential, fog, freezing rain, snow type, and wind profiles.', 'They also help initialize weather models.'], ['Skew-T basics', 'A Skew-T chart looks complicated, but it is mainly a vertical weather snapshot.', 'Forecasters use it to compare temperature, dew point, and wind through the atmosphere.']],
  ['cape-and-cin-explained', 'Severe Storms', 'CAPE and CIN Explained: Storm Fuel and Storm Cap', 'What CAPE and CIN mean in severe weather forecasting, why storm fuel needs a trigger, and why too much cap can stop storms from forming.', 'CAPE is a measure of storm potential energy. CIN is inhibition that can keep storms from rising. Severe storms often need fuel, lift, moisture, and wind shear together.', ['CAPE as fuel', 'Higher CAPE means rising air may accelerate more strongly if storms can form.', 'But CAPE alone does not guarantee storms. A sunny humid day can remain quiet if air cannot rise freely.'], ['CIN as the lid', 'CIN acts like a cap. A little cap can prevent messy early storms, while too much cap can stop storms completely.', 'Forecasters watch for fronts, drylines, terrain, or upper-level energy that can break the cap.'], ['Context matters', 'Wind shear, storm mode, moisture, and forcing determine whether storm fuel becomes severe weather.', 'This is why forecast discussions rarely rely on one number.']],
  ['wind-shear-explained', 'Severe Storms', 'Wind Shear Explained: Why Changing Wind With Height Shapes Severe Storms', 'How wind shear helps organize thunderstorms, supercells, squall lines, and tornado potential, plus why speed and direction changes both matter.', 'Wind shear is the change in wind speed or direction with height. It helps storms organize and can support rotating updrafts when other ingredients are present.', ['Speed and direction', 'Speed shear means wind gets stronger with height. Directional shear means wind turns with height.', 'Together they can help thunderstorms tilt and organize instead of collapsing quickly.'], ['Storm organization', 'Shear can support supercells, bowing lines, and long-lived storm clusters.', 'Without enough shear, storms may be brief pulse storms even with strong instability.'], ['Tornado context', 'Low-level shear can matter for tornado risk, but it must overlap with moisture, instability, lift, and storm structure.', 'Warnings depend on actual storms and observations, not shear alone.']],
  ['dryline-explained', 'Severe Storms', 'Dryline Explained: The Boundary Behind Many Plains Severe Storms', 'What a dryline is, why it separates dry and moist air, and how it can trigger severe thunderstorms in the Plains.', 'A dryline is a boundary between dry air and moist air. It can focus thunderstorm development when warm, humid air rises along the boundary.', ['Where it forms', 'Drylines are common in the southern and central Plains, often separating desert-influenced dry air from Gulf moisture.', 'They can sharpen during the day as heating mixes dry air eastward.'], ['Storm trigger', 'Air may converge and rise along the dryline. If the cap breaks, storms can develop quickly.', 'Not every dryline produces storms, but when ingredients align, storms can be intense.'], ['Forecast clues', 'Forecasters watch dew point gradients, wind shifts, heating, upper-level support, and the cap.', 'A dryline day can shift quickly from quiet to severe if storms initiate.']]
];

const hubs = [
  ['weather-alert-guides', 'Weather Alert Guides', 'Weather Alert Guides: Watches, Warnings, Advisories, and Outlooks', 'A hub for weather alert explainers covering severe thunderstorms, flooding, fire weather, wind, fog, marine alerts, and coastal hazards.', ['/severe-thunderstorm-watch-vs-warning/', '/excessive-rainfall-outlook-explained/', '/convective-outlook-categories/', '/red-flag-warning-explained/', '/wind-advisory-vs-high-wind-warning/', '/dense-fog-advisory-explained/', '/coastal-flood-advisory-vs-warning/', '/river-flood-warning-explained/']],
  ['satellite-weather-guides', 'Satellite Weather Guides', 'Satellite Weather Guides: Visible, Infrared, Water Vapor, Smoke, and Storms', 'A hub for satellite weather explainers, including visible imagery, infrared imagery, water vapor loops, smoke, clouds, and tropical cyclone monitoring.', ['/visible-satellite-explained/', '/infrared-satellite-explained/', '/water-vapor-satellite-explained/', '/weather-satellite-guide/', '/air-quality-smoke-weather-guide/', '/hurricane-spaghetti-models-explained/', '/super-typhoon-explained/', '/cloud-types-illustrated-guide/']],
  ['marine-coastal-weather-guides', 'Marine and Coastal Weather', 'Marine and Coastal Weather Guides: Rip Currents, Gales, Small Craft, Surge, and Coastal Flooding', 'A hub for marine and coastal weather safety, including rip currents, small craft advisories, gale warnings, storm surge, and coastal flooding.', ['/rip-current-weather-safety/', '/small-craft-advisory-explained/', '/gale-warning-explained/', '/storm-surge-explained/', '/coastal-flood-advisory-vs-warning/', '/marine-weather-explained/', '/marine-weather-glossary/', '/hurricane-season-preparedness/']]
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function labelFromPath(href) {
  return href.replace(/^\/|\/$/g, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function schemaJson(type, page, url) {
  return JSON.stringify({ '@context': 'https://schema.org', '@type': type, headline: page.title, name: page.title, description: page.description, author: { '@type': 'Organization', name: 'Tornado Hub' }, publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site }, datePublished: today, dateModified: today, mainEntityOfPage: url });
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
<script type="application/ld+json">${schemaJson(isHub ? 'CollectionPage' : 'Article', { title, description }, url)}</script>
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
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/weather-alert-guides/">Alerts</a><a href="/satellite-weather-guides/">Satellite</a><a href="/marine-coastal-weather-guides/">Marine</a><a href="/simulator/">Simulator</a></div></div></nav>
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
  return base({ slug, category, title, description, quick, body, related: ['/weather-alert-guides/', '/forecasting-guides/', '/weather-safety-guides/', '/articles/'] });
}

function renderHub([slug, category, title, description, links]) {
  const cards = links.map((href) => `<a class="hub-card" href="${href}"><strong>${escapeHtml(labelFromPath(href))}</strong><span>Read the guide</span></a>`).join('\n');
  const body = `<h2>Start here</h2><p>This hub groups related guides for faster navigation and stronger internal links across the weather library.</p><div class="hub-grid">${cards}</div><h2>How to use this hub</h2><p>Use the alert pages for action language, the satellite pages for visual interpretation, and the marine/coastal pages for water-related risk.</p>`;
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
  const hubSection = `<section class="cat-section" data-generated="alert-satellite-hubs">
  <h2 class="cat-heading">Alert, satellite, and marine hubs <span class="cat-count">${hubs.length} hubs</span></h2>
  <p class="cat-sub">Cluster pages for weather alerts, satellite interpretation, and marine/coastal hazards.</p>
  <div class="link-grid">
${hubs.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  const articleSection = `<section class="cat-section" data-generated="alert-satellite-expansion">
  <h2 class="cat-heading">Weather alerts and products <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Plain-language explainers for watches, warnings, outlooks, satellite loops, marine products, fire weather, and severe-storm ingredients.</p>
  <div class="link-grid">
${pages.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="alert-satellite-hubs">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="alert-satellite-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="seo-hubs">/, hubSection + articleSection + '<section class="cat-section" data-generated="seo-hubs">');
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
console.log(`Added ${pages.length} product articles, ${hubs.length} hubs, and rebuilt ${total} indexed URLs.`);

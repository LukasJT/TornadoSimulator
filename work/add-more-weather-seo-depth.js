import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  ['blocking-high-weather-pattern', 'Weather Patterns', 'Blocking High Weather Pattern Explained: Why Forecasts Get Stuck', 'What a blocking high is, why it can stall heat waves, cold snaps, drought, smoke, or repeated storm tracks, and how forecasters spot blocked patterns.', 'A blocking high is a stubborn high-pressure pattern that slows or redirects the normal west-to-east flow of weather systems.', ['Why blocking matters', 'When the atmosphere blocks, weather can repeat for days. One region may stay hot and dry while another stays cloudy, wet, or stormy.', 'Blocked patterns can increase drought, flooding, heat, smoke, or cold risk depending on where the high sets up.'], ['How it forms', 'Large waves in the jet stream can amplify and slow down. Once a ridge becomes established, storms may be forced around it.', 'Blocking patterns are one reason medium-range forecasts can change slowly even when daily details vary.'], ['What to watch', 'Look for forecasts that mention stagnant patterns, ridging, omega blocks, or persistent highs.', 'The impact depends on season: summer blocks can mean heat, while winter blocks can redirect cold air and storm tracks.']],
  ['temperature-inversion-explained', 'Weather Science', 'Temperature Inversion Explained: Why Air Gets Trapped Near the Ground', 'How temperature inversions form, why they trap fog, smoke, pollution, and cold air, and why valleys often feel the strongest effects.', 'A temperature inversion happens when warmer air sits above cooler air near the surface, limiting vertical mixing.', ['Normal vs inverted', 'Normally air tends to cool with height. In an inversion, that pattern flips for a layer, making the lower atmosphere more stable.', 'Stable air acts like a lid that keeps surface air from mixing upward.'], ['Common impacts', 'Inversions can trap fog, wildfire smoke, vehicle pollution, and cold air in valleys or urban basins.', 'They can also create freezing rain setups when warm air aloft melts snow and shallow cold air near the ground refreezes it on contact.'], ['When it breaks', 'Sun heating, stronger wind, a front, or storm system can mix the air and break the inversion.', 'Until then, air quality and visibility may stay poor.']],
  ['freezing-rain-vs-sleet', 'Winter Weather', 'Freezing Rain vs Sleet: Why One Coats Roads and One Bounces', 'The difference between freezing rain and sleet, how warm layers aloft create each type, and why freezing rain can be so destructive.', 'Freezing rain falls as liquid and freezes on contact. Sleet refreezes into ice pellets before reaching the ground.', ['The vertical setup', 'Both hazards often begin as snow high in the cloud. A warm layer aloft melts snowflakes into raindrops.', 'If the cold layer near the ground is shallow, drops stay liquid and freeze on surfaces as freezing rain. If the cold layer is deeper, drops refreeze into sleet.'], ['Why freezing rain is worse', 'Freezing rain can glaze roads, trees, power lines, and sidewalks. Even small amounts can cause major travel and power problems.', 'Sleet is hazardous too, but it usually bounces and accumulates more like tiny ice pellets.'], ['Forecast difficulty', 'A tiny temperature change a few hundred feet above the ground can change snow to sleet or freezing rain.', 'That is why winter precipitation type forecasts can shift close to the event.']],
  ['graupel-explained', 'Winter Weather', 'Graupel Explained: Soft Hail, Snow Pellets, and Convective Showers', 'What graupel is, how it differs from hail and sleet, and why it often appears in showery cold-season weather.', 'Graupel forms when supercooled droplets freeze onto snowflakes, creating soft pellets that can look like tiny hail.', ['How it forms', 'Snowflakes fall through supercooled cloud droplets. Those droplets freeze onto the flakes, rounding them into small soft pellets.', 'Graupel often forms in convective showers where rising motion and cold air are strong.'], ['Graupel vs sleet', 'Sleet is a refrozen raindrop. Graupel is a snowflake coated with frozen droplets.', 'Graupel usually crushes more easily than sleet and often looks white or opaque.'], ['Why it matters', 'Graupel can briefly whiten roads, reduce traction, and surprise drivers.', 'It can also signal unstable cold air that supports bursts of snow, gusty wind, or lightning in some setups.']],
  ['black-ice-weather-guide', 'Winter Weather', 'Black Ice Weather Guide: Why Roads Freeze When They Look Wet', 'How black ice forms, where it is most common, and why bridges, shaded roads, and early mornings are risky after winter precipitation.', 'Black ice is a thin, hard-to-see layer of ice on pavement. It often looks like a wet or slightly dark patch instead of obvious snow or slush.', ['How it forms', 'Black ice can form when melted snow refreezes, freezing drizzle coats roads, fog deposits ice, or wet pavement cools below freezing.', 'It is especially common when temperatures hover near 32 degrees and pavement cools faster than expected.'], ['Where to expect it', 'Bridges, overpasses, shaded curves, untreated side roads, and low spots often freeze first.', 'Road temperature can be colder than the air temperature shown on your phone.'], ['Driving response', 'Slow down before suspicious areas, avoid sudden braking, and leave extra distance.', 'If roads are glazing over, delaying travel is safer than trying to outdrive the ice.']],
  ['haboob-dust-storm-explained', 'Dust Storms', 'Haboob and Dust Storm Explained: Wind Walls, Visibility, and Driving Safety', 'What haboobs and dust storms are, how thunderstorm outflow can create a wall of dust, and what to do if visibility drops on the road.', 'A haboob is a dust wall often driven by thunderstorm outflow. It can reduce visibility to near zero in seconds.', ['How dust walls form', 'Thunderstorm downdrafts hit the ground and spread outward. In dry dusty areas, that outflow can lift a dense wall of dust.', 'Strong gradient winds can also create dust storms without nearby thunderstorms.'], ['Driving danger', 'The biggest hazard is sudden visibility loss. Drivers can enter a dust wall at highway speed and lose sight of lanes, vehicles, and road edges.', 'Pileups can happen when people stop in travel lanes or continue too fast.'], ['Safer choices', 'If possible, exit the road before the dust arrives. If caught, slow carefully, pull completely off the road when safe, turn off lights if parked away from traffic, and keep your foot off the brake.', 'Follow local transportation guidance for dust storm safety.']],
  ['downburst-explained', 'Severe Storms', 'Downburst Explained: Destructive Thunderstorm Wind Without a Tornado', 'What downbursts are, how microbursts and macrobursts differ, and why straight-line wind damage can be severe even when no tornado occurred.', 'A downburst is a powerful rush of air descending from a thunderstorm and spreading outward when it hits the ground.', ['The wind pattern', 'Air accelerates downward inside a storm, then spreads out horizontally at the surface.', 'That spreading wind can knock down trees, damage roofs, and create dangerous crosswinds.'], ['Microburst vs macroburst', 'A microburst is smaller in scale, while a macroburst covers a larger area. Both can be damaging.', 'Wet microbursts include heavy rain, while dry microbursts can occur with little rain reaching the ground.'], ['Tornado confusion', 'Downburst damage can look dramatic and may be mistaken for tornado damage.', 'Survey teams look at damage patterns to distinguish converging tornado winds from outward straight-line winds.']],
  ['bow-echo-radar-explained', 'Radar', 'Bow Echo Radar Explained: Why Curved Storm Lines Can Mean Damaging Wind', 'What a bow echo looks like on radar, why it forms, and why it can signal widespread damaging wind in a squall line or derecho setup.', 'A bow echo is a curved radar signature where part of a storm line surges forward, often because strong winds are pushing outward.', ['What it looks like', 'On radar, a bow echo can resemble an archer bow or bulging segment of a line.', 'The strongest wind threat is often near the bow apex and along embedded surges.'], ['Why it matters', 'Bow echoes can produce damaging straight-line winds and sometimes brief embedded tornadoes.', 'They may move quickly, leaving little time between warning and impact.'], ['Safety', 'If a severe thunderstorm warning mentions destructive wind or a bowing line, move indoors and away from windows.', 'Do not wait for a tornado warning to take wind seriously.']],
  ['nor-easter-explained', 'Winter Storms', "Nor'easter Explained: Coastal Storms, Wind, Snow, Rain, and Flooding", "What a nor'easter is, why it affects the East Coast, and how wind direction, ocean moisture, and storm track shape impacts.", "A nor'easter is a strong coastal storm named for the northeast winds it can bring to parts of the coast.", ['The coastal setup', "Nor'easters often strengthen near the East Coast where ocean moisture, temperature contrasts, and upper-level energy combine.", 'Depending on track and temperature, impacts can include heavy snow, rain, coastal flooding, beach erosion, and strong wind.'], ['Track matters', 'A small track shift can change snow to rain, move the heaviest band, or increase coastal flooding.', 'Warm ocean air can keep the immediate coast rainy while inland areas get snow.'], ['Preparation', 'Watch winter storm, high wind, coastal flood, and marine products together.', 'Impacts can last through multiple tide cycles if the storm slows down.']],
  ['drought-monitor-explained', 'Drought', 'Drought Monitor Explained: D0 to D4 Categories and What They Mean', 'How drought categories work, what D0 through D4 mean, and why drought is measured with more than just rainfall totals.', 'The Drought Monitor ranks drought from abnormally dry to exceptional drought using precipitation, soil moisture, streamflow, vegetation, impacts, and expert analysis.', ['The category scale', 'D0 means abnormally dry. D1 through D4 describe increasing drought severity, ending with exceptional drought.', 'The categories help communicate impacts, but local conditions can vary within a county or region.'], ['More than rain', 'Drought depends on rainfall deficits, heat, evaporation, soil moisture, snowpack, groundwater, streamflow, and demand.', 'A hot windy pattern can worsen drought even without record-low rainfall.'], ['Why it matters', 'Drought affects agriculture, water supply, wildfire risk, ecosystems, navigation, and outdoor restrictions.', 'Recovery can take much longer than one rainy week if deficits are deep.']],
  ['madden-julian-oscillation-explained', 'Climate Patterns', 'Madden-Julian Oscillation Explained: Tropical Waves That Influence Weather', 'What the MJO is, how it moves through the tropics, and why it can influence storms, rainfall, tropical cyclones, and winter patterns.', 'The Madden-Julian Oscillation is a moving pulse of tropical rainfall and thunderstorm activity that can influence weather patterns around the world.', ['What moves', 'The MJO is not a single storm. It is a broad area of enhanced and suppressed tropical convection that moves eastward over time.', 'Its phase and strength can affect where tropical rainfall is favored.'], ['Why forecasters care', 'The MJO can influence tropical cyclone development, monsoon rainfall, jet stream patterns, and sometimes winter storm setups.', 'Its effects vary by season and background climate pattern.'], ['How to use it', 'For everyday users, the MJO is background context rather than a direct forecast.', 'It helps explain why some multi-week weather patterns become more favorable for storms or quiet periods.']],
  ['arctic-oscillation-nao-explained', 'Climate Patterns', 'Arctic Oscillation and NAO Explained: Winter Pattern Clues', 'How the Arctic Oscillation and North Atlantic Oscillation relate to cold air outbreaks, storm tracks, blocking, and winter forecast uncertainty.', 'The AO and NAO describe large-scale pressure patterns that can influence where cold air and storm tracks set up, especially in winter.', ['The big idea', 'These oscillations are index-based descriptions of pressure patterns. They do not cause every storm, but they can tilt the odds toward certain setups.', 'Positive and negative phases can change jet stream behavior and blocking tendencies.'], ['Winter impacts', 'A negative NAO can support blocking near Greenland, sometimes favoring colder or stormier conditions downstream.', 'A negative AO can be associated with Arctic air spilling farther south, though local impacts vary.'], ['Forecast limits', 'Indices are tools, not magic switches. Snow and cold still depend on moisture, storm track, timing, and local temperatures.', 'Use them for pattern context rather than exact local forecasts.']],
  ['air-masses-explained', 'Weather Science', 'Air Masses Explained: Maritime, Continental, Tropical, and Polar Air', 'What air masses are, how they get their temperature and moisture traits, and why air mass boundaries create fronts and storms.', 'An air mass is a large body of air with broadly similar temperature and moisture characteristics.', ['Source regions', 'Air masses take on traits from where they spend time. Air over oceans becomes more maritime and moist, while air over land can be drier.', 'Tropical source regions are warmer, and polar or Arctic source regions are colder.'], ['Fronts form between them', 'When contrasting air masses meet, the boundary can become a front.', 'Fronts focus lift, wind shifts, clouds, precipitation, and sometimes severe weather.'], ['Why it matters', 'Air mass changes explain many day-to-day weather swings: humid to dry, warm to cold, cloudy to clear.', 'Forecasters track air masses to understand storm potential and temperature changes.']],
  ['frontogenesis-explained', 'Forecasting', 'Frontogenesis Explained: How Strengthening Fronts Create Bands of Weather', 'What frontogenesis means, why strengthening temperature gradients can create lift, and how it can focus snow bands, rain bands, or storms.', 'Frontogenesis means a front or temperature gradient is strengthening. That strengthening can force air to rise and create narrow precipitation bands.', ['The basic process', 'When warm and cold air become more sharply separated, the atmosphere responds with circulation around the boundary.', 'That circulation can produce lift, clouds, and precipitation.'], ['Snow bands', 'In winter storms, frontogenesis can focus heavy snow into narrow bands.', 'Small shifts in the band can create large snowfall differences over short distances.'], ['Thunderstorms', 'Frontogenesis can also help organize rain and thunderstorm bands when moisture and instability are present.', 'It is one reason radar can show sharp, persistent bands rather than uniform precipitation.']],
  ['upslope-snow-explained', 'Mountain Weather', 'Upslope Snow Explained: Why Wind Against Terrain Makes Snow Heavier', 'How upslope flow creates clouds and snow, why mountains and foothills can get enhanced precipitation, and why wind direction matters.', 'Upslope snow happens when wind pushes moist air up terrain, cooling it and helping clouds and snow form.', ['Terrain lift', 'Air forced uphill expands and cools. If enough moisture is present, clouds and precipitation can develop or intensify.', 'The favored slopes depend on wind direction.'], ['Local gradients', 'One side of a mountain range can get heavy snow while nearby areas get much less.', 'Foothills can also see enhanced snowfall when low-level flow is aimed into terrain.'], ['Forecasting challenge', 'Small wind direction or moisture changes can shift the heaviest snow.', 'Mountain travel forecasts should be checked closely because conditions change with elevation.']],
  ['rain-shadow-explained', 'Climate and Terrain', 'Rain Shadow Explained: Why One Side of a Mountain Is Wetter', 'How mountains create rain shadows, why air dries after crossing terrain, and how rain shadows shape deserts, forests, and local climates.', 'A rain shadow forms when mountains wring moisture out of air on the windward side, leaving drier air on the leeward side.', ['Windward side', 'Moist air rises up the mountain, cools, and can produce clouds and precipitation.', 'This often makes the windward side wetter and greener.'], ['Leeward side', 'After crossing the crest, air descends, warms, and dries.', 'That can create drier valleys, deserts, or sharp climate contrasts over short distances.'], ['Weather impacts', 'Rain shadows influence storm totals, snowpack, agriculture, water supply, and fire risk.', 'They are a reminder that terrain can dominate local weather.']],
  ['sea-breeze-thunderstorms', 'Local Weather', 'Sea Breeze Thunderstorms Explained: Coastline Boundaries and Afternoon Storms', 'How sea breezes form, why they can trigger thunderstorms, and why coastal weather can change quickly during warm seasons.', 'A sea breeze forms when cooler marine air moves inland to replace rising warm air over land. The boundary can help trigger showers or thunderstorms.', ['Daily cycle', 'Land heats faster than water during the day. Warm air rises over land, and cooler air from the water moves inland.', 'This creates a wind shift and a small-scale boundary.'], ['Storm trigger', 'Air converges and rises along the sea breeze front. If moisture and instability are present, storms can form.', 'Sea breeze collisions with other boundaries can make storms stronger or more focused.'], ['Coastal planning', 'A sunny beach morning can turn into an afternoon thunderstorm nearby.', 'Watch radar and lightning alerts, especially in warm humid weather.']],
  ['virga-explained', 'Weather Science', 'Virga Explained: Rain or Snow That Evaporates Before Reaching the Ground', 'What virga is, why precipitation can fall from clouds but disappear, and how evaporating rain can create gusty winds.', 'Virga is precipitation that falls from a cloud but evaporates or sublimates before reaching the ground.', ['Why it happens', 'If the air below the cloud is dry, falling rain or snow can evaporate before it reaches the surface.', 'You may see streaks beneath clouds that fade out before touching the ground.'], ['Wind connection', 'Evaporation cools air, making it denser. That cooled air can sink and spread out as gusty wind.', 'In dry climates, virga can be linked with dry microbursts.'], ['Forecast clues', 'Virga shows that moisture exists aloft but the lower atmosphere is dry.', 'If the low levels moisten over time, precipitation may eventually reach the ground.']],
  ['freezing-fog-vs-frost', 'Winter Weather', 'Freezing Fog vs Frost: Icy Deposits, Visibility, and Slick Surfaces', 'How freezing fog differs from frost, why each forms, and when roads, bridges, trees, and sidewalks can become icy.', 'Freezing fog is made of tiny droplets that freeze on contact. Frost forms when water vapor deposits as ice on cold surfaces.', ['Freezing fog', 'Freezing fog reduces visibility and can coat roads, trees, signs, and power lines with ice.', 'It can create slick spots even when no rain or snow is falling.'], ['Frost', 'Frost forms on surfaces that cool below freezing and collect ice crystals from water vapor.', 'It is common on clear calm nights when surfaces lose heat quickly.'], ['Travel and plants', 'Freezing fog is more of a travel hazard, while frost is often a plant and surface-temperature concern.', 'Both can surprise people because the sky may look quiet.']],
  ['ceiling-vs-visibility-weather', 'Aviation Weather', 'Ceiling vs Visibility: What Low Clouds and Fog Mean for Travel Weather', 'The difference between cloud ceiling and visibility, why aviation forecasts use both, and how low clouds, fog, rain, snow, and smoke affect travel.', 'Ceiling describes the height of the lowest significant cloud layer. Visibility describes how far you can see horizontally.', ['Ceiling', 'A low ceiling means clouds are close to the ground. It matters for aviation because pilots need safe clearance and approach conditions.', 'Low ceilings can also make mountains, towers, and terrain harder to see.'], ['Visibility', 'Visibility can drop because of fog, heavy rain, snow, dust, smoke, or haze.', 'You can have good ceiling but poor visibility, or low ceiling with decent visibility near the ground.'], ['Why it matters', 'Airports, highways, marine routes, and outdoor plans all respond differently to ceiling and visibility.', 'Weather reports use both because they describe different parts of the travel picture.']]
];

const hubs = [
  ['winter-precipitation-guides', 'Winter Precipitation', 'Winter Precipitation Guides: Sleet, Freezing Rain, Graupel, Black Ice, and Fog', 'A hub for winter precipitation explainers covering freezing rain, sleet, graupel, black ice, freezing fog, lake-effect snow, and winter alerts.', ['/freezing-rain-vs-sleet/', '/graupel-explained/', '/black-ice-weather-guide/', '/freezing-fog-vs-frost/', '/lake-effect-snow-explained/', '/winter-storm-watch-vs-warning/', '/blizzard-whiteout-driving-safety/', '/snowfall-forecast-explained/']],
  ['storm-structure-guides', 'Storm Structure', 'Storm Structure Guides: Downbursts, Bow Echoes, Drylines, CAPE, and Wind Shear', 'A hub for storm structure and severe weather ingredients, including downbursts, bow echoes, drylines, CAPE, wind shear, shelf clouds, and radar signatures.', ['/downburst-explained/', '/bow-echo-radar-explained/', '/dryline-explained/', '/cape-and-cin-explained/', '/wind-shear-explained/', '/shelf-cloud-vs-wall-cloud/', '/radar-reflectivity-explained/', '/radar-velocity-explained/']],
  ['climate-pattern-guides', 'Climate Patterns', 'Climate Pattern Guides: Blocking Highs, MJO, AO, NAO, Drought, and Air Masses', 'A hub for large-scale weather and climate pattern explainers, including blocking highs, drought, MJO, AO, NAO, air masses, rain shadows, and terrain effects.', ['/blocking-high-weather-pattern/', '/drought-monitor-explained/', '/madden-julian-oscillation-explained/', '/arctic-oscillation-nao-explained/', '/air-masses-explained/', '/rain-shadow-explained/', '/upslope-snow-explained/', '/temperature-inversion-explained/']]
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
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/winter-precipitation-guides/">Winter</a><a href="/storm-structure-guides/">Storm Structure</a><a href="/climate-pattern-guides/">Patterns</a><a href="/simulator/">Simulator</a></div></div></nav>
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
  return base({ slug, category, title, description, quick, body, related: ['/winter-precipitation-guides/', '/storm-structure-guides/', '/climate-pattern-guides/', '/weather-science-guides/'] });
}

function renderHub([slug, category, title, description, links]) {
  const cards = links.map((href) => `<a class="hub-card" href="${href}"><strong>${escapeHtml(labelFromPath(href))}</strong><span>Read the guide</span></a>`).join('\n');
  const body = `<h2>Start here</h2><p>This hub groups closely related weather guides so readers can move from a broad pattern to the specific hazard or science question they searched for.</p><div class="hub-grid">${cards}</div><h2>Why this cluster helps</h2><p>Weather topics are connected. A winter precip question can lead to black ice, freezing fog, and road safety; a storm-structure question can lead to radar, wind shear, and tornado risk.</p>`;
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
  const hubSection = `<section class="cat-section" data-generated="weather-depth-hubs">
  <h2 class="cat-heading">Winter, storm, and pattern hubs <span class="cat-count">${hubs.length} hubs</span></h2>
  <p class="cat-sub">Cluster pages for winter precipitation, storm structure, and large-scale weather patterns.</p>
  <div class="link-grid">
${hubs.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  const articleSection = `<section class="cat-section" data-generated="weather-depth-expansion">
  <h2 class="cat-heading">Weather science depth guides <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Long-tail explainers for winter precipitation, storm structure, terrain weather, visibility, drought, climate patterns, and local boundaries.</p>
  <div class="link-grid">
${pages.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="weather-depth-hubs">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="weather-depth-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="alert-satellite-hubs">/, hubSection + articleSection + '<section class="cat-section" data-generated="alert-satellite-hubs">');
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
console.log(`Added ${pages.length} depth articles, ${hubs.length} hubs, and rebuilt ${total} indexed URLs.`);

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  ['weather-commute-safety-guide', 'Travel Weather', 'Weather Commute Safety Guide: Rain, Fog, Wind, Ice, and Severe Storms', 'How commuters can adjust for heavy rain, dense fog, high wind, black ice, hail, lightning, and severe thunderstorm warnings.', 'A safer weather commute starts before you leave: check alerts, radar timing, road conditions, and whether delaying the trip is smarter than driving into the hazard.', ['Before leaving', 'Check watches, warnings, radar loops, traffic cameras, and road reports. A five-minute delay can matter if a squall line, snow band, or flash flood warning is crossing your route.', 'Charge your phone, keep fuel or battery range comfortable, and know a backup route that avoids low-water crossings.'], ['Hazard by hazard', 'Fog requires slower speeds and low beams. Heavy rain needs more following distance. Wind matters most for bridges, open roads, and high-profile vehicles.', 'Ice and snow require the biggest speed adjustment. If roads are glazing over, staying put is often the safest decision.'], ['When to stop', 'Do not drive through floodwater, hail cores, dust walls, or warned tornado paths.', 'If visibility collapses, exit the roadway safely rather than stopping in a travel lane.']],
  ['school-weather-closure-factors', 'School Weather', 'School Weather Closure Factors: Snow, Heat, Wind, Flooding, and Severe Storms', 'Why schools close, delay, or dismiss early for weather, including buses, sidewalks, wind chill, heat, flooding, power outages, and warning timing.', 'School weather decisions are about more than the forecast icon. Transportation, timing, building safety, sidewalks, power, and student supervision all matter.', ['Transportation risk', 'Buses are central to school weather decisions. Road ice, low visibility, flooding, high wind, and severe storm timing can make routes unsafe even if the school building is fine.', 'Rural routes, bridges, hills, and untreated roads can drive decisions.'], ['Building and staffing', 'Power outages, heating or cooling problems, damaged roofs, and staff travel can all affect whether school can operate safely.', 'Heat can be just as important as winter weather if buildings lack reliable cooling.'], ['Timing matters', 'A storm during dismissal can be more dangerous than one overnight because buses and parents may be on the road.', 'Early dismissal has to happen early enough to avoid sending students into the worst conditions.']],
  ['sports-lightning-delay-guide', 'Sports Weather', 'Sports Lightning Delay Guide: When Games Should Stop and Restart', 'A practical lightning safety guide for coaches, parents, referees, and outdoor sports organizers, including delay timing and shelter choices.', 'If thunder is heard or lightning is seen, outdoor sports should stop and people should move to a substantial building or hard-topped vehicle.', ['Stop early', 'Do not wait for rain. Lightning can strike before a storm arrives or after rain ends.', 'Fields, bleachers, dugouts, open shelters, and isolated trees are poor lightning shelters.'], ['Where to go', 'A substantial building with wiring and plumbing is best. A hard-topped vehicle is a backup.', 'Small open-sided pavilions, tents, and metal bleachers do not provide reliable protection.'], ['Restart timing', 'A common rule is to wait at least 30 minutes after the last thunder or lightning before resuming.', 'Each new thunder resets the clock.']],
  ['camping-thunderstorm-safety', 'Outdoor Weather', 'Camping Thunderstorm Safety: Tents, Trees, Flooding, Wind, and Lightning', 'How to plan for thunderstorms while camping, including campsite selection, lightning shelter, flash flooding, wind, trees, and weather radios.', 'A tent is not a safe thunderstorm shelter. Campers should know nearby sturdy shelters, avoid flood-prone sites, and have a weather alert source that works without cell service.', ['Before setup', 'Avoid dry washes, creek beds, low spots, dead trees, and exposed ridges. Look for safer shelter options before dark.', 'Check forecasts and alerts before entering remote areas. Cell service may disappear when you need it most.'], ['Lightning and wind', 'During lightning, a vehicle or substantial building is safer than a tent. Strong wind can drop limbs or collapse poorly secured shelters.', 'Do not shelter under isolated trees or near metal fences.'], ['Flooding', 'Heavy rain upstream can flood a campsite even if it is not raining directly overhead.', 'Move to higher ground early when flash flood warnings or rising water appear.']],
  ['boating-thunderstorm-safety', 'Marine Weather', 'Boating Thunderstorm Safety: Lightning, Gust Fronts, Waves, and Safe Harbor', 'How boaters can manage thunderstorm risk, including radar timing, gust fronts, lightning, visibility, and when to return to safe harbor.', 'Boaters should treat thunderstorms as a serious wind, lightning, visibility, and wave hazard. Return to safe harbor before the storm reaches the water.', ['Watch the sky and radar', 'Thunderstorms can produce gust fronts that arrive before heavy rain. Wind shifts and sudden waves can surprise small boats.', 'Radar delays matter. A storm may be closer than it appears in an app.'], ['Lightning risk', 'Open water exposes people and vessels to lightning. Lowering fishing rods or avoiding metal does not make a boat safe.', 'The best lightning strategy is not being on the water when storms are nearby.'], ['Safe harbor timing', 'Return early. Marinas, ramps, and channels can become chaotic when everyone waits until the last minute.', 'Wear life jackets and monitor marine alerts.']],
  ['outdoor-wedding-weather-plan', 'Event Weather', 'Outdoor Wedding Weather Plan: Rain, Heat, Wind, Lightning, and Backup Decisions', 'A weather planning guide for outdoor weddings and private events, including tents, lightning, heat, wind, rain timing, and guest communication.', 'An outdoor wedding weather plan needs a real indoor or hardened backup, not just umbrellas or a tent.', ['Backup location', 'Tents help with light rain and sun, but they are not safe for lightning, severe wind, or tornado warnings.', 'Choose a backup location with enough capacity before event day.'], ['Decision times', 'Set decision deadlines for moving the ceremony, changing photo timing, or delaying setup.', 'Vendors need time to secure equipment, and guests need clear instructions.'], ['Guest safety', 'Plan shade, water, cooling, accessible shelter, and lightning procedures.', 'A beautiful sky can still be dangerous if thunder is close.']],
  ['weather-power-outage-kit', 'Preparedness', 'Weather Power Outage Kit: What to Keep Ready Before Storms', 'A practical power outage kit for thunderstorms, hurricanes, ice storms, wind storms, heat waves, and winter storms.', 'A weather power outage kit should cover light, communication, water, food, medicine, temperature safety, and safe charging.', ['Core supplies', 'Keep flashlights, batteries, battery banks, a weather radio, water, shelf-stable food, first aid, and needed medication ready.', 'Do not rely on candles as a primary light source during storm damage.'], ['Temperature safety', 'Outages during heat or cold can become health emergencies. Know cooling centers, warming centers, and neighbor check-in plans.', 'People with medical equipment need backup power planning before storms.'], ['Food and water', 'Keep refrigerator and freezer doors closed as much as possible.', 'After long outages, follow food safety guidance rather than guessing.']],
  ['generator-safety-weather-outage', 'Power Outages', 'Generator Safety During Weather Outages: Carbon Monoxide, Placement, and Cords', 'How to use generators more safely during storm outages, including carbon monoxide risk, outdoor placement, extension cords, fuel, and backfeed hazards.', 'Generators must run outside, far from doors, windows, vents, garages, and attached spaces. Carbon monoxide can kill quickly.', ['Carbon monoxide', 'Never run a generator indoors, in a garage, on a porch, or near openings. CO has no smell and can build up fast.', 'Use battery-powered CO alarms on every level of the home.'], ['Electrical safety', 'Use properly rated outdoor cords and keep connections dry.', 'Do not backfeed a home through an outlet. Use a transfer switch installed correctly if powering circuits.'], ['Fuel and weather', 'Store fuel safely, let equipment cool before refueling, and protect the generator from rain without enclosing it.', 'Read the manufacturer instructions before an emergency.']],
  ['basement-flooding-rainstorm-guide', 'Flooding', 'Basement Flooding During Rainstorms: Sump Pumps, Gutters, Drains, and Safety', 'Why basements flood during heavy rain, what to check before storms, and how to stay safer around water, electricity, mold, and cleanup.', 'Basement flooding often comes from poor drainage, overwhelmed sump pumps, clogged gutters, sewer backup, or water entering foundation cracks.', ['Before heavy rain', 'Clean gutters, extend downspouts, test sump pumps, check backup power, and move valuables off the floor.', 'Know whether your floor drain, sewer backup valve, or sump system needs maintenance.'], ['During flooding', 'Avoid entering water if electricity may be involved. Do not touch electrical panels while standing in water.', 'If water is rising rapidly, prioritize safety over possessions.'], ['Afterward', 'Document damage, remove wet materials safely, ventilate when appropriate, and watch for mold.', 'Use protective gear and consider professional help for sewage or deep water.']],
  ['hail-car-protection-guide', 'Hail', 'Hail Car Protection Guide: What to Do Before, During, and After Hail', 'How to protect a vehicle from hail, what to avoid during a hailstorm, and how to document dents, cracked glass, and insurance evidence.', 'The best hail protection is getting the vehicle under sturdy cover before the storm arrives. Once hail is falling, personal safety comes first.', ['Before hail', 'Use a garage, carport, parking garage, or sturdy covered area if severe hail is forecast.', 'Blankets or covers may reduce minor damage but are not reliable for large hail.'], ['During hail', 'Do not run outside to move the car while hail or lightning is ongoing.', 'If driving, avoid stopping under overpasses in travel lanes. Find a safe legal place away from traffic if possible.'], ['After hail', 'Photograph damage from multiple angles and include close-ups. Check glass, mirrors, lights, roof, hood, and trunk.', 'Keep repair receipts and follow insurance instructions.']],
  ['roof-leak-after-storm-guide', 'Storm Damage', 'Roof Leak After Storm: What to Check Safely and What to Document', 'What to do after a roof leak from wind, hail, heavy rain, or debris, including safe inspection, photos, temporary protection, and warning signs.', 'After a storm roof leak, protect people first, avoid climbing on a damaged roof, document everything, and use safe temporary measures only if conditions allow.', ['Safety first', 'Do not climb onto a wet, steep, or damaged roof. Watch for sagging ceilings, electrical hazards, and falling debris.', 'If water is near fixtures or outlets, avoid contact and consider shutting power to affected areas if safe.'], ['Documentation', 'Take photos of interior water, ceiling stains, damaged belongings, exterior debris, and any visible roof damage from the ground.', 'Save receipts for emergency tarping or cleanup.'], ['Temporary steps', 'Place buckets, move belongings, and reduce interior damage where safe.', 'Use qualified help for roof access, structural concerns, or electrical risk.']],
  ['tree-damage-windstorm-guide', 'Storm Damage', 'Tree Damage After Windstorm: Limbs, Power Lines, Roofs, and Cleanup Safety', 'How to handle tree damage after high wind, severe thunderstorms, ice storms, or tropical systems, including power lines and cleanup hazards.', 'Tree damage cleanup is dangerous when power lines, hanging limbs, unstable trunks, or roof damage are involved. Keep distance and call qualified help when needed.', ['Power lines', 'Assume downed lines are energized. Keep people and pets away and report them.', 'Branches touching lines can also be dangerous. Do not try to move them.'], ['Hanging limbs', 'Broken limbs stuck overhead can fall without warning.', 'Avoid parking, walking, or working beneath damaged branches.'], ['Cleanup choices', 'Small debris may be safe to move with gloves and eye protection. Large limbs, chainsaw work, and roof impacts need more caution.', 'Document damage before major cleanup if insurance may be involved.']],
  ['pet-heat-wave-safety', 'Pet Weather', 'Pet Heat Wave Safety: Dogs, Cats, Pavement, Cars, and Cooling', 'How to protect pets during heat waves, including pavement burns, parked cars, shade, hydration, breed risk, and warning signs.', 'Pets can overheat quickly during heat waves, especially in cars, on hot pavement, or without shade and water.', ['Cars and pavement', 'Never leave pets in parked vehicles during warm weather. Interior temperatures rise fast.', 'Pavement can burn paws even when air temperature feels manageable.'], ['Higher-risk pets', 'Flat-faced breeds, older pets, overweight pets, very young animals, and pets with heart or breathing issues are more vulnerable.', 'Outdoor pets need shade, water, and cooling access.'], ['Warning signs', 'Heavy panting, weakness, drooling, confusion, vomiting, or collapse can signal heat stress.', 'Move the pet to cooling and contact a veterinarian for concerning symptoms.']],
  ['pet-winter-weather-safety', 'Pet Weather', 'Pet Winter Weather Safety: Cold, Ice, Paws, Antifreeze, and Storm Outages', 'How to protect pets during winter storms, including cold exposure, paw ice, salt, antifreeze, power outages, and emergency kits.', 'Winter weather can harm pets through cold exposure, ice, road salt, antifreeze, and storm-related power outages.', ['Cold exposure', 'Bring pets indoors during dangerous cold, wind, and freezing precipitation.', 'Short-haired, young, older, and small pets can chill faster.'], ['Paws and chemicals', 'Ice and salt can irritate paws. Wipe paws after walks and watch for limping.', 'Antifreeze is highly toxic and should be kept away from animals.'], ['Outage planning', 'Keep food, medication, water, leashes, carriers, and vaccination records ready.', 'If you may need a shelter or hotel, know pet policies in advance.']],
  ['weather-alerts-for-elderly-family', 'Preparedness', 'Weather Alerts for Elderly Family: Phones, Radios, Check-Ins, and Backup Plans', 'How to help older relatives receive weather alerts and act on them, including phone settings, weather radios, hearing issues, mobility, and power backup.', 'Older relatives may need layered alerts, simple action plans, and check-ins before severe weather, heat, cold, or power outages.', ['Alert layers', 'Set up phone alerts, weather radio, local TV/radio, and a trusted contact system.', 'Consider hearing, vision, language, and technology comfort.'], ['Action plans', 'Make shelter locations, cooling options, medication, mobility aids, and transportation plans simple and written down.', 'A plan that requires complex app use may fail under stress.'], ['Check-ins', 'Call before storms, heat waves, or cold outbreaks. Confirm devices are charged and supplies are accessible.', 'After storms, check for power, temperature, injuries, and blocked access.']],
  ['weather-radio-vs-phone-alerts', 'Weather Alerts', 'Weather Radio vs Phone Alerts: Why Redundant Warning Systems Matter', 'Compare NOAA weather radio, Wireless Emergency Alerts, weather apps, sirens, and local media for tornadoes, floods, hurricanes, and severe storms.', 'Weather radios and phone alerts serve different roles. The safest setup uses more than one alert source.', ['Phone alerts', 'Wireless Emergency Alerts can reach many phones in warned areas, but settings, location, reception, and device state can affect delivery.', 'Weather apps can add detail, but app quality and notification settings vary.'], ['Weather radio', 'A weather radio can wake you for warnings and works without relying on a cell app.', 'It needs correct programming, power, and battery backup.'], ['Redundancy', 'Use phone alerts, weather radio, trusted apps, local media, and outdoor sirens when outside.', 'One system can fail; layers reduce the chance you miss a warning.']],
  ['family-weather-drill-guide', 'Preparedness', 'Family Weather Drill Guide: Practice Tornado, Fire, Flood, and Outage Plans', 'How to run simple family weather drills for tornado warnings, flash flooding, power outages, fire weather, and nighttime alerts.', 'A family weather drill turns a plan into muscle memory before stress, darkness, noise, or power loss make decisions harder.', ['Pick scenarios', 'Practice tornado sheltering, flash flood route changes, power outage setup, and nighttime warning response.', 'Keep drills short and specific rather than turning them into a lecture.'], ['Assign roles', 'Someone gets pets, someone grabs the radio, someone helps younger children, and everyone knows the meeting spot.', 'Roles should be simple enough to remember half-asleep.'], ['Review', 'After the drill, fix what slowed you down: blocked shelter space, missing shoes, dead batteries, or unclear alerts.', 'Repeat before severe weather season.']],
  ['apartment-weather-preparedness-kit', 'Apartments', 'Apartment Weather Preparedness Kit: Storms, Outages, Heat, Flooding, and Alerts', 'A practical apartment weather kit for renters, including small-space supplies, alerts, power, water, pets, insurance photos, and building shelter questions.', 'Apartment weather preparedness should focus on alerts, shelter access, compact supplies, power backup, water, and knowing the building plan.', ['Small-space kit', 'Use a compact bin or bag with flashlight, batteries, battery bank, water, snacks, first aid, medication, documents, and pet supplies.', 'Keep shoes and a flashlight near the bed during severe weather nights.'], ['Building questions', 'Ask management about tornado shelter areas, generator policies, flood risk, emergency contacts, and access during power outages.', 'Know whether stairwells, laundry rooms, or lower interior spaces are available.'], ['Renters documentation', 'Take photos of belongings before storm season and understand renters insurance basics.', 'After damage, document before cleanup when safe.']]
];

const hubs = [
  ['weather-preparedness-guides', 'Preparedness', 'Weather Preparedness Guides: Outages, Alerts, Family Drills, Apartments, and Elderly Family', 'A hub for practical weather preparedness guides covering outage kits, generator safety, alert layers, family drills, apartment kits, and older relatives.', ['/weather-power-outage-kit/', '/generator-safety-weather-outage/', '/weather-alerts-for-elderly-family/', '/weather-radio-vs-phone-alerts/', '/family-weather-drill-guide/', '/apartment-weather-preparedness-kit/', '/weather-commute-safety-guide/', '/school-weather-closure-factors/']],
  ['outdoor-weather-safety-guides', 'Outdoor Weather Safety', 'Outdoor Weather Safety Guides: Sports, Camping, Boating, Weddings, Pets, and Heat', 'A hub for outdoor weather safety, including lightning delays, camping storms, boating thunderstorms, outdoor weddings, and pet heat or winter weather.', ['/sports-lightning-delay-guide/', '/camping-thunderstorm-safety/', '/boating-thunderstorm-safety/', '/outdoor-wedding-weather-plan/', '/pet-heat-wave-safety/', '/pet-winter-weather-safety/', '/rip-current-weather-safety/', '/uv-index-guide/']],
  ['storm-damage-guides', 'Storm Damage', 'Storm Damage Guides: Hail, Roof Leaks, Trees, Basement Flooding, and Cleanup Safety', 'A hub for practical storm-damage guides covering hail on cars, roof leaks, tree damage, basement flooding, and documentation after severe weather.', ['/hail-car-protection-guide/', '/roof-leak-after-storm-guide/', '/tree-damage-windstorm-guide/', '/basement-flooding-rainstorm-guide/', '/hail-damage-car-roof-guide/', '/tornado-insurance-claim-checklist/', '/tornado-post-event-cleanup/', '/after-a-tornado/']]
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
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/weather-preparedness-guides/">Preparedness</a><a href="/outdoor-weather-safety-guides/">Outdoor</a><a href="/storm-damage-guides/">Damage</a><a href="/simulator/">Simulator</a></div></div></nav>
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
  return base({ slug, category, title, description, quick, body, related: ['/weather-preparedness-guides/', '/outdoor-weather-safety-guides/', '/storm-damage-guides/', '/weather-safety-guides/'] });
}

function renderHub([slug, category, title, description, links]) {
  const cards = links.map((href) => `<a class="hub-card" href="${href}"><strong>${escapeHtml(labelFromPath(href))}</strong><span>Read the guide</span></a>`).join('\n');
  const body = `<h2>Start here</h2><p>This hub groups practical weather guides around real decisions: whether to drive, move indoors, protect pets, prepare for outages, or document storm damage.</p><div class="hub-grid">${cards}</div><h2>How to use this hub</h2><p>Pick the scenario closest to your day, then follow the related guides for alerts, hazard science, and recovery details.</p>`;
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
  const hubSection = `<section class="cat-section" data-generated="practical-weather-hubs">
  <h2 class="cat-heading">Preparedness, outdoor, and damage hubs <span class="cat-count">${hubs.length} hubs</span></h2>
  <p class="cat-sub">Scenario-based guide clusters for outages, alerts, family planning, outdoor events, pets, and storm damage.</p>
  <div class="link-grid">
${hubs.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  const articleSection = `<section class="cat-section" data-generated="practical-weather-expansion">
  <h2 class="cat-heading">Practical weather planning <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Useful guides for commuting, schools, sports, camping, boating, weddings, outages, generators, flooding, pets, alerts, and storm damage.</p>
  <div class="link-grid">
${pages.map(([slug, category, title]) => `    <a class="link-card" href="/${slug}/">${escapeHtml(title)} <small>${escapeHtml(category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="practical-weather-hubs">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="practical-weather-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="forecast-map-hubs">/, hubSection + articleSection + '<section class="cat-section" data-generated="forecast-map-hubs">');
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
console.log(`Added ${pages.length} practical weather articles, ${hubs.length} hubs, and rebuilt ${total} indexed URLs.`);

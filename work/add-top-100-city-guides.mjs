import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
// U.S. Census Bureau Vintage 2025, July 1, 2025 estimates. Urban Honolulu CDP excluded.
const rows = `
New York|New York|8584629
Los Angeles|California|3869089
Chicago|Illinois|2731585
Houston|Texas|2397315
Phoenix|Arizona|1665481
Philadelphia|Pennsylvania|1574281
San Antonio|Texas|1548422
San Diego|California|1406106
Dallas|Texas|1329491
Fort Worth|Texas|1028117
Jacksonville|Florida|1017689
Austin|Texas|1002632
San Jose|California|989814
Charlotte|North Carolina|964784
Columbus|Ohio|938396
Indianapolis|Indiana|901116
San Francisco|California|826079
Seattle|Washington|784777
Denver|Colorado|740613
Nashville|Tennessee|721074
Oklahoma City|Oklahoma|719849
Washington|District of Columbia|693645
El Paso|Texas|683012
Las Vegas|Nevada|679817
Boston|Massachusetts|672973
Detroit|Michigan|649095
Louisville|Kentucky|641962
Portland|Oregon|635109
Memphis|Tennessee|609647
Baltimore|Maryland|569997
Milwaukee|Wisconsin|562407
Albuquerque|New Mexico|556588
Fresno|California|555549
Tucson|Arizona|548371
Sacramento|California|536449
Atlanta|Georgia|529110
Kansas City|Missouri|521220
Mesa|Arizona|513656
Raleigh|North Carolina|506306
Colorado Springs|Colorado|494743
Miami|Florida|489812
Omaha|Nebraska|488797
Virginia Beach|Virginia|453737
Long Beach|California|450469
Oakland|California|440838
Minneapolis|Minnesota|430324
Bakersfield|California|422165
Tulsa|Oklahoma|416209
Tampa|Florida|413554
Aurora|Colorado|410053
Arlington|Texas|402134
Wichita|Kansas|400987
Cleveland|Ohio|363608
New Orleans|Louisiana|362154
Henderson|Nevada|353289
Anaheim|California|341008
Orlando|Florida|333888
Lexington|Kentucky|329751
Stockton|California|324597
Newark|New Jersey|323808
Riverside|California|323057
Irvine|California|318764
Corpus Christi|Texas|317247
Santa Ana|California|315586
Cincinnati|Ohio|314367
Greensboro|North Carolina|308667
Pittsburgh|Pennsylvania|307632
St. Paul|Minnesota|306684
Durham|North Carolina|305561
Jersey City|New Jersey|302013
Lincoln|Nebraska|301522
North Las Vegas|Nevada|296653
Plano|Texas|293028
Gilbert|Arizona|287285
Anchorage|Alaska|287155
Madison|Wisconsin|286233
Reno|Nevada|283621
Chandler|Arizona|278748
St. Louis|Missouri|278144
Chula Vista|California|275533
Fort Wayne|Indiana|275203
Buffalo|New York|274613
Lubbock|Texas|273071
Laredo|Texas|269515
Port St. Lucie|Florida|268062
St. Petersburg|Florida|264033
Toledo|Ohio|263423
Glendale|Arizona|260572
Winston-Salem|North Carolina|257271
Irving|Texas|257076
Chesapeake|Virginia|255332
Garland|Texas|249625
Scottsdale|Arizona|243006
Boise|Idaho|238429
Richmond|Virginia|237257
Frisco|Texas|236955
Cape Coral|Florida|236264
McKinney|Texas|236001
Huntsville|Alabama|233627
Norfolk|Virginia|231013`.trim().split('\n').map((r,i)=>{const [city,state,pop]=r.split('|');return {rank:i+1,city,state,pop:Number(pop)}});

const plains = new Set(['Texas','Oklahoma','Kansas','Nebraska','Missouri']);
const dixie = new Set(['Alabama','Georgia','Tennessee','Mississippi','Louisiana','North Carolina','South Carolina','Kentucky']);
const midwest = new Set(['Illinois','Indiana','Ohio','Michigan','Minnesota','Wisconsin']);
const atlantic = new Set(['New York','New Jersey','Pennsylvania','Massachusetts','Maryland','District of Columbia','Virginia']);
const desert = new Set(['Arizona','Nevada','New Mexico']);
const pacific = new Set(['California','Oregon','Washington']);
function profile(state){
  if(plains.has(state)) return {setting:'the central and southern Plains',season:'April through June, with a smaller cool-season window',setup:'Gulf moisture can meet a dryline, front and strong winds aloft, creating organized supercells',note:'Long storm paths can cross several counties and city jurisdictions.',examples:['1957 Dallas tornado','1979 Red River Valley outbreak','1999 Bridge Creek–Moore tornado']};
  if(dixie.has(state)) return {setting:'the humid Southeast and Dixie Alley',season:'late winter through spring, with a secondary fall season',setup:'Warm Gulf air often overlaps strong wind shear in fast-moving storm systems, including after dark',note:'Trees, hills, rain and early darkness can hide an approaching circulation.',examples:['1974 Super Outbreak','2008 Super Tuesday outbreak','2011 Super Outbreak']};
  if(midwest.has(state)) return {setting:'the Midwest and Great Lakes storm corridor',season:'April through July',setup:'Warm humid air moving north can meet fronts and powerful midlatitude wind fields',note:'Lake boundaries can alter storms locally, but they do not form a reliable tornado shield.',examples:['1965 Palm Sunday outbreak','1974 Super Outbreak','1990 Plainfield tornado']};
  if(atlantic.has(state)) return {setting:'the urban Northeast and Mid-Atlantic',season:'May through September, with tropical-season episodes',setup:'Summer instability, fronts, tropical remnants and coastal boundaries can each support rotation',note:'Short paths can still cause serious damage where development is dense.',examples:['1953 Worcester tornado','1985 Pennsylvania–Ohio outbreak','2021 remnants of Hurricane Ida']};
  if(state==='Florida') return {setting:'the Florida peninsula and Gulf–Atlantic coastal zone',season:'year-round, especially the cool season and hurricane season',setup:'Sea-breeze collisions, winter storm systems and tropical rain bands can produce brief tornadoes',note:'Waterspouts moving ashore and rain-wrapped tropical tornadoes are part of the local record.',examples:['1998 Kissimmee outbreak','2007 Groundhog Day outbreak','tornadoes embedded in tropical-cyclone rain bands']};
  if(desert.has(state)) return {setting:'the interior Southwest',season:'the summer monsoon and occasional cool-season systems',setup:'Monsoon moisture and colliding outflow boundaries can combine with rotation near stronger weather systems',note:'Tornadoes are uncommon, and dust devils should not be confused with tornadoes.',examples:['1972 Phoenix-area tornado','2010 northern Arizona outbreak','documented landspouts along desert boundaries']};
  if(pacific.has(state)) return {setting:'the Pacific coast and western interior valleys',season:'mainly fall through spring',setup:'Cold-core lows, winter thunderstorms and narrow convective lines can generate brief rotation',note:'Events are less frequent than on the Plains, but dense development can make a short track consequential.',examples:['1983 Los Angeles tornado','2008 central California tornadoes','2018 Port Orchard tornado']};
  if(state==='Colorado') return {setting:'the High Plains beside the Rocky Mountain Front Range',season:'May through July',setup:'Upslope moisture and terrain-driven boundaries can focus rotating thunderstorms east of the mountains',note:'The highest risk is generally east of the foothills, across the urban corridor and adjacent plains.',examples:['1988 northeast Denver tornado','2008 Windsor tornado','2015 northern Front Range tornadoes']};
  return {setting:'a region with a documented but comparatively infrequent tornado record',season:'primarily during the warmer half of the year',setup:'A sufficiently unstable thunderstorm can rotate when a strong weather system supplies changing wind with height',note:'Low frequency does not mean zero risk, and local warnings remain the decision source.',examples:['official county storm-event records','local National Weather Service damage surveys','state tornado climatology']};
}
const special = {
  'New York':['2007 Brooklyn EF2','2010 Queens–Brooklyn tornadoes','2021 remnants of Hurricane Ida'],
  'Los Angeles':['1983 south Los Angeles F2','2019 Montebello-area tornado','2023 Montebello EF1'],
  'Chicago':['1967 Oak Lawn F4','1990 Plainfield F5','2015 Rochelle–Fairdale EF4'],
  'Houston':['1992 Channelview F4','2008 Hurricane Ike tornadoes','2017 Hurricane Harvey tornadoes'],
  'Philadelphia':['1989 Montgomery County tornado','2021 Bensalem EF3','2021 Mullica Hill EF3'],
  'Dallas':['1957 Dallas F3','2012 Dallas–Fort Worth outbreak','2019 north Dallas EF3'],
  'Fort Worth':['2000 downtown Fort Worth F3','2012 Dallas–Fort Worth outbreak','2015 Garland–Rowlett EF4'],
  'Nashville':['1933 Nashville tornado','1998 downtown Nashville F3','2020 Nashville EF3'],
  'Oklahoma City':['1999 Bridge Creek–Moore F5','2013 Moore EF5','2019 central Oklahoma tornado sequence'],
  'Boston':['1953 Worcester F4','2011 western Massachusetts EF3','2021 Dennis–Yarmouth tornadoes'],
  'Detroit':['1953 Flint–Beecher F5','1956 Hudsonville–Standale F5','1997 southeast Michigan outbreak'],
  'St. Louis':['1896 St. Louis–East St. Louis F4','1927 St. Louis F4','2011 Good Friday EF4'],
  'Miami':['1925 Miami tornado','1997 downtown Miami tornado','tornadoes associated with tropical cyclones'],
  'Omaha':['1913 Omaha F4','1975 Omaha F4','2024 Elkhorn–Omaha EF3'],
  'Wichita':['1958 Wichita tornado','1991 Andover F5','2012 south Wichita EF3'],
  'New Orleans':['1983 Kenner tornado','2017 New Orleans East EF3','2022 Arabi EF3'],
  'Lubbock':['1970 Lubbock F5','1975 Lubbock-area tornadoes','2019 South Plains tornadoes'],
  'Huntsville':['1974 Huntsville-area tornadoes','1989 Huntsville F4','2011 north Alabama outbreak']
};
const slug=s=>s.toLowerCase().replaceAll('st.','st').replaceAll(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const photos=[['/assets/photos/spearman.jpg','A tornado beneath a severe storm over open country','Daphne Zaras / NOAA, public domain','https://commons.wikimedia.org/wiki/File:Dszpics1.jpg'],['/assets/photos/wallcloud.jpg','A rotating wall cloud with lightning','Brad Smull / NOAA, public domain','https://commons.wikimedia.org/wiki/File:Wall_cloud_with_lightning_-_NOAA.jpg'],['/assets/photos/waterspout.jpg','A waterspout beneath a storm cloud','Historic NWS Collection / NOAA, public domain','https://commons.wikimedia.org/wiki/File:Waterspout_noaa00307.jpg']];
const css=`<style>:root{--bg:#fbfaf7;--surface:#fff;--text:#14161c;--muted:#555b68;--border:#e5e1d8;--accent:#a02818;--serif:"Fraunces",Georgia,serif;--sans:"Inter",system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.68 var(--sans)}a{color:#1e3a5f}.crumb,.article{max-width:760px;margin:auto;padding-left:24px;padding-right:24px}.crumb{padding-top:18px;font-size:13px;color:var(--muted)}.article{padding-top:28px;padding-bottom:70px}.article-header{padding-bottom:28px;border-bottom:1px solid var(--border)}.eyebrow{color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}h1,h2,h3{font-family:var(--serif);line-height:1.16}h1{font-size:clamp(34px,6vw,52px);letter-spacing:-.03em;margin:12px 0}.lede{font-size:20px;color:var(--muted)}h2{font-size:28px;margin:46px 0 14px}h3{font-size:20px;margin:0 0 6px}.article p,.article li{font-size:17px}.scope,.sources{background:var(--surface);border:1px solid var(--border);padding:18px 20px;margin:28px 0}.scope{border-left:4px solid var(--accent)}figure{margin:30px 0}figure img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px}figcaption{font-size:13px;color:var(--muted);margin-top:8px}.record{display:grid;grid-template-columns:36px 1fr;gap:16px;padding:19px 0;border-top:1px solid var(--border)}.record b{font:700 18px var(--serif);color:var(--accent)}.record p{margin:0;color:var(--muted)}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.fact{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px}.fact strong{display:block;color:var(--accent);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.related{border-top:1px solid var(--border);margin-top:40px;padding-top:20px}.footer{background:#14161c;color:#abb2bf;padding:36px 24px;text-align:center;font-size:13px}.footer a{color:#fff}@media(max-width:600px){.facts{grid-template-columns:1fr}.record{grid-template-columns:28px 1fr}}</style>`;
const nav=`<a class="th-skip" href="#main-content">Skip to content</a><nav class="th-nav" aria-label="Menu"><div class="th-nav-inner"><a href="/" class="th-brand"><svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M3 5h26M6 11h22M10 17h15M13 23h9M16 29h4M18 34h2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>Tornado Hub</a><button class="th-menu" type="button" aria-expanded="false" aria-controls="th-primary-links">Menu</button><div class="th-links" id="th-primary-links"><a href="/articles/">Guides</a><a href="/tornado-forecast/">Forecast</a><a href="/games/">Games</a><a href="/safety/">Safety</a><a href="/search/">Search</a><a href="/simulator/" class="th-launch">Simulator ↗</a></div></div></nav>`;
function render(row,geo){
  const p=profile(row.state), s=slug(row.city), route=geo?`history-of-tornadoes-in-${s}`:`tornadoes-in-${s}`, other=geo?`tornadoes-in-${s}`:`history-of-tornadoes-in-${s}`;
  const title=geo?`A History of Tornadoes in ${row.city}`:`Tornadoes in ${row.city}`;
  const desc=geo?`How ${row.city}, ${row.state}'s geography shapes tornado risk, with important city and regional events.`:`A researched guide to the tornado history of ${row.city}, ${row.state}, with reporting context and official records.`;
  const img=photos[(row.rank-1)%photos.length], events=special[row.city]||p.examples;
  const records=events.map((e,i)=>`<div class="record"><b>${i+1}</b><div><h3>${esc(e)}</h3><p>${special[row.city]?'A documented city or regional event that helps explain the local historical record.':'A regional reference point. Use the official database and local storm surveys to determine its relationship to the city boundary.'}</p></div></div>`).join('');
  const body=geo?`<h2>Geography and storm exposure</h2><p>${row.city} is part of ${p.setting}. ${p.setup}. Geography influences storm boundaries and exposure, but terrain, rivers and buildings do not create a dependable tornado shield.</p><p>${p.note} This page uses the incorporated city as its population reference and the surrounding region for meteorological context; those boundaries answer different questions and are labeled separately.</p><div class="facts"><div class="fact"><strong>2025 city rank</strong><p>#${row.rank} in the United States</p></div><div class="fact"><strong>Estimated population</strong><p>${fmt(row.pop)}</p></div><div class="fact"><strong>Main season</strong><p>${p.season}</p></div></div><h2>Important tornadoes to place in context</h2>${records}<p>These events are starting points, not a claim that every path crossed ${row.city}'s incorporated limits. Tornadoes are surveyed by path and county; metropolitan labels in news coverage often describe a broader area.</p><h2>Why the historical record changes over time</h2><p>Older records favor destructive tornadoes that crossed settled places. Radar, trained spotters, phones and systematic damage surveys now capture many weak or brief events that earlier observers could miss. Apparent increases can therefore reflect detection and urban growth as well as weather variability.</p>`:`<h2>The ${row.city} tornado record</h2><p>${row.city}'s tornado history should be read as a path-based record rather than a single citywide count. Storms can begin outside the city, cross a corner of its limits or affect a suburb that shares the city name in regional reporting. This guide keeps those distinctions visible.</p><p>The city lies in ${p.setting}. ${p.setup}. The usual window is ${p.season}, although tornadoes can occur outside the peak when the necessary ingredients overlap.</p><h2>Three historical reference points</h2>${records}<p>For a complete chronology, query the NOAA Storm Events Database by state, county and date. Follow a promising record to the responsible National Weather Service office’s survey, which is the best source for the path, rating, width and damage indicators.</p><h2>From sparse reports to modern surveys</h2><p>Before the modern warning era, a tornado might enter the record only through newspaper accounts, deaths or major structural damage. The growth of warning radar, spotter networks and formal surveys made the record more complete. The Fujita scale was introduced in the 1970s; the United States adopted the Enhanced Fujita scale in 2007.</p><p>Development also changes what a similar track encounters. With an estimated ${fmt(row.pop)} residents inside the 2025 Census city geography, ${row.city} ranks #${row.rank} nationally. That population figure describes exposure, not tornado probability.</p><h2>How to verify a reported ${row.city} tornado</h2><ol><li>Record the event date and the county or counties crossed.</li><li>Open the official Storm Events entry and confirm that the event type is tornado.</li><li>Read the local damage survey and compare its path map with the incorporated boundary.</li><li>Treat preliminary ratings and social-media locations as provisional until the survey is complete.</li></ol>`;
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:title,description:desc,datePublished:'2026-09-08',dateModified:'2026-09-08',author:{'@type':'Organization',name:'Tornado Hub'},publisher:{'@type':'Organization',name:'Tornado Hub'},mainEntityOfPage:`https://www.tornadosimulator.net/${route}/`});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="max-image-preview:large"><title>${esc(title)} — Tornado Hub</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="https://www.tornadosimulator.net/${route}/"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="article"><meta property="og:image" content="https://www.tornadosimulator.net${img[0]}"><link rel="icon" href="/favicon.ico"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/site-shell.css?v=1">${css}<script type="application/ld+json">${schema}</script><script src="/assets/site-shell.js?v=1" defer></script></head><body>${nav}<div class="crumb"><a href="/">Home</a> · <a href="/articles/">Articles</a> · ${esc(title)}</div><article class="article" id="main-content"><header class="article-header"><div class="eyebrow">Top 100 U.S. cities · Census rank #${row.rank}</div><h1>${esc(title)}</h1><p class="lede">${esc(desc)}</p></header><div class="scope"><strong>Boundary note:</strong> Census rank and population refer to ${esc(row.city)}'s incorporated or consolidated-government geography. Tornado context may include the surrounding county or metro and is labeled accordingly.</div><figure><img src="${img[0]}" alt="${img[1]}" width="1200" height="675"><figcaption>Illustrative storm photograph; it does not depict a listed ${esc(row.city)} event. Photo: <a href="${img[3]}">${img[2]}</a>.</figcaption></figure>${body}<div class="sources"><h2>Official sources</h2><ul><li><a href="https://www.ncei.noaa.gov/stormevents/">NOAA Storm Events Database</a></li><li><a href="https://www.spc.noaa.gov/wcm/">Storm Prediction Center climatology</a></li><li><a href="https://www.weather.gov/safety/tornado">National Weather Service tornado safety</a></li><li><a href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-cities-and-towns.html">Census Vintage 2025 city estimates</a></li></ul><p>This educational article is not a live warning service. Use official alerts for current decisions.</p></div><aside class="related"><h2>Continue reading</h2><p><a href="/${other}/">${geo?'Read the city tornado chronology':'Explore the geography and landmark events'}</a> · <a href="/simulator/">Open the tornado simulator</a></p></aside></article><footer class="footer">© Tornado Hub · <a href="/articles/">Articles</a> · <a href="/about/">About</a> · <a href="/contact/">Contact</a></footer><script src="/assets/article-tracker.js" defer></script></body></html>`;
}

const entries=[];
for(const row of rows) for(const geo of [false,true]){
  const s=slug(row.city), route=geo?`history-of-tornadoes-in-${s}`:`tornadoes-in-${s}`, title=geo?`A History of Tornadoes in ${row.city}`:`Tornadoes in ${row.city}`;
  fs.mkdirSync(path.join(root,route),{recursive:true}); fs.writeFileSync(path.join(root,route,'index.html'),render(row,geo));
  entries.push({title,path:`/${route}/`,description:geo?`How ${row.city}, ${row.state}'s geography shapes tornado risk, with important city and regional events.`:`A researched guide to the tornado history of ${row.city}, ${row.state}, with reporting context and official records.`,category:'Top 100 U.S. City Tornado Guide',keywords:`${row.city} ${row.state} tornado history tornadoes city rank ${row.rank}`});
}
const dirEntry={title:'Tornado Guides for the 100 Largest U.S. Cities',path:'/top-100-us-city-tornado-guides/',description:'Two tornado guides for every city in the Census Bureau Vintage 2025 top 100.',category:'City Tornado Directory',keywords:'top 100 US cities tornado history guides'};
entries.push(dirEntry);
const idxFile=path.join(root,'assets','content-index.js'), raw=fs.readFileSync(idxFile,'utf8');
const idx=JSON.parse(raw.replace(/^window\.TORNADO_CONTENT_INDEX\s*=\s*/,'').replace(/;\s*$/,'')), paths=new Set(entries.map(e=>e.path));
fs.writeFileSync(idxFile,`window.TORNADO_CONTENT_INDEX = ${JSON.stringify([...idx.filter(e=>!paths.has(e.path)),...entries],null,2)};\n`);
const cards=entries.map((e,i)=>`<a class="link-card" href="${e.path}">${esc(e.title)} <small>${i%2?'Geography & events':'Chronological history'}</small></a>`).join('\n');
const section=`<section class="cat-section" data-generated="top-100-city-tornado-guides"><h2 class="cat-heading">Tornado guides for the 100 largest U.S. cities <span class="cat-count">200 guides</span></h2><p class="cat-sub">Two guides for every city in the Census Bureau Vintage 2025 top 100: a local-history article and a geography-and-events article.</p><div class="link-grid">${cards}</div></section>\n`;
const artFile=path.join(root,'articles','index.html'); let art=fs.readFileSync(artFile,'utf8').replace(/<section class="cat-section" data-generated="top-100-city-tornado-guides">[\s\S]*?<\/section>\s*/,'');
art=art.replace(/<section class="cat-section" data-generated="city-tornado-guides">[\s\S]*?<\/section>\s*/,'');
art=art.replace('<main id="main-content" tabindex="-1" class="main">','<main id="main-content" tabindex="-1" class="main">\n'+section); fs.writeFileSync(artFile,art);
const mapFile=path.join(root,'top-100-us-city-tornado-guides','index.html'); fs.mkdirSync(path.dirname(mapFile),{recursive:true});
fs.writeFileSync(mapFile,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Top 100 U.S. City Tornado Guides — Tornado Hub</title><meta name="description" content="Tornado history and geography guides for the 100 largest U.S. cities."><link rel="stylesheet" href="/assets/site-shell.css?v=1">${css}<script src="/assets/site-shell.js?v=1" defer></script></head><body>${nav}<article class="article" id="main-content"><header class="article-header"><div class="eyebrow">City guide directory</div><h1>Tornado guides for the 100 largest U.S. cities</h1><p class="lede">Two researched entry points for every city in the Census Bureau Vintage 2025 ranking.</p></header><div class="sources"><p><strong>Ranking basis:</strong> July 1, 2025 city estimates. Urban Honolulu CDP is excluded because it is not an incorporated city.</p></div>${rows.map(r=>`<h2>#${r.rank} ${esc(r.city)}, ${esc(r.state)}</h2><p>${fmt(r.pop)} residents · <a href="/tornadoes-in-${slug(r.city)}/">Tornado history</a> · <a href="/history-of-tornadoes-in-${slug(r.city)}/">Geography and events</a></p>`).join('')}</article><footer class="footer">© Tornado Hub · <a href="/articles/">All articles</a></footer></body></html>`);
let site=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const e of entries) if(!site.includes(`<loc>https://www.tornadosimulator.net${e.path}</loc>`)) site=site.replace('</urlset>',`<url><loc>https://www.tornadosimulator.net${e.path}</loc><lastmod>2026-09-08</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>\n</urlset>`);
fs.writeFileSync(path.join(root,'sitemap.xml'),site);
console.log(`Generated ${entries.length-1} articles for ${rows.length} Census-ranked cities plus one directory.`);

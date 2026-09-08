import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const words={en:['Guides','Forecast','Games','Safety','Search','Simulator','Menu','Skip to content'],fr:['Guides','Prévisions','Jeux','Sécurité','Rechercher','Simulateur','Menu','Aller au contenu'],es:['Guías','Pronóstico','Juegos','Seguridad','Buscar','Simulador','Menú','Ir al contenido'],de:['Ratgeber','Vorhersage','Spiele','Sicherheit','Suche','Simulator','Menü','Zum Inhalt'],pl:['Poradniki','Prognoza','Gry','Bezpieczeństwo','Szukaj','Symulator','Menu','Przejdź do treści'],zh:['指南','天气预报','游戏','安全','搜索','模拟器','菜单','跳转到内容']};
function nav(lang,old='') {
 const w=words[lang]||words.en; const home=lang==='en'?'/':`/${lang}/`;
 const routes=['/articles/','/tornado-forecast/','/games/','/safety/','/search/','/simulator/'];
 // Use existing translated destinations when a page has one; do not invent routes.
 const anchors=[...old.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 const translated=routes.map(route=>anchors.find(a=>a[1]===home+route.slice(1))?.[1]||route);
 return `<a class="th-skip" href="#main-content">${w[7]}</a><nav class="th-nav" aria-label="${w[6]}"><div class="th-nav-inner"><a href="${home}" class="th-brand"><svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M3 5h26M6 11h22M10 17h15M13 23h9M16 29h4M18 34h2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>Tornado Hub</a><button class="th-menu" type="button" aria-expanded="false" aria-controls="th-primary-links">${w[6]}</button><div class="th-links" id="th-primary-links">${translated.map((r,i)=>`<a href="${r}"${i===5?' class="th-launch"':''}>${w[i]}${i===5?' ↗':''}</a>`).join('')}</div></div></nav><noscript><style>.th-links{display:flex!important}.th-menu{display:none!important}</style></noscript>`;
}
const homePath=path.join(root,'index.html');
const old=fs.readFileSync(homePath,'utf8');
const head=old.slice(0,old.indexOf('</head>')).replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<link[^>]*site-shell.css[^>]*>/g,'').replace(/<script[^>]*site-shell.js[^>]*><\/script>/g,'');
const home=`<body>
${nav('en')}
<main class="th-home" id="main-content" tabindex="-1">
<div class="th-topic-nav" aria-label="Explore topics"><a href="/how-tornadoes-form/">How tornadoes form</a><a href="/every-ef5-tornado/">The EF5 record</a><a href="/tornado-warning-polygon-explained/">Understanding warnings</a><a href="/tornado-history-by-location/">Your local tornado history</a></div>
<section class="th-hero"><div><h1>Understand the storm.</h1><p>Explore the science behind tornadoes, learn from the storms that made history, and see how a changing scenario affects a modeled tornado path.</p><a href="/simulator/" class="th-action">Explore the simulator ↗</a><a class="th-text-link" href="/articles/">Find a guide →</a></div><figure><img src="/assets/photos/spearman.jpg" width="900" height="600" alt="A large tornado beneath a dark storm cloud over open plains" fetchpriority="high"><figcaption>Tornado over the plains. Daphne Zaras / NOAA. Public domain. <a href="https://commons.wikimedia.org/wiki/File:Dszpics1.jpg">Photo source ↗</a></figcaption></figure></section>
<section class="th-section"><div class="th-section-head"><h2>A closer look</h2><a href="/articles/">All guides →</a></div><div class="th-editorial"><article class="th-lead"><h3><a href="/tornado-warning-polygon-explained/">What does the shape on a tornado warning map actually mean?</a></h3><p>A warning polygon is a forecast area. Learn how to read its boundary, how it relates to storm movement, and why it is different from a confirmed tornado path.</p><a href="/tornado-warning-polygon-explained/">Read the guide →</a></article><div><article class="th-story"><h3><a href="/rain-wrapped-tornado/">When the rain hides the tornado</a></h3><p>Why some tornadoes are difficult to see, even in daylight.</p></article><article class="th-story"><h3><a href="/joplin-2011/">Joplin, May 22, 2011</a></h3><p>The storm, the warning, and the lessons that followed.</p></article><article class="th-story"><h3><a href="/tornado-debris-signature/">Reading a debris signature</a></h3><p>What dual-polarization radar can tell us about a storm.</p></article></div></div></section>
<section class="th-section"><div class="th-section-head"><h2>Put your curiosity to work</h2><a href="/games/">All tools & games →</a></div><div class="th-tools"><div class="th-tool-feature"><h3>A storm scenario.<br>Your parameters.</h3><p>Place a tornado on the map. Adjust its wind speed, width, and path. Explore modeled exposure and damage using regional population data.</p><p>Educational estimates; not a forecast or warning service.</p><a href="/simulator/">Open the tornado simulator ↗</a></div><div><article class="th-story"><h3><a href="/tornadle/">A new Tornadle, every day</a></h3><p>Six guesses. One tornado name, town, or weather term.</p></article><article class="th-story"><h3><a href="/ef-scale-game/">Can you read the damage?</a></h3><p>Use the clues to estimate an EF rating.</p></article><article class="th-story"><h3><a href="/weather-calculators/">Weather, in numbers</a></h3><p>Explore heat index, wind chill, dew point, and more.</p></article></div></div></section>
<section class="th-section"><div class="th-section-head"><h2>Find your starting point</h2><a href="/search/">Search everything →</a></div><div class="th-directories"><div><h3>Weather where you live</h3><div class="th-route-list"><a href="/tornado-history-by-location/">US states & cities</a><a href="/international-weather-risk-guides/">International guides</a><a href="/local-international-weather-guides/">Local weather</a><a href="/tornado-forecast/canada/">Canada forecast</a><a href="/tornado-forecast/">Worldwide forecasts</a></div></div><div><h3>Learn. Prepare. Explore.</h3><div class="th-route-list"><a href="/learn/">Learning resources</a><a href="/safety/">Tornado safety</a><a href="/tornadoes/">Tornado records</a><a href="/every-ef5-tornado/">F5 & EF5 tornadoes</a><a href="/tornado-shelter-without-basement/">Shelter without a basement</a></div></div></div></section>
<footer class="th-footer"><div><strong>Tornado Hub</strong><p>An educational resource for understanding severe weather.<br>For current warnings, follow your official weather service.</p></div><div><a href="/about-us/">About</a><a href="/contact/">Contact</a><a href="/privacy-policy/">Privacy</a><a href="/articles/">Explore</a></div></footer>
</main><script src="/assets/article-tracker.js" defer></script><script src="/assets/ads-config.js?v=11" defer></script><script src="/assets/ads.js?v=11" defer></script><script src="/assets/house-ads.js?v=15" defer></script></body></html>`;
fs.writeFileSync(homePath,head+'\n</head>\n'+home);
let count=0;
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','work','dist','.openai'].includes(entry.name))continue;const f=path.join(dir,entry.name);if(entry.isDirectory()){visit(f);continue}if(entry.name!=='index.html')continue;
 let html=fs.readFileSync(f,'utf8');if(!html.includes('</head>'))continue;
 const rel=path.relative(root,f).replaceAll('\\','/');
 // Interactive canvas/map layouts keep their dedicated styles; shared editorial pages use the shell.
 if(rel==='simulator/index.html'||rel==='supercell-simulator/index.html')continue;
 const lang=html.match(/<html[^>]*lang="([^"]+)"/)?.[1]||'en';
 if(!html.includes('/assets/site-shell.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/site-shell.css?v=1">\n<script src="/assets/site-shell.js?v=1" defer></script>\n</head>');
 html=html.replace(/<nav\b[^>]*class="nav"[^>]*>[\s\S]*?<\/nav>/,n=>nav(lang,n));
 if(!html.includes('id="main-content"'))html=html.replace(/<(main|article)\b([^>]*)>/, '<$1 id="main-content" tabindex="-1"$2>');
 if(!html.includes('id="main-content"'))html=html.replace(/<h1\b/, '<h1 id="main-content" tabindex="-1"');
 html=html.replaceAll('/assets/house-ads.js?v=14','/assets/house-ads.js?v=15');
 html=html.replace(/<section class="article-brief-v3"[\s\S]*?<\/section>/g,'');
 html=html.replace(/<p[^>]*>This added section is part of[^<]*<\/p>/g,'');
 html=html.replace(/<div style="(text-align:center; margin: 24px 0; min-height:250px;)"/g,'<div class="th-legacy-ad" aria-label="Advertisement" style="$1"');
 html=html.replace(/^[\t ]+(?=\r?$)/gm,'');
 fs.writeFileSync(f,html);count++;
}}
visit(root);console.log(`Applied editorial shell to ${count} pages.`);

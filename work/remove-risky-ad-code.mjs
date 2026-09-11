import fs from 'node:fs';
import path from 'node:path';

const banned=/highperformanceformat\.com|topcreativeformat\.com|effectivecpmnetwork\.com|3nbf4\.com/i;
let changed=0, removed=0;
function cleanHtml(html){
  const before=html;
  const take=(re)=>{html=html.replace(re,m=>{removed++;return '';});};
  take(/<aside\b[^>]*id=["']adsterra-(?:left|side)["'][^>]*>[\s\S]*?<\/aside>/gi);
  take(/<script\b[^>]*>[\s\S]*?\batOptions\s*=[\s\S]*?<\/script>/gi);
  take(/<script\b[^>]*src=["'][^"']*(?:highperformanceformat\.com|topcreativeformat\.com|effectivecpmnetwork\.com|3nbf4\.com)[^"']*["'][^>]*>\s*<\/script>/gi);
  take(/<iframe\b[^>]*(?:highperformanceformat\.com|topcreativeformat\.com|effectivecpmnetwork\.com|3nbf4\.com)[^>]*>\s*<\/iframe>/gi);
  take(/<div\b[^>]*id=["']container-[a-f0-9]+["'][^>]*>\s*<\/div>/gi);
  take(/<script\b[^>]*src=["']\/assets\/(?:ads|ads-config)\.js[^"']*["'][^>]*>\s*<\/script>/gi);
  take(/<link\b[^>]*href=["'][^"']*(?:highperformanceformat\.com|topcreativeformat\.com|effectivecpmnetwork\.com|3nbf4\.com)[^"']*["'][^>]*>/gi);
  take(/<style>\s*@media[^<]*(?:#adsterra-left|#adsterra-side)[^<]*<\/style>/gi);
  for(let i=0;i<3;i++) take(/<div\b[^>]*class=["'][^"']*(?:inline-ad|th-legacy-ad|side-ad)[^"']*["'][^>]*>\s*<\/div>/gi);
  return {html,changed:html!==before};
}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html')){const old=fs.readFileSync(p,'utf8'),result=cleanHtml(old);if(result.changed){fs.writeFileSync(p,result.html);changed++;}}}}
walk('.');
for(const file of ['assets/ads.js','assets/ads-config.js']){if(fs.existsSync(file)){const old=fs.readFileSync(file,'utf8');if(banned.test(old)){fs.writeFileSync(file,"/* Risky third-party ad injection removed. Standard AdSense tags remain in page templates. */\n");changed++;}}}
console.log(`Cleaned ${changed} files and removed ${removed} risky ad blocks or loaders.`);

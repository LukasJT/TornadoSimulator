const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pages=[];let adPages=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 if(['.git','node_modules','work','dist'].includes(e.name))continue;
 const f=path.join(dir,e.name);
 if(e.isDirectory())walk(f);
 else if(e.name==='index.html'){
  const s=fs.readFileSync(f,'utf8');pages.push(f);
  for(const pattern of [/<title>[^<]+<\/title>/i,/<body\b/i,/<h1\b/i,/<\/body>/i,/rel=["']canonical["']/i])assert(pattern.test(s),`${f}: missing ${pattern}`);
  for(const m of s.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))assert.doesNotThrow(()=>JSON.parse(m[1]),`${f}: invalid structured data`);
  const slots=[...s.matchAll(/data-th-ad="([^"]+)"/g)].map(m=>m[1]);
  assert(slots.length<=2,`${f}: too many slots`);assert.equal(new Set(slots).size,slots.length,`${f}: duplicate slots`);
  if(slots.length){adPages++;assert.equal((s.match(/src="\/assets\/ads\.js\?/g)||[]).length,1,`${f}: ad loader count`);}
  assert(!/data-generated=["'](?:science-depth-v1|article-depth-v2|random-depth-v4)["']/.test(s),`${f}: repeated filler`);
  assert(!/\batOptions\s*=|src=["'][^"']*(?:highperformanceformat|effectivecpmnetwork|3nbf4)/i.test(s),`${f}: legacy direct ad tag`);
 }
}}
walk('.');
const sitemap=fs.readFileSync('sitemap.xml','utf8');const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URLs');
for(const f of pages){const expected='https://www.tornadosimulator.net/'+f.replaceAll('\\','/').replace(/index.html$/,'');assert(urls.includes(expected),`${f}: missing sitemap URL`);}
console.log(`PASS: ${pages.length} documents, canonical URLs, structured data, sitemap membership, filler removal; ${adPages} pages with unique bounded placements.`);

const fs=require('node:fs'),path=require('node:path');
const rows=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 if(['.git','node_modules','work','dist'].includes(e.name))continue;
 const file=path.join(dir,e.name);
 if(e.isDirectory())walk(file);
 else if(e.name==='index.html'){
  const s=fs.readFileSync(file,'utf8');
  const text=s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  rows.push({file,title:(s.match(/<title>([^<]*)/i)||[])[1]||'',body:/<body[ >]/i.test(s),h1:/<h1[ >]/i.test(s),canonical:(s.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i)||[])[1],words:text.split(' ').length,ads:s.includes('/assets/ads.js')});
 }
}}
walk('.');
fs.writeFileSync('work/seo-audit-raw.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify({pages:rows.length,noTitle:rows.filter(x=>!x.title).length,noBody:rows.filter(x=>!x.body).length,noH1:rows.filter(x=>!x.h1).length,adsLoader:rows.filter(x=>x.ads).length,short:rows.filter(x=>x.words<200).slice(0,12),missingTitle:rows.filter(x=>!x.title).slice(0,8)},null,2));

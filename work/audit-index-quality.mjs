import fs from 'node:fs';
import path from 'node:path';
const out=[];
for(const e of fs.readdirSync('.',{withFileTypes:true})){
  if(!e.isDirectory()) continue;
  const file=path.join(e.name,'index.html');
  if(!fs.existsSync(file)) continue;
  const html=fs.readFileSync(file,'utf8');
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&\w+;/g,' ').replace(/\s+/g,' ').trim();
  const markers=[...html.matchAll(/data-generated="([^"]+)/g)].map(m=>m[1]);
  out.push({slug:e.name,words:text?text.split(' ').length:0,markers});
}
const summary={total:out.length,under200:out.filter(x=>x.words<200).length,under400:out.filter(x=>x.words<400).length,under700:out.filter(x=>x.words<700).length,generated:out.filter(x=>x.markers.length).length};
console.log(JSON.stringify(summary,null,2));
console.log(out.sort((a,b)=>a.words-b.words).slice(0,100).map(x=>`${x.words}\t${x.slug}\t${x.markers.join(',')}`).join('\n'));

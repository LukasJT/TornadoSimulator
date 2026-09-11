import fs from 'node:fs';
import path from 'node:path';
const hosts=new Map();
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(html|js)$/.test(e.name)){const s=fs.readFileSync(p,'utf8');for(const m of s.matchAll(/(?:src=|importScripts\()['"]?(https?:)?\/\/([^/'"\s)]+)/gi)){const h=m[2].toLowerCase();if(!hosts.has(h))hosts.set(h,{count:0,files:new Set});const v=hosts.get(h);v.count++;v.files.add(p);}}}}
walk('.');
console.log([...hosts].sort((a,b)=>b[1].count-a[1].count).map(([h,v])=>`${v.count}\t${v.files.size}\t${h}`).join('\n'));

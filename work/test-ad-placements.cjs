const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('assets/ads.js','utf8');
function scenario(width,slotWidth,secondary='secondary',consent=true){
 const elements=['primary',secondary].map(name=>({dataset:{thAd:name},clientWidth:slotWidth,hidden:false,querySelector(){return {textContent:'',append(){}};}}));
 const doc={visibilityState:'visible',querySelectorAll:()=>elements,querySelector:()=>({getBoundingClientRect:()=>({right:width/2+430})}),addEventListener(){},dispatchEvent(){}};
 const win={ADSTERRA:{enabled:true}};
 if(!consent)win.__tcfapi=(method,version,cb)=>cb({eventStatus:'tcloaded',gdprApplies:true,purpose:{consents:{1:false}}},true);
 const observed=[];
 const context={window:win,document:doc,innerWidth:width,location:{hostname:consent?'localhost':'www.tornadosimulator.net',search:'?ads-preview=1'},URLSearchParams,CustomEvent:class{},IntersectionObserver:class{constructor(cb){this.cb=cb;}observe(slot){observed.push(slot);this.cb([{target:slot,isIntersecting:true}]);}unobserve(){}}};
 win.IntersectionObserver=context.IntersectionObserver;
 vm.runInNewContext(code,context);vm.runInNewContext(code,context);
 return {elements,observed};
}
let r=scenario(390,346);assert.deepEqual(r.elements.map(e=>e.dataset.format),['native',undefined]);assert.equal(r.observed.length,1);
r=scenario(1280,800);assert.deepEqual(r.elements.map(e=>e.dataset.format),['leaderboard','native']);assert.equal(r.observed.length,2);
r=scenario(1700,800,'sidebar');assert.deepEqual(r.elements.map(e=>e.dataset.format),['leaderboard','skyscraper']);assert.equal(r.observed.length,2);
r=scenario(900,750,'sidebar');assert.equal(r.elements[1].hidden,true);
r=scenario(1280,800,'secondary',false);assert.equal(r.observed.length,0,'no ads before required CMP consent');
console.log('PASS: phone, desktop, wide sidebar, duplicate-loader guard, maximum two placements, CMP consent gate. Preview tests send no ad requests.');

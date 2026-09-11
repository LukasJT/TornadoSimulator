const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('simulator/index.html','utf8');
const app=html.split('<script type="text/babel">')[1].split('</script>')[0];
const models=app.slice(0,app.indexOf('function Slider('));
const geometry=app.slice(app.indexOf('function generatePathPoints('),app.indexOf('function InteractiveMap('));
const context=vm.createContext({React:{},window:{},console});
const presets=app.slice(app.indexOf('const PRESETS ='),app.indexOf('function parseSimUrlParams()'));
vm.runInContext(models+'\n'+geometry+'\n'+presets+`\nthis.api={PRESETS,runSimulation,runMultiSegmentSimulation,generatePathPoints,pathLengthFromPoints};`,context);
const {PRESETS,runSimulation,runMultiSegmentSimulation,generatePathPoints,pathLengthFromPoints}=context.api;
let checks=0;
for(const preset of Object.values(PRESETS)) {
  for(const mode of ['straight','curved']) {
    const params={...preset,curvature:30};
    const points=generatePathPoints(37.08,-94.51,params,mode,[]);
    const cache=[{lat:37,lng:-94.5,name:'Test district',popDensity:850,housingDensity:320}];
    for(const useLocation of [true,false]) {
      const {result,segments}=runMultiSegmentSimulation(params,points,mode,cache,useLocation);
      assert(segments.length>0);
      assert(Math.abs(Number(result.pathAreaSqMi) - result._routeMiles * params.pathWidth / 1760) < .006);
      for(const key of ['fatalities','injuries','totalStructures','totalDestroyed','totalDamaged','totalEconomicImpact','vehiclesDestroyed','powerLinesDestroyed']) {
        assert(Number.isFinite(result[key]) && result[key]>=0,key);
        assert.equal(result[key],segments.reduce((n,s)=>n+s.result[key],0),key+' must agree across tabs');
      }
      for(const key of ['destroyed','damaged','total']) {
        assert.equal(Object.values(result.structureDamage).reduce((n,s)=>n+s[key],0),result[{destroyed:'totalDestroyed',damaged:'totalDamaged',total:'totalStructures'}[key]]);
      }
      checks++;
    }
  }
}
const params={...PRESETS.suburban_ef4};
const points=generatePathPoints(37,-94,params,'straight',[]);
const low=runMultiSegmentSimulation({...params,popDensity:10},points,'straight',[],false).result;
const high=runMultiSegmentSimulation({...params,popDensity:1000},points,'straight',[],false).result;
assert(high.populationInPath>low.populationInPath*90,'manual population must affect exposure');
for(const origin of [[0,0],[0,30],[30,0]]) {
  const route=generatePathPoints(...origin,params,'straight',[]);
  assert(route.length>=2 && pathLengthFromPoints(route)>0,'zero latitude/longitude is valid');
}
const calm=runSimulation({...params,popDensity:0,housingDensity:0});
assert(Math.abs(pathLengthFromPoints([[0,0],[0,1]])-69.093)<.01,'great-circle distance');
assert.equal(calm.populationInPath,0);assert.equal(calm.totalStructures,0);assert.equal(calm.fatalities,0);
for(const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
assert(html.includes('<h1 id="guide-title">Tornado simulator</h1>'));
assert(!html.includes('model real fatalities'));
console.log(`PASS: ${checks} preset/path/density combinations, consistent detail totals, manual exposure, zero coordinates, zero population, structured data.`);

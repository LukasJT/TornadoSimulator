import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-14';

const sharedSources = {
  australia: [
    ['Bureau of Meteorology warnings', 'https://www.bom.gov.au/australia/warnings/'],
    ['Bureau of Meteorology weather knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/severe-weather-knowledge-centre'],
    ['Australian emergency warnings', 'https://www.emergencyalert.gov.au/']
  ],
  finland: [
    ['Finnish Meteorological Institute warnings', 'https://en.ilmatieteenlaitos.fi/warnings'],
    ['FMI information on warnings', 'https://en.ilmatieteenlaitos.fi/information-on-warnings'],
    ['FMI road weather', 'https://en.ilmatieteenlaitos.fi/road-weather']
  ],
  sweden: [
    ['SMHI warnings', 'https://www.smhi.se/en/weather/warnings-and-advisories'],
    ['SMHI radar and satellite', 'https://www.smhi.se/en/weather/radar-and-satellite'],
    ['Krisinformation emergency information', 'https://www.krisinformation.se/en']
  ],
  latvia: [
    ['LVGMC warnings', 'https://videscentrs.lvgmc.lv/en/weather-forecast'],
    ['Meteoalarm Latvia', 'https://meteoalarm.org/en/live/region/LV'],
    ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/']
  ],
  regional: [
    ['Meteoalarm Europe', 'https://meteoalarm.org/'],
    ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/'],
    ['NOAA/NSSL Severe Weather 101', 'https://www.nssl.noaa.gov/education/svrwx101/']
  ]
};

const pages = [
  {
    slug: 'sydney-severe-thunderstorm-hail-flood-guide',
    country: 'Australia',
    region: 'Sydney and New South Wales',
    category: 'Australia Local Weather',
    title: 'Sydney Severe Thunderstorm, Hail, and Flash Flood Guide',
    description: 'A local Sydney weather guide for severe thunderstorms, large hail, short-fuse flash flooding, damaging wind, lightning, and coastal rain setups.',
    quick: 'Sydney storm risk is often about fast-changing local impacts: hail cores, intense rain over urban catchments, damaging gusts, lightning, and road flooding that can vary sharply across suburbs.',
    hazards: ['large hail', 'flash flooding', 'damaging wind', 'lightning', 'coastal rain bands'],
    season: 'Warm-season thunderstorms and east coast lows are the main setups to watch, but heavy rain and wind can happen outside summer when coastal systems deepen.',
    official: 'Use Bureau of Meteorology warnings, radar, rainfall observations, and local emergency updates together because Sydney impacts can be suburb-scale.',
    local: 'Dense roads, rail lines, low points, coastal suburbs, and built-up drainage mean a storm that looks brief on radar can still create dangerous travel or property problems.',
    decision: 'Delay travel when warnings mention giant hail, destructive wind, or intense rainfall over your route; move vehicles under cover before hail arrives; and avoid low crossings even if traffic is still moving.',
    related: ['/australia-weather-risk-guide/', '/australia-east-coast-low-weather-guide/', '/australia-flash-flood-road-safety-guide/', '/hail-damage-car-roof-guide/'],
    sourceKey: 'australia'
  },
  {
    slug: 'brisbane-severe-thunderstorm-flood-guide',
    country: 'Australia',
    region: 'Brisbane and southeast Queensland',
    category: 'Australia Local Weather',
    title: 'Brisbane Severe Thunderstorm and Flood Guide',
    description: 'A Brisbane and southeast Queensland guide to severe thunderstorms, flash flooding, hail, damaging wind, tropical rain, and creek or road flooding.',
    quick: 'Brisbane weather risk often combines intense thunderstorm rain, urban drainage, creek response, lightning, hail, tropical moisture, and roads that can flood quickly.',
    hazards: ['flash flooding', 'creek rises', 'large hail', 'damaging wind', 'tropical rain'],
    season: 'Warm-season humidity, storm boundaries, and tropical moisture can all raise the risk of intense rainfall and severe thunderstorms.',
    official: 'Use Bureau of Meteorology warnings and radar along with local road, flood, and emergency information because water depth can change faster than broad forecasts.',
    local: 'Southeast Queensland has steep local rainfall gradients, urban low points, and roads where floodwater can cut access before a regional river headline looks dramatic.',
    decision: 'If heavy rain is training over your side of the city, treat creek crossings, underpasses, and familiar shortcuts as suspect until official road information says otherwise.',
    related: ['/australia-flash-flood-road-safety-guide/', '/flash-flood-safety/', '/australia-cyclone-flood-heat-bushfire-guide/', '/weather-alert-cheat-sheet/'],
    sourceKey: 'australia'
  },
  {
    slug: 'melbourne-wind-hail-thunderstorm-guide',
    country: 'Australia',
    region: 'Melbourne and Victoria',
    category: 'Australia Local Weather',
    title: 'Melbourne Wind, Hail, and Thunderstorm Weather Guide',
    description: 'A Melbourne guide to cool changes, severe thunderstorms, hail, damaging wind, flash flooding, heat, smoke, and fast weather shifts in Victoria.',
    quick: 'Melbourne risk often comes from sharp changes: heat to cool change, gusty thunderstorm outflow, hail, brief heavy rain, and smoke or fire-weather shifts around Victoria.',
    hazards: ['cool-change wind surges', 'hail', 'severe thunderstorm gusts', 'flash flooding', 'smoke and heat'],
    season: 'Spring and summer severe storms can overlap with heat and fire weather, while strong fronts can bring wind and sharp temperature changes.',
    official: 'Use Bureau of Meteorology warnings, radar, observations, and state emergency advice together; a wind change can alter fire, smoke, marine, and thunderstorm risk.',
    local: 'The city, bay, hills, and surrounding fire-weather landscapes create different impacts over short distances, especially when storms or fronts arrive during commute windows.',
    decision: 'Watch timing carefully. A warning that overlaps school pickup, sports, train travel, or a heat-and-wind change deserves a more conservative plan.',
    related: ['/australia-bushfire-weather-warning-guide/', '/wind-advisory-vs-high-wind-warning/', '/hail-damage-car-roof-guide/', '/storm-boundary-guides/'],
    sourceKey: 'australia'
  },
  {
    slug: 'perth-heat-bushfire-weather-guide',
    country: 'Australia',
    region: 'Perth and Western Australia',
    category: 'Australia Local Weather',
    title: 'Perth Heat, Bushfire Weather, and Coastal Wind Guide',
    description: 'A Perth weather guide for heatwaves, bushfire weather, dry wind, smoke, coastal wind shifts, thunderstorms, and Western Australia warning decisions.',
    quick: 'Perth weather risk is often about heat stress, dry fuels, wind shifts, smoke, fire-weather warnings, and coastal wind changes that can affect outdoor plans quickly.',
    hazards: ['heatwaves', 'bushfire weather', 'smoke', 'coastal wind', 'dry thunderstorms'],
    season: 'Hot-season heat and fire weather dominate, but coastal changes, thunderstorms, and smoke can turn an ordinary outdoor day into a planning problem.',
    official: 'Use Bureau of Meteorology heat, fire-weather, wind, and thunderstorm products with emergency fire authority information and local restrictions.',
    local: 'Perth has a strong outdoor culture, coastal wind influence, and nearby bushfire exposure, so weather decisions are often about timing and route flexibility.',
    decision: 'Move strenuous outdoor work earlier, check fire restrictions before travel, plan smoke-sensitive activities around air quality, and avoid assuming a sea breeze solves heat risk.',
    related: ['/australia-bushfire-weather-warning-guide/', '/heat-wave-safety/', '/air-quality-smoke-weather-guide/', '/red-flag-warning-explained/'],
    sourceKey: 'australia'
  },
  {
    slug: 'darwin-cyclone-monsoon-storm-guide',
    country: 'Australia',
    region: 'Darwin and the Top End',
    category: 'Australia Local Weather',
    title: 'Darwin Cyclone, Monsoon, and Thunderstorm Weather Guide',
    description: 'A Darwin and Top End guide to tropical cyclones, monsoon bursts, lightning, flooding rain, damaging wind, coastal water, and seasonal storm planning.',
    quick: 'Darwin risk is tropical and seasonal: monsoon rain, lightning, cyclones, storm surge, damaging gusts, road flooding, and heat all need different planning triggers.',
    hazards: ['tropical cyclones', 'monsoon rain', 'lightning', 'coastal water', 'flooded roads'],
    season: 'The wet season brings the main cyclone, monsoon, and thunderstorm risks, while heat and lightning can shape daily decisions.',
    official: 'Use Bureau of Meteorology cyclone watches and warnings, rainfall products, radar, and local emergency advice because preparation windows can close before peak weather arrives.',
    local: 'Long travel distances, coastal exposure, flood-prone roads, and isolated communities make early action more important than waiting for the storm center to be certain.',
    decision: 'Finish outdoor securing before tropical-storm-force winds arrive, avoid driving into water-covered roads, and keep cyclone, flood, heat, and lightning plans separate.',
    related: ['/australia-cyclone-flood-heat-bushfire-guide/', '/hurricane-vs-tornado-comparison/', '/storm-surge-explained/', '/lightning-safety-guide/'],
    sourceKey: 'australia'
  },
  {
    slug: 'hobart-wind-coastal-weather-guide',
    country: 'Australia',
    region: 'Hobart and Tasmania',
    category: 'Australia Local Weather',
    title: 'Hobart Wind, Coastal Rain, and Mountain Weather Guide',
    description: 'A Hobart and Tasmania weather guide for strong wind, coastal rain, mountain snow, marine hazards, cold fronts, and fast travel-condition changes.',
    quick: 'Hobart weather decisions often involve wind, coastal rain, mountain exposure, cold fronts, marine conditions, and road weather changing quickly with elevation.',
    hazards: ['strong wind', 'coastal rain', 'mountain snow', 'marine hazards', 'cold fronts'],
    season: 'Tasmania can see strong fronts, marine hazards, mountain snow, and wet road problems in multiple seasons, not only winter.',
    official: 'Use Bureau of Meteorology warnings, marine products, mountain forecasts, and local road information together when planning travel or outdoor recreation.',
    local: 'A short drive can move from sheltered urban weather into exposed ridges, coastal wind, or mountain road conditions, so the local forecast should not be treated as one uniform zone.',
    decision: 'Check elevation, wind exposure, and return routes before committing to mountain, coastal, ferry, or long-road plans.',
    related: ['/marine-weather-explained/', '/winter-travel-weather-guide/', '/wind-advisory-vs-high-wind-warning/', '/weather-map-reading-guides/'],
    sourceKey: 'australia'
  },
  {
    slug: 'canberra-smoke-heat-storm-guide',
    country: 'Australia',
    region: 'Canberra and the ACT',
    category: 'Australia Local Weather',
    title: 'Canberra Smoke, Heat, Storm, and Frost Weather Guide',
    description: 'A Canberra and ACT guide to heat, smoke, bushfire weather, severe thunderstorms, frost, cold nights, hail, and mountain-influenced weather decisions.',
    quick: 'Canberra weather risk can shift from frost and cold nights to heat, smoke, hail, dry thunderstorm gusts, and bushfire weather depending on the season.',
    hazards: ['smoke', 'heat', 'hail', 'frost', 'bushfire weather'],
    season: 'Summer can bring heat, smoke, and storm gusts, while winter and shoulder seasons add frost, fog, and cold-road concerns.',
    official: 'Use Bureau of Meteorology warnings and observations with air quality, fire authority, and road information when smoke, heat, or storms overlap.',
    local: 'The city sits near elevated terrain and bushland exposure, so weather impacts can involve air quality, outdoor events, commuter routes, and fire-weather planning at the same time.',
    decision: 'Treat smoke and heat as real safety triggers, protect vehicles and outdoor areas ahead of hail, and adjust morning travel when frost or fog affects roads.',
    related: ['/air-quality-smoke-weather-guide/', '/australia-bushfire-weather-warning-guide/', '/hail-car-protection-guide/', '/freezing-fog-vs-frost/'],
    sourceKey: 'australia'
  },
  {
    slug: 'adelaide-heat-wind-change-storm-guide',
    country: 'Australia',
    region: 'Adelaide and South Australia',
    category: 'Australia Local Weather',
    title: 'Adelaide Heat, Wind Change, and Severe Storm Guide',
    description: 'An Adelaide weather guide for heatwaves, wind changes, fire weather, dust, severe thunderstorms, hail, and coastal wind decisions.',
    quick: 'Adelaide risk often depends on heat, dry wind, sudden wind changes, fire danger, dust, thunderstorms, and coastal timing.',
    hazards: ['heatwaves', 'fire weather', 'wind changes', 'dust', 'hail'],
    season: 'Hot-season patterns can combine heat, low humidity, wind shifts, and thunderstorm gusts, while fronts can bring abrupt changes.',
    official: 'Use Bureau of Meteorology warnings, observations, and emergency fire information together because wind changes can alter both fire and thunderstorm risk.',
    local: 'Adelaide sits between coast and hills, so wind direction, heat, and terrain can change comfort, smoke, travel, and fire-weather exposure quickly.',
    decision: 'Move outdoor work and sport out of the hottest period, check fire restrictions before travel, and treat strong wind change timing as a practical planning detail.',
    related: ['/australia-bushfire-weather-warning-guide/', '/heat-index-danger-levels/', '/dust-storm-driving-safety/', '/storm-boundary-guides/'],
    sourceKey: 'australia'
  },
  {
    slug: 'helsinki-coastal-winter-weather-guide',
    country: 'Finland',
    region: 'Helsinki and the Gulf of Finland',
    category: 'Finland Local Weather',
    title: 'Helsinki Coastal Winter Weather Guide',
    description: 'A Helsinki weather guide for Gulf of Finland wind, snow, freezing rain, sea effect, ice, visibility, road weather, and coastal storm decisions.',
    quick: 'Helsinki weather risk often combines coastal wind, snow, freezing rain, slippery roads, low visibility, sea conditions, and rapidly changing winter travel impacts.',
    hazards: ['snow', 'freezing rain', 'coastal wind', 'slippery roads', 'low visibility'],
    season: 'Winter and shoulder seasons are the main focus, but coastal wind, heavy rain, thunderstorms, and heat can still matter outside winter.',
    official: 'Use FMI warnings, road weather, observations, and marine information together because coastal and inland conditions can differ sharply.',
    local: 'The Gulf of Finland can influence wind, precipitation type, and sea conditions while dense commuting means small timing changes can affect many trips.',
    decision: 'Check warning color, precipitation type, pavement temperature, and wind before deciding whether to drive, cycle, use transit, or delay travel.',
    related: ['/finland-weather-risk-guide/', '/finland-road-weather-winter-driving-guide/', '/finland-baltic-sea-weather-safety-guide/', '/freezing-rain-vs-sleet/'],
    sourceKey: 'finland'
  },
  {
    slug: 'lapland-cold-snow-road-weather-guide',
    country: 'Finland',
    region: 'Lapland',
    category: 'Finland Local Weather',
    title: 'Lapland Cold, Snow, and Road Weather Guide',
    description: 'A Lapland weather guide for extreme cold, snow, blowing snow, darkness, road weather, wind chill, travel spacing, and outdoor safety.',
    quick: 'Lapland weather planning is about cold exposure, long distances, snow, blowing snow, darkness, road conditions, and how quickly travel margins disappear.',
    hazards: ['extreme cold', 'blowing snow', 'wind chill', 'road closures', 'low visibility'],
    season: 'Cold-season risk dominates, but spring thaw, river ice, and sudden weather changes can still affect travel and outdoor activities.',
    official: 'Use FMI warnings and road-weather information before travel, then keep checking because conditions may differ between towns and open roads.',
    local: 'Sparse services, long route gaps, and cold exposure mean a minor vehicle or visibility problem can become a safety issue faster than in a city.',
    decision: 'Carry cold-weather supplies, avoid tight travel schedules during warnings, and treat visibility and wind chill as important as the forecast snow amount.',
    related: ['/finland-road-weather-winter-driving-guide/', '/winter-travel-weather-guide/', '/wind-chill-vs-heat-index/', '/snowstorm-vs-blizzard-vs-whiteout/'],
    sourceKey: 'finland'
  },
  {
    slug: 'tampere-thunderstorm-wind-guide',
    country: 'Finland',
    region: 'Tampere and inland southern Finland',
    category: 'Finland Local Weather',
    title: 'Tampere Thunderstorm Gust, Hail, and Lake Weather Guide',
    description: 'A Tampere weather guide for inland Finland thunderstorms, lake recreation, damaging gusts, hail, lightning, falling trees, and warning decisions.',
    quick: 'Tampere storm risk is usually about thunderstorm gusts, lightning, hail, lake exposure, falling trees, and fast outdoor decisions during summer convective weather.',
    hazards: ['thunderstorm gusts', 'lightning', 'hail', 'lake exposure', 'falling trees'],
    season: 'Summer thunderstorms are the main severe-weather setup, while winter brings separate snow and ice hazards.',
    official: 'Use FMI thunderstorm and wind warnings with radar, lightning information, and local observations when outdoor or lake plans depend on timing.',
    local: 'Lakes, forests, campsites, and commuting corridors create exposure to wind damage and lightning even when storms are brief.',
    decision: 'Leave lakes, open fields, campsites, and forested paths early when thunder is possible; do not wait for rain if lightning or gust warnings are nearby.',
    related: ['/finland-forest-thunderstorm-gust-safety-guide/', '/lightning-safety-guide/', '/boating-thunderstorm-safety/', '/hail-core-radar-explained/'],
    sourceKey: 'finland'
  },
  {
    slug: 'turku-archipelago-wind-ice-guide',
    country: 'Finland',
    region: 'Turku archipelago',
    category: 'Finland Local Weather',
    title: 'Turku Archipelago Wind, Ice, and Sea Weather Guide',
    description: 'A Turku archipelago guide for wind, waves, sea ice, ferry travel, visibility, thunderstorms, winter roads, and Baltic Sea weather decisions.',
    quick: 'Turku archipelago weather planning depends on wind, waves, ferry routes, sea ice, fog, thunderstorms, and road or bridge conditions changing across islands.',
    hazards: ['wind', 'waves', 'sea ice', 'fog', 'thunderstorms'],
    season: 'Marine and coastal risk changes with season: summer boating and thunderstorms, autumn windstorms, winter ice, and spring breakup all matter.',
    official: 'Use FMI marine forecasts, warnings, sea observations, and ferry or local transport updates before committing to archipelago travel.',
    local: 'Island routes can have fewer backup options, so a wind or visibility change can affect timing more than it would in an inland city.',
    decision: 'Plan return routes, fuel, clothing, communications, and ferry timing before conditions worsen; do not use a city forecast as a complete marine forecast.',
    related: ['/finland-baltic-sea-weather-safety-guide/', '/marine-weather-explained/', '/small-craft-advisory-explained/', '/freezing-fog-vs-frost/'],
    sourceKey: 'finland'
  },
  {
    slug: 'oulu-bothnian-bay-winter-storm-guide',
    country: 'Finland',
    region: 'Oulu and Bothnian Bay',
    category: 'Finland Local Weather',
    title: 'Oulu and Bothnian Bay Winter Storm Guide',
    description: 'An Oulu weather guide for snow, wind, sea-effect bands, blowing snow, sea ice, road weather, and Bothnian Bay storm decisions.',
    quick: 'Oulu weather risk often combines snow, wind, blowing snow, coastal ice, low visibility, and road conditions around the Bothnian Bay.',
    hazards: ['snow bands', 'blowing snow', 'coastal wind', 'sea ice', 'road weather'],
    season: 'Cold-season road and coastal hazards dominate, but summer thunderstorm gusts and heavy rain can still affect travel and outdoor plans.',
    official: 'Use FMI warnings, road weather, observations, and marine ice information together because wind and temperature can quickly change impacts.',
    local: 'Open coastal areas and roads outside the city can experience worse wind chill and visibility than sheltered neighborhoods.',
    decision: 'Check wind and visibility before long drives, keep extra time for road changes, and treat sea ice as a changing hazard rather than a fixed surface.',
    related: ['/finland-road-weather-winter-driving-guide/', '/finland-baltic-sea-weather-safety-guide/', '/bridge-icing-weather-guide/', '/snowstorm-vs-blizzard-vs-whiteout/'],
    sourceKey: 'finland'
  },
  {
    slug: 'jyvaskyla-lake-thunderstorm-guide',
    country: 'Finland',
    region: 'Jyvaskyla and central Finland',
    category: 'Finland Local Weather',
    title: 'Jyvaskyla Lake Thunderstorm and Forest Wind Guide',
    description: 'A central Finland guide for lake thunderstorms, forest gusts, lightning, hail, power outages, summer camps, and inland travel decisions.',
    quick: 'Central Finland storm planning is about lakes, forests, gusts, lightning, falling branches, hail, power lines, and outdoor events that may be far from sturdy shelter.',
    hazards: ['lake thunderstorms', 'forest gusts', 'lightning', 'hail', 'power outages'],
    season: 'Summer convective storms are the main concern, while winter road weather creates a different planning problem.',
    official: 'Use FMI thunderstorm warnings, radar, and local observations when planning boating, camping, summer events, or long rural drives.',
    local: 'Forests and lakes make exposure different from a city street: wind damage, lightning, and distance to shelter matter as much as the rain rate.',
    decision: 'Move off water and out of exposed forest edges before storms arrive; make sure camps and events have a named shelter plan and communication path.',
    related: ['/finland-forest-thunderstorm-gust-safety-guide/', '/camping-thunderstorm-safety/', '/lightning-safety-guide/', '/storm-shelter-neighbor-plan/'],
    sourceKey: 'finland'
  },
  {
    slug: 'stockholm-snow-ice-wind-guide',
    country: 'Sweden',
    region: 'Stockholm',
    category: 'Sweden Local Weather',
    title: 'Stockholm Snow, Ice, Wind, and Coastal Weather Guide',
    description: 'A Stockholm weather guide for snow, ice, wind, Baltic coastal effects, road and rail disruption, freezing rain, low visibility, and SMHI warnings.',
    quick: 'Stockholm weather risk often comes from snow timing, freezing surfaces, Baltic wind, commuter disruption, low visibility, and warnings that affect roads, rail, and ferries.',
    hazards: ['snow', 'freezing surfaces', 'coastal wind', 'rail disruption', 'low visibility'],
    season: 'Winter and shoulder seasons bring the biggest travel sensitivity, but summer thunderstorms and heavy rain can still disrupt transport.',
    official: 'Use SMHI warnings, radar, observations, and transport updates together because a snow or ice event can create different impacts across the metro.',
    local: 'Islands, bridges, rail lines, waterfront exposure, and dense commuting mean timing matters as much as the headline snow total.',
    decision: 'Check the warning level, route exposure, and time of day before travel; if ice or heavy snow overlaps commute hours, leave extra margin or delay.',
    related: ['/sweden-weather-risk-guide/', '/sweden-snow-ice-travel-guide/', '/sweden-coastal-winter-weather-guide/', '/winter-travel-weather-guide/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'gothenburg-coastal-wind-rain-guide',
    country: 'Sweden',
    region: 'Gothenburg and the west coast',
    category: 'Sweden Local Weather',
    title: 'Gothenburg Coastal Wind, Rain, and Flood Weather Guide',
    description: 'A Gothenburg and Swedish west coast weather guide for windstorms, heavy rain, coastal water, road and rail disruption, waves, and SMHI warnings.',
    quick: 'Gothenburg weather planning is often about coastal wind, heavy rain, high water, waves, trees, rail disruption, and road flooding.',
    hazards: ['coastal wind', 'heavy rain', 'high water', 'waves', 'tree damage'],
    season: 'Autumn and winter windstorms are a major setup, while heavy rain and thunderstorms can create local flooding in warmer months.',
    official: 'Use SMHI warnings, sea and water-level information, radar, and local transport updates when wind and rain overlap.',
    local: 'The west coast can see exposed wind, water-level changes, and travel impacts that are stronger near bridges, harbors, rail corridors, and low-lying routes.',
    decision: 'Secure loose outdoor items, avoid exposed coastal routes during high wind, and check transit or road updates before assuming the usual commute works.',
    related: ['/sweden-windstorm-power-outage-guide/', '/sweden-coastal-winter-weather-guide/', '/coastal-flooding-explained/', '/wind-advisory-vs-high-wind-warning/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'malmo-oresund-wind-flood-guide',
    country: 'Sweden',
    region: 'Malmo and Oresund',
    category: 'Sweden Local Weather',
    title: 'Malmo and Oresund Wind, Flood, and Travel Weather Guide',
    description: 'A Malmo and Oresund weather guide for coastal wind, heavy rain, bridge exposure, travel disruption, thunderstorms, and winter ice risk.',
    quick: 'Malmo weather risk often centers on coastal wind, heavy rain, bridge and rail exposure, icy surfaces, and fast travel decisions around Oresund.',
    hazards: ['coastal wind', 'heavy rain', 'bridge exposure', 'icy roads', 'thunderstorms'],
    season: 'Wind and wet travel problems can occur in multiple seasons, while winter adds ice and summer adds thunderstorm rain.',
    official: 'Use SMHI warnings, observations, radar, and transport information together when planning cross-region or coastal travel.',
    local: 'The Oresund setting makes wind direction, bridge exposure, and cross-border travel timing more important than a generic city forecast.',
    decision: 'Check wind warnings before bridge or coastal travel, use radar for heavy-rain timing, and leave extra time when rain turns to ice.',
    related: ['/sweden-smhi-radar-satellite-guide/', '/sweden-snow-ice-travel-guide/', '/bridge-icing-weather-guide/', '/coastal-flooding-explained/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'kiruna-arctic-cold-snow-guide',
    country: 'Sweden',
    region: 'Kiruna and northern Sweden',
    category: 'Sweden Local Weather',
    title: 'Kiruna Arctic Cold, Snow, and Visibility Weather Guide',
    description: 'A Kiruna and northern Sweden guide for extreme cold, snow, blowing snow, road weather, aurora travel, darkness, and mountain exposure.',
    quick: 'Kiruna weather planning is about cold exposure, snow, blowing snow, low visibility, long distances, mountain routes, and limited backup options.',
    hazards: ['extreme cold', 'blowing snow', 'road weather', 'darkness', 'mountain exposure'],
    season: 'Cold-season risks dominate, but shoulder-season thaw, wind, and remote travel planning can still matter.',
    official: 'Use SMHI warnings and observations with road and travel information because conditions can change sharply outside town or with elevation.',
    local: 'Northern Sweden adds long distances, darkness, and cold exposure, making small delays or vehicle issues more consequential.',
    decision: 'Treat cold, wind, and visibility as core travel hazards; carry supplies and avoid tight schedules when warnings are active.',
    related: ['/sweden-snow-ice-travel-guide/', '/winter-travel-weather-guide/', '/wind-chill-vs-heat-index/', '/snowstorm-vs-blizzard-vs-whiteout/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'uppsala-thunderstorm-wind-guide',
    country: 'Sweden',
    region: 'Uppsala and eastern Sweden',
    category: 'Sweden Local Weather',
    title: 'Uppsala Thunderstorm, Wind, and Heavy Rain Guide',
    description: 'An Uppsala and eastern Sweden weather guide for thunderstorms, heavy rain, wind gusts, lightning, trees, commuting, and SMHI warning decisions.',
    quick: 'Uppsala storm risk often involves lightning, heavy rain, wind gusts, trees, local flooding, and timing around commuting or outdoor events.',
    hazards: ['lightning', 'heavy rain', 'wind gusts', 'tree damage', 'local flooding'],
    season: 'Summer thunderstorms are the main convective hazard, while autumn and winter bring wind and slippery travel issues.',
    official: 'Use SMHI radar, warnings, and observations together because thunderstorm timing can be local and fast-changing.',
    local: 'The mix of city, university, countryside, rail routes, and forested areas means the same storm can affect people differently depending on exposure.',
    decision: 'Move indoor before lightning reaches the area, avoid wooded paths in strong gusts, and do not drive through flooded low spots after intense rain.',
    related: ['/sweden-smhi-radar-satellite-guide/', '/lightning-safety-guide/', '/flash-flood-watch-vs-warning/', '/storm-anatomy-radar-signatures/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'norrland-snow-wind-cold-guide',
    country: 'Sweden',
    region: 'Norrland',
    category: 'Sweden Local Weather',
    title: 'Norrland Snow, Wind, Cold, and Road Weather Guide',
    description: 'A Norrland weather guide for snow, wind chill, blowing snow, cold exposure, rural roads, power outages, and winter warning decisions.',
    quick: 'Norrland risk is often about distance plus winter weather: snow, wind, cold, low visibility, rural roads, power reliability, and limited immediate help.',
    hazards: ['snow', 'wind chill', 'blowing snow', 'rural roads', 'power outages'],
    season: 'Winter weather can dominate planning for long stretches, but spring thaw and summer thunderstorms also need attention.',
    official: 'Use SMHI warnings and observations with local road and power information, especially before long rural trips.',
    local: 'The region is too large for one mental forecast. Conditions can differ by coast, inland valleys, mountains, and forested roads.',
    decision: 'Plan fuel, warmth, communication, and route alternatives before leaving, and be willing to postpone if visibility and wind combine.',
    related: ['/sweden-snow-ice-travel-guide/', '/weather-power-outage-kit/', '/winter-storm-emergency-kit/', '/wind-chill-vs-heat-index/'],
    sourceKey: 'sweden'
  },
  {
    slug: 'riga-city-storm-drainage-guide',
    country: 'Latvia',
    region: 'Riga',
    category: 'Latvia Local Weather',
    title: 'Riga City Storm Drainage, Wind, and Flood Weather Guide',
    description: 'A Riga weather guide for heavy rain, street flooding, windstorms, thunderstorm gusts, Daugava influence, winter ice, and warning decisions.',
    quick: 'Riga storm risk often combines urban drainage, heavy rain, Daugava and Gulf of Riga effects, wind gusts, slippery winter surfaces, and transport timing.',
    hazards: ['street flooding', 'wind gusts', 'Daugava water levels', 'winter ice', 'thunderstorms'],
    season: 'Heavy rain and thunderstorms matter in warm seasons, while Baltic windstorms, snow, ice, and high water shape cold-season decisions.',
    official: 'Use LVGMC warnings, Meteoalarm, radar or observations where available, and local road or emergency updates together.',
    local: 'Urban drainage, bridges, low streets, river influence, and coastal water-level changes can make the city impact different from a broad Latvia forecast.',
    decision: 'Check whether the warning is about wind, rain, ice, heat, or coastal water; each one changes a different part of the city plan.',
    related: ['/latvia-weather-risk-guide/', '/latvia-riga-gulf-flood-wind-guide/', '/latvia-meteoalarm-warning-colors-guide/', '/urban-flash-flooding-guide/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'liepaja-coastal-wind-wave-guide',
    country: 'Latvia',
    region: 'Liepaja and the Baltic coast',
    category: 'Latvia Local Weather',
    title: 'Liepaja Coastal Wind, Wave, and Storm Weather Guide',
    description: 'A Liepaja and Latvian Baltic coast guide for windstorms, waves, coastal water, port weather, winter ice, visibility, and warning decisions.',
    quick: 'Liepaja weather planning is often about exposed Baltic wind, waves, coastal water levels, port and road disruption, winter ice, and fast-changing visibility.',
    hazards: ['coastal wind', 'waves', 'water levels', 'port weather', 'winter ice'],
    season: 'Autumn and winter storms can bring the strongest coastal wind and water impacts, while summer thunderstorms and beach weather create separate risks.',
    official: 'Use LVGMC warnings, Meteoalarm, marine or coastal observations, and local travel information when wind and waves are forecast.',
    local: 'An exposed coast can turn a general wind forecast into a practical hazard for ports, ferries, beaches, roads, and power lines.',
    decision: 'Avoid exposed shorelines during high wind and wave warnings, secure outdoor items early, and check whether coastal water or ice changes travel plans.',
    related: ['/latvia-baltic-coastal-weather-guide/', '/gale-warning-explained/', '/marine-weather-explained/', '/coastal-flooding-explained/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'daugava-river-flood-weather-guide',
    country: 'Latvia',
    region: 'Daugava River basin',
    category: 'Latvia Local Weather',
    title: 'Daugava River Flood Weather Guide',
    description: 'A Daugava River weather guide for heavy rain, snowmelt, ice jams, river flooding, urban impacts, roads, and warning decisions in Latvia.',
    quick: 'Daugava flood risk depends on rain, snowmelt, ice, upstream response, water levels, and whether roads, bridges, basements, or low areas lose access.',
    hazards: ['river flooding', 'snowmelt', 'ice jams', 'heavy rain', 'low-road access'],
    season: 'Spring melt and heavy rain are key setups, but ice and winter thaw can also alter flood behavior.',
    official: 'Use LVGMC warnings and hydrological information with local authority updates because river impacts can lag behind the rainfall event.',
    local: 'Flooding is not only about the river crest. Drainage, bridges, backwater effects, low roads, and basements can become the practical problem first.',
    decision: 'Do not treat falling rain as the end of the event. Keep monitoring water levels, road closures, and local instructions until the flood response is clearly over.',
    related: ['/latvia-riga-gulf-flood-wind-guide/', '/flash-flood-safety/', '/river-flood-warning-explained/', '/hundred-year-flood-explained/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'latvia-winter-road-ice-guide',
    country: 'Latvia',
    region: 'Latvia',
    category: 'Latvia Local Weather',
    title: 'Latvia Winter Road Ice, Snow, and Freezing Rain Guide',
    description: 'A Latvia winter road-weather guide for snow, freezing rain, black ice, wind, low visibility, thaw-refreeze cycles, and travel decisions.',
    quick: 'Latvia winter travel risk often comes from thin ice, freezing rain, wet snow, wind, low visibility, and thaw-refreeze timing rather than snow depth alone.',
    hazards: ['black ice', 'freezing rain', 'wet snow', 'low visibility', 'wind'],
    season: 'Winter and shoulder seasons can produce snow, sleet, freezing rain, fog, and refreezing roads, especially when temperatures hover near freezing.',
    official: 'Use LVGMC warnings, Meteoalarm, observations, and road information together because pavement conditions can change before the air feels severely cold.',
    local: 'Flat open roads, bridges, rural routes, and shaded areas can freeze differently than city streets or main highways.',
    decision: 'Check precipitation type, road temperature cues, and wind before travel; leave extra braking distance and postpone nonessential trips during ice warnings.',
    related: ['/winter-travel-weather-guide/', '/black-ice-weather-guide/', '/freezing-rain-vs-sleet/', '/latvia-weather-risk-guide/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'jurmala-coastal-flood-wind-guide',
    country: 'Latvia',
    region: 'Jurmala and Gulf of Riga',
    category: 'Latvia Local Weather',
    title: 'Jurmala Coastal Flood, Wind, and Beach Weather Guide',
    description: 'A Jurmala and Gulf of Riga guide for coastal wind, high water, beach hazards, waves, thunderstorms, winter ice, and local warning decisions.',
    quick: 'Jurmala weather risk often involves Gulf of Riga wind, high water, beach exposure, thunderstorms, waves, and winter ice affecting recreation and roads.',
    hazards: ['coastal water', 'wind', 'waves', 'lightning', 'winter ice'],
    season: 'Warm-season beach and thunderstorm risk gives way to autumn and winter wind, high water, and ice concerns.',
    official: 'Use LVGMC warnings, Meteoalarm, coastal observations, and local safety information when planning beach, road, or outdoor activities.',
    local: 'A resort or beach day can turn hazardous from lightning, wind, water level, cold water, or reduced visibility even when rainfall is not the main issue.',
    decision: 'Leave beaches and open water when thunder is possible, avoid exposed coastal paths during high wind, and do not trust ice without official local guidance.',
    related: ['/latvia-baltic-coastal-weather-guide/', '/beach-weather-safety-guide/', '/lightning-safety-guide/', '/coastal-flooding-explained/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'latgale-thunderstorm-flood-guide',
    country: 'Latvia',
    region: 'Latgale',
    category: 'Latvia Local Weather',
    title: 'Latgale Thunderstorm, Hail, Wind, and Flood Guide',
    description: 'A Latgale weather guide for inland Latvia thunderstorms, hail, damaging wind, heavy rain, local flooding, lake exposure, and severe-weather reports.',
    quick: 'Latgale storm risk is usually local and convective: heavy rain, lightning, hail, gusts, lake exposure, and low-road flooding.',
    hazards: ['heavy rain', 'hail', 'damaging wind', 'lightning', 'lake exposure'],
    season: 'Summer thunderstorms and heavy rain are the main severe-weather setup, while winter adds snow, ice, and low visibility.',
    official: 'Use LVGMC warnings, Meteoalarm, and European severe-weather reports after the event to separate warning information from documentation.',
    local: 'Inland storms may be brief but intense, and lake or rural-road exposure can make local impacts more important than the national map suggests.',
    decision: 'Move off water when thunder is possible, protect vehicles before hail, avoid flooded local roads, and report significant hail or wind damage through appropriate channels.',
    related: ['/latvia-thunderstorms-windstorms-floods-guide/', '/latvia-european-severe-weather-reports-guide/', '/hail-core-radar-explained/', '/flash-flood-watch-vs-warning/'],
    sourceKey: 'latvia'
  },
  {
    slug: 'baltic-sea-storm-surge-weather-guide',
    country: 'Regional',
    region: 'Baltic Sea',
    category: 'Baltic Weather',
    title: 'Baltic Sea Storm Surge and Coastal Wind Weather Guide',
    description: 'A Baltic Sea guide to wind setup, water level changes, coastal flooding, waves, ports, ferries, winter ice, and warning decisions.',
    quick: 'Baltic coastal risk is about wind direction, duration, water level, waves, ice, ferry timing, ports, and whether coastal roads or low areas lose access.',
    hazards: ['coastal water levels', 'waves', 'windstorms', 'ferry disruption', 'winter ice'],
    season: 'Autumn and winter windstorms are often the most important coastal setup, while summer thunderstorms and cold-water exposure create different hazards.',
    official: 'Use national meteorological service warnings, marine forecasts, coastal observations, and local authority information because Baltic impacts vary by shoreline.',
    local: 'The same wind pattern can raise water on one coast and lower it elsewhere. Local coastline shape and basin response matter.',
    decision: 'Check wind direction, water-level forecasts, wave warnings, and transport updates before coastal travel or marine activity.',
    related: ['/finland-baltic-sea-weather-safety-guide/', '/latvia-baltic-coastal-weather-guide/', '/sweden-coastal-winter-weather-guide/', '/storm-surge-explained/'],
    sourceKey: 'regional'
  },
  {
    slug: 'nordic-road-weather-warning-guide',
    country: 'Regional',
    region: 'Nordic roads',
    category: 'Nordic Weather',
    title: 'Nordic Road Weather Warning Guide',
    description: 'A Nordic road-weather guide for snow, ice, freezing rain, blowing snow, darkness, wind chill, bridges, ferries, and warning decisions.',
    quick: 'Nordic road weather is about more than snow depth: pavement temperature, wind, darkness, freezing rain, blowing snow, bridge icing, ferries, and long distances all matter.',
    hazards: ['snow', 'ice', 'freezing rain', 'blowing snow', 'bridge icing'],
    season: 'Winter and shoulder seasons bring the greatest road-weather sensitivity, but summer wind, rain, and thunderstorms can still disrupt travel.',
    official: 'Use each national weather service and road authority together; the road surface can be worse than the general city forecast implies.',
    local: 'A regional trip can cross coast, inland, forest, mountain, bridge, and ferry exposure in one day, so a single point forecast is not enough.',
    decision: 'Check the worst segment of the route, not only the origin and destination. Build extra time around warnings and avoid relying on all-season confidence in icy conditions.',
    related: ['/finland-road-weather-winter-driving-guide/', '/sweden-snow-ice-travel-guide/', '/latvia-winter-road-ice-guide/', '/winter-travel-weather-guide/'],
    sourceKey: 'regional'
  },
  {
    slug: 'australia-severe-thunderstorm-warning-guide',
    country: 'Australia',
    region: 'Australia',
    category: 'Australia Weather',
    title: 'Australia Severe Thunderstorm Warning Guide',
    description: 'A guide to Australian severe thunderstorm warnings, including damaging wind, destructive wind, large hail, giant hail, heavy rainfall, flash flooding, radar, and safety decisions.',
    quick: 'Australian severe thunderstorm warnings should be read by hazard type: wind, hail, rainfall, flash flooding, lightning, and local timing all lead to different actions.',
    hazards: ['damaging wind', 'destructive wind', 'large hail', 'heavy rainfall', 'flash flooding'],
    season: 'Severe thunderstorms can happen in multiple regions and seasons, but warm-season moisture, instability, boundaries, and upper-level support often raise risk.',
    official: 'Use Bureau of Meteorology warnings, radar, observations, and emergency service updates. A warning is not a photo opportunity; it is an action trigger.',
    local: 'A national warning style still produces local impacts. Hail may affect one suburb, rainfall may flood one catchment, and wind damage may follow storm outflow.',
    decision: 'Move indoors, away from windows, protect vehicles before hail arrives, avoid flooded roads, and delay outdoor events when severe storms are nearby.',
    related: ['/australia-tornadoes-severe-thunderstorms-guide/', '/hail-damage-car-roof-guide/', '/flash-flood-safety/', '/downburst-explained/'],
    sourceKey: 'australia'
  },
  {
    slug: 'australia-heatwave-warning-guide',
    country: 'Australia',
    region: 'Australia',
    category: 'Australia Weather',
    title: 'Australia Heatwave Warning Guide',
    description: 'An Australia heatwave guide covering BoM heatwave information, hot nights, humidity, outdoor work, fire weather, vulnerable people, and cooling decisions.',
    quick: 'Australian heatwave risk builds when hot days, warm nights, humidity, smoke, fire weather, outdoor work, and limited cooling overlap.',
    hazards: ['heatwaves', 'warm nights', 'humidity', 'smoke', 'fire weather'],
    season: 'Heat risk is strongest in the warm season but varies by region, humidity, overnight lows, and whether smoke or fire-weather restrictions are present.',
    official: 'Use Bureau of Meteorology heatwave information, local health guidance, emergency updates, and fire-weather warnings together.',
    local: 'A coastal city, inland town, rural property, apartment, worksite, and sports field all experience heat differently.',
    decision: 'Move strenuous activity earlier, check vulnerable people, monitor indoor temperature, plan cooling access, and adjust work or sport before symptoms appear.',
    related: ['/heat-wave-safety/', '/australia-bushfire-weather-warning-guide/', '/air-quality-smoke-weather-guide/', '/wet-bulb-temperature-explained/'],
    sourceKey: 'australia'
  },
  {
    slug: 'scandinavia-winter-storm-travel-guide',
    country: 'Regional',
    region: 'Scandinavia',
    category: 'Nordic Weather',
    title: 'Scandinavia Winter Storm Travel Guide',
    description: 'A Scandinavia winter travel guide for snow, wind, ferries, mountain roads, rail disruption, coastal storms, darkness, and multi-country warning checks.',
    quick: 'Scandinavian winter travel planning should compare snow, wind, coast, mountains, road surfaces, ferry routes, rail updates, daylight, and warning levels across borders.',
    hazards: ['snow', 'coastal wind', 'mountain roads', 'rail disruption', 'ferry disruption'],
    season: 'Winter is the main travel-risk season, but autumn windstorms and spring thaw can also disrupt routes.',
    official: 'Use national weather warnings, road agencies, rail operators, ferries, and local emergency information together because travel systems fail at different thresholds.',
    local: 'A route may be safe in a city but dangerous at a pass, bridge, ferry terminal, or rural road segment.',
    decision: 'Plan around the worst link in the trip. If that link is a mountain pass, exposed bridge, ferry, or rural road, the city forecast is not enough.',
    related: ['/nordic-road-weather-warning-guide/', '/sweden-snow-ice-travel-guide/', '/finland-road-weather-winter-driving-guide/', '/winter-travel-weather-guide/'],
    sourceKey: 'regional'
  },
  {
    slug: 'baltic-thunderstorm-waterspout-guide',
    country: 'Regional',
    region: 'Baltic region',
    category: 'Baltic Weather',
    title: 'Baltic Thunderstorm and Waterspout Weather Guide',
    description: 'A Baltic regional guide to thunderstorms, waterspouts, hail, damaging wind, lightning, coastal storms, and European severe-weather reports.',
    quick: 'Baltic severe weather can include thunderstorms, hail, damaging wind, lightning, heavy rain, waterspouts, and rare tornadoes or funnel clouds.',
    hazards: ['thunderstorms', 'waterspouts', 'hail', 'damaging wind', 'lightning'],
    season: 'Warm-season convection is the main setup, but waterspouts and coastal convection can also appear when cold air passes over warmer water.',
    official: 'Use national warnings for action and ESWD or local reports for post-event documentation; those are not the same purpose.',
    local: 'Coastal water, lakes, open terrain, and small storm scale can make a severe report look surprising even when the regional forecast was only marginal.',
    decision: 'Move indoors before lightning arrives, leave open water early, protect vehicles from hail, and report significant wind, hail, or waterspout observations responsibly.',
    related: ['/latvia-european-severe-weather-reports-guide/', '/tornadoes-in-europe/', '/waterspout-vs-tornado/', '/lightning-safety-guide/'],
    sourceKey: 'regional'
  }
];

const hub = {
  slug: 'local-international-weather-guides',
  category: 'International Weather',
  title: 'Local International Weather Guides: Australia, Finland, Sweden, Latvia, and the Baltic Region',
  description: 'A local international weather hub with city and regional guides for Australian severe storms, Nordic winter travel, Baltic coastal wind, flood risk, and official warning systems.',
  quick: 'Use this hub when a country guide is too broad. Local weather decisions depend on city drainage, coastlines, roads, rail, ferries, terrain, warning systems, and seasonal hazards.',
  related: ['/international-weather-risk-guides/', '/international-seasonal-weather-guides/', '/australia-weather-risk-guide/', '/latvia-weather-risk-guide/']
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function slugLabel(href) {
  return href.replace(/^\/|\/$/g, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function safeList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function sourceLinks(page) {
  return (sharedSources[page.sourceKey] || sharedSources.regional)
    .map(([label, href]) => `<li><a href="${href}" rel="noopener">${escapeHtml(label)}</a></li>`)
    .join('');
}

function layout({ slug, category, title, description, quick, body, related, isHub = false }) {
  const url = `${site}/${slug}/`;
  const relatedList = related.map((href) => `<li><a href="${href}">${escapeHtml(slugLabel(href))}</a></li>`).join('');
  const type = isHub ? 'CollectionPage' : 'Article';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:type" content="${isHub ? 'website' : 'article'}" />
<meta property="og:url" content="${url}" />
<meta property="og:site_name" content="Tornado Hub" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': type, headline: title, name: title, description, author: { '@type': 'Organization', name: 'Tornado Hub' }, publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site }, datePublished: today, dateModified: today, mainEntityOfPage: url })}</script>
<script type="application/ld+json" data-seo="page">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, isPartOf: { '@id': `${site}/#website` }, publisher: { '@id': `${site}/#organization` }, inLanguage: 'en' }, { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` }, { '@type': 'ListItem', position: 2, name: title, item: url }] }] })}</script>
<style>
:root{--bg:#fbfaf7;--bg-alt:#f4f1ea;--surface:#fff;--text:#14161c;--text-secondary:#4a5061;--text-muted:#8b8f9c;--border:#e5e1d8;--accent:#a02818;--link:#1e3a5f;--serif:"Fraunces",Georgia,serif;--sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--sans);background:var(--bg);color:var(--text);line-height:1.65}a{color:var(--link);text-decoration:none}a:hover{color:var(--accent);text-decoration:underline}.nav{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20}.nav-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px}.nav-brand{font-family:var(--serif);font-weight:700;font-size:20px;color:var(--text)}.nav-links{display:flex;gap:4px;flex-wrap:wrap}.nav-links a{color:var(--text-secondary);padding:8px 12px;font-size:14px;font-weight:600;border-radius:6px}.nav-links a:hover{background:var(--bg-alt);color:var(--text);text-decoration:none}.breadcrumb,.article{max-width:820px;margin:0 auto;padding-left:24px;padding-right:24px}.breadcrumb{padding-top:16px;font-size:13px;color:var(--text-muted)}.article{padding-top:28px;padding-bottom:60px}.article-header{border-bottom:1px solid var(--border);padding-bottom:28px;margin-bottom:30px}.eyebrow{color:var(--accent);text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:800;margin-bottom:12px}h1{font-family:var(--serif);font-size:clamp(31px,4vw,48px);line-height:1.12;margin-bottom:14px}.lede{font-size:19px;color:var(--text-secondary)}h2{font-family:var(--serif);font-size:26px;margin:42px 0 12px}p{font-size:17px;margin-bottom:16px}.quick-answer{background:var(--surface);border-left:4px solid var(--accent);padding:18px 20px;margin:26px 0;box-shadow:0 2px 12px rgba(20,22,28,.06)}.local-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0 24px}.local-card,.source-box{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px}.local-card strong{display:block;color:var(--accent);font-size:12px;text-transform:uppercase;margin-bottom:6px}.source-box{border-left:4px solid var(--accent);margin:24px 0}.source-box ul,.related ul{margin-left:20px}.inline-ad{text-align:center;margin:32px 0;min-height:250px}.related{border-top:1px solid var(--border);margin-top:42px;padding-top:28px}.hub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:20px 0 8px}.hub-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;color:var(--text);font-weight:800}.hub-card span{display:block;color:var(--text-muted);font-size:13px;font-weight:500;margin-top:4px}.footer{background:#14161c;color:#94a3b8;padding:40px 24px;border-top:4px solid var(--accent)}.footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;font-size:13px}.footer a{color:white}@media(max-width:650px){.nav-inner{align-items:flex-start;flex-direction:column}.nav-links a{padding:6px 8px;font-size:13px}}
</style>
</head>
<body>
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/local-international-weather-guides/">Local Weather</a><a href="/international-weather-risk-guides/">International</a><a href="/simulator/">Simulator</a></div></div></nav>
<div class="breadcrumb"><a href="/">Home</a> - <a href="/articles/">Articles</a> - ${escapeHtml(title)}</div>
<article class="article"><header class="article-header"><div class="eyebrow">${escapeHtml(category)}</div><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></header>
<div class="quick-answer"><strong>Quick answer:</strong> ${escapeHtml(quick)}</div>
<div class="inline-ad"><script type="text/javascript">atOptions={'key':'1fe957d85bb2cf92027de309038cd17b','format':'iframe','height':250,'width':300,'params':{}};</script><script type="text/javascript" src="https://www.highperformanceformat.com/1fe957d85bb2cf92027de309038cd17b/invoke.js"></script></div>
${body}
<section class="related"><h2>Related guides</h2><ul>${relatedList}</ul></section></article>
<footer class="footer"><div class="footer-inner"><span>Tornado Hub. Educational resource, not a live warning system.</span><span><a href="/">Home</a> - <a href="/articles/">Articles</a> - <a href="/safety/">Safety</a> - <a href="/simulator/">Simulator</a></span></div></footer>
<script src="/assets/article-tracker.js" defer></script><script src="/assets/ads-config.js" defer></script><script src="/assets/ads.js" defer></script><script src="/assets/house-ads.js" defer></script>
</body></html>`;
}

function renderArticle(page) {
  const body = `
<h2>Why ${escapeHtml(page.region)} needs its own guide</h2>
<p>${escapeHtml(page.local)}</p>
<p>${escapeHtml(page.season)} A country-wide forecast can be useful background, but local decisions usually depend on timing, exposure, drainage, road surfaces, coastlines, forests, terrain, and how quickly official warning text changes.</p>
<div class="local-grid">
  <div class="local-card"><strong>Primary hazards</strong><p>${escapeHtml(page.hazards.join(', '))}.</p></div>
  <div class="local-card"><strong>Decision focus</strong><p>${escapeHtml(page.decision)}</p></div>
</div>
<h2>Hazards to separate</h2>
<p>Do not read this as one generic "bad weather" problem. ${escapeHtml(page.region)} planning should separate ${escapeHtml(page.hazards.slice(0, 3).join(', '))}, and the secondary effects that follow. A wind hazard can become a tree, power, ferry, rail, or bridge problem. A rain hazard can become a drainage, river, basement, or road-access problem. A winter hazard can be more about ice and visibility than snowfall totals.</p>
<p>The most useful question is: which part of the forecast changes an action? For some readers it is when to leave work, when to move a vehicle under cover, whether to cancel a beach plan, whether a ferry or bridge route is exposed, or whether an outdoor event has enough shelter.</p>
<h2>How to use official warnings</h2>
<p>${escapeHtml(page.official)} Warning colors, polygons, advisory words, and local emergency instructions are not decorative. They are a time-sensitive way to convert weather evidence into action.</p>
<p>Compare the warning type with the local exposure. Heavy rain matters differently for a flat urban underpass, a rural gravel road, a river valley, a campsite, and a coastal neighborhood. Wind matters differently near trees, ports, bridges, open water, construction sites, and power lines.</p>
<h2>Travel, shelter, and timing choices</h2>
<p>${escapeHtml(page.decision)} If the plan depends on the weather staying ordinary for the next hour, build in a backup. That backup might be a later departure, an indoor room, a route around low roads, a way to receive warnings without mobile data, or a decision to stop before the worst segment of a trip.</p>
<p>For fast hazards such as lightning, hail, downbursts, dust, and flash flooding, the safest decision usually happens before the weather is obvious at your exact location. For slow hazards such as river flooding, storm surge, heat, smoke, and winter ice, the danger can continue after the headline event looks like it is ending.</p>
<h2>Common mistakes</h2>
<p>The first mistake is using a broad national forecast as if it described every road, beach, suburb, lake, or rail line. The second is waiting for visual confirmation. Night, rain, fog, buildings, trees, hills, and traffic can hide the hazard until the decision window is gone.</p>
<p>Another mistake is treating a familiar place as automatically safe. Familiar roads flood, familiar coastlines get dangerous waves, familiar forests drop limbs in gusts, and familiar winter routes can glaze over when temperature hovers near freezing.</p>
<div class="source-box"><h2>Official sources to compare</h2><ul>${sourceLinks(page)}</ul></div>
<p>This page is written as an educational local weather guide. For emergencies and live decisions, use the official sources above plus local authorities, road agencies, transit operators, ferry services, and emergency managers.</p>`;
  return layout({ ...page, body, isHub: false });
}

function renderHub() {
  const grouped = pages.reduce((acc, page) => {
    const key = page.country;
    if (!acc[key]) acc[key] = [];
    acc[key].push(page);
    return acc;
  }, {});
  const groups = Object.entries(grouped).map(([country, items]) => `
<h2>${escapeHtml(country)} local guides</h2>
<div class="hub-grid">
${items.map((page) => `<a class="hub-card" href="/${page.slug}/">${escapeHtml(page.title)}<span>${escapeHtml(page.region)}</span></a>`).join('\n')}
</div>`).join('\n');
  const body = `
<h2>Start here</h2>
<p>This hub is built for readers who search by place. A broad country guide can explain national warning systems, but a local guide is better for decisions about roads, beaches, ports, snow routes, city drainage, ferry travel, forests, heat, and severe-storm timing.</p>
${groups}
<div class="source-box"><h2>How to use these pages</h2><p>Use the local page for the practical scenario, then compare it with the national meteorological service, local emergency advice, road or transport updates, and the newest warning text. Tornado Hub is educational and is not a live warning system.</p></div>`;
  return layout({ ...hub, body, isHub: true });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.agents', '.codex', 'node_modules', 'dist', 'work', 'outputs'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function textBetween(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function categoryFor(file, html) {
  const eyebrow = textBetween(html, /class=["'][^"']*(?:eyebrow|page-eyebrow|article-cat|section-eyebrow)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
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
  const section = `<section class="cat-section" data-generated="local-international-weather">
  <h2 class="cat-heading">Local international weather guides <span class="cat-count">${pages.length + 1} guides</span></h2>
  <p class="cat-sub">City and regional guides for Australia, Finland, Sweden, Latvia, the Baltic Sea, and Nordic winter travel.</p>
  <div class="link-grid">
    <a class="link-card" href="/${hub.slug}/">${escapeHtml(hub.title)} <small>${escapeHtml(hub.category)}</small></a>
${pages.map((page) => `    <a class="link-card" href="/${page.slug}/">${escapeHtml(page.title)} <small>${escapeHtml(page.category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="local-international-weather">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="international-country-special-weather">/, section + '<section class="cat-section" data-generated="international-country-special-weather">');
  fs.writeFileSync(file, html);
}

function updateHome() {
  const file = path.join(root, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const cards = [
    ['sydney-severe-thunderstorm-hail-flood-guide', 'Sydney storms', 'Hail, flash flooding, damaging wind, lightning, and coastal rain.'],
    ['helsinki-coastal-winter-weather-guide', 'Helsinki winter weather', 'Coastal wind, snow, freezing rain, road weather, and visibility.'],
    ['stockholm-snow-ice-wind-guide', 'Stockholm snow and wind', 'Baltic wind, snow timing, commuting, rail, ferries, and ice.'],
    ['riga-city-storm-drainage-guide', 'Riga storm drainage', 'Urban flooding, Daugava influence, wind, winter ice, and warnings.'],
    ['australia-severe-thunderstorm-warning-guide', 'Australia severe warnings', 'How to read wind, hail, rain, flash flood, and radar signals.'],
    ['baltic-sea-storm-surge-weather-guide', 'Baltic coastal storms', 'Wind setup, water levels, ports, ferries, waves, and winter ice.']
  ];
  const section = `<section class="section" data-generated="local-international-weather-home">
  <div class="section-inner">
    <div class="section-header">
      <div class="section-eyebrow">Local Weather Desk</div>
      <h2 class="section-title">City and regional guides for international readers.</h2>
      <p class="section-lede">More precise pages for high-intent searches: Sydney hail, Helsinki winter roads, Stockholm snow, Riga drainage, Australian severe warnings, and Baltic coastal storms.</p>
    </div>
    <div class="article-grid">
${cards.map(([slug, title, excerpt]) => `      <article class="article-card"><div class="article-cat">Local Weather</div><h3 class="article-title"><a href="/${slug}/">${escapeHtml(title)}</a></h3><p class="article-excerpt">${escapeHtml(excerpt)}</p><div class="article-meta">Local guide with official sources</div></article>`).join('\n')}
    </div>
    <div style="margin-top:24px;"><a href="/${hub.slug}/" class="btn btn-outline">Open the local international weather hub</a></div>
  </div>
</section>

`;
  html = html.replace(/<section class="section" data-generated="local-international-weather-home">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="section" data-generated="international-country-special-weather-home">/, section + '<section class="section" data-generated="international-country-special-weather-home">');
  fs.writeFileSync(file, html);
}

for (const page of pages) {
  const dir = path.join(root, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderArticle(page));
}

const hubDir = path.join(root, hub.slug);
fs.mkdirSync(hubDir, { recursive: true });
fs.writeFileSync(path.join(hubDir, 'index.html'), renderHub());

updateArticlesIndex();
updateHome();
const total = rebuildContentIndexAndSitemap();
console.log(JSON.stringify({ pages: pages.length, hub: hub.slug, indexedUrls: total }, null, 2));

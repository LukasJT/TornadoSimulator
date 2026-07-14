import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';
const ad300Key = '1fe957d85bb2cf92027de309038cd17b';
const sideRailKey = 'da8c75671b236383c52eb13078c2a148';

const sources = {
  australia: [
    ['Bureau of Meteorology severe weather knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/severe-weather-knowledge-centre'],
    ['Bureau of Meteorology flood knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/flood-knowledge-centre'],
    ['Bureau of Meteorology fire weather knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/fire-weather-knowledge-centre'],
    ['Bureau of Meteorology tropical cyclone information', 'https://www.bom.gov.au/weather-and-climate/specialised-forecasts-and-observations/tropical-cyclone'],
    ['Bureau of Meteorology climate change monitoring', 'https://www.bom.gov.au/climate/change/']
  ],
  finland: [
    ['Finnish Meteorological Institute warning information', 'https://en.ilmatieteenlaitos.fi/information-on-warnings'],
    ['FMI severe thunderstorm warning criteria', 'https://en.ilmatieteenlaitos.fi/severe-thunderstorm-warning'],
    ['FMI wind warnings', 'https://en.ilmatieteenlaitos.fi/wind-warnings'],
    ['FMI hot and cold weather warnings', 'https://en.ilmatieteenlaitos.fi/warnings-on-hot-and-cold-weather'],
    ['FMI marine weather and Baltic Sea observations', 'https://en.ilmatieteenlaitos.fi/marine-weather-and-baltic-sea']
  ],
  sweden: [
    ['SMHI warnings and advisories', 'https://www.smhi.se/en/weather/warnings-and-forecasts/warnings-and-advisories'],
    ['SMHI radar and satellite', 'https://www.smhi.se/en/weather/radar-and-satellite'],
    ['SMHI observations', 'https://www.smhi.se/en/weather/observations'],
    ['SMHI sea weather', 'https://www.smhi.se/en/weather/sea-weather'],
    ['Meteoalarm Sweden', 'https://meteoalarm.org/en/live/region/SE']
  ],
  latvia: [
    ['Latvia weather warnings', 'https://warnings.meteo.lv/'],
    ['Meteoalarm Latvia', 'https://meteoalarm.org/en/live/region/LV'],
    ['Latvian Environment, Geology and Meteorology Centre', 'https://videscentrs.lvgmc.lv/'],
    ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/'],
    ['ESWD live severe weather database', 'https://www.eswd.eu/']
  ],
  europe: [
    ['European Severe Weather Database', 'https://www.essl.org/cms/european-severe-weather-database/'],
    ['ESWD live severe weather database', 'https://www.eswd.eu/'],
    ['Meteoalarm Europe', 'https://meteoalarm.org/'],
    ['Bureau of Meteorology severe weather knowledge centre', 'https://www.bom.gov.au/resources/learn-and-explore/severe-weather-knowledge-centre'],
    ['Finnish Meteorological Institute warning information', 'https://en.ilmatieteenlaitos.fi/information-on-warnings']
  ]
};

const profiles = {
  europe: {
    country: 'Europe',
    adjective: 'European',
    region: 'European warning and severe-weather reporting systems, plus country-specific agencies in Australia, Finland, Sweden, and Latvia',
    agency: 'national meteorological services and Meteoalarm',
    warningShort: 'national and Meteoalarm warnings',
    climateFrame: 'a cross-border warning environment where national meteorological services issue live alerts while regional tools such as Meteoalarm and ESWD help readers compare hazards and severe-storm reports across countries',
    mainHazards: ['severe thunderstorms', 'windstorms', 'river flooding', 'coastal flooding', 'winter storms', 'heat waves', 'wildfire weather', 'marine hazards'],
    seasonalRows: [
      ['Winter', 'Windstorms, snow, ice, coastal water levels, road weather, sea conditions, and cold-related health risk.'],
      ['Spring', 'Flooding from rain or snowmelt, early thunderstorms, dry spells, and rapidly changing travel conditions.'],
      ['Summer', 'Thunderstorms, heat, wildfire weather, heavy rain, hail, lightning, waterspouts, and outdoor-event risk.'],
      ['Autumn', 'Deep low-pressure systems, wind, coastal impacts, prolonged rain, first winter transitions, and darker travel windows.']
    ],
    warningText: [
      'International weather pages need a two-layer warning model. The first layer is local: the national meteorological agency and local emergency services issue the instructions people should act on. The second layer is regional: cross-border portals and databases help readers understand how a storm system or severe-weather pattern fits into a wider area.',
      'That distinction keeps the pages practical. Tornado Hub can compare Australia, Finland, Sweden, and Latvia, but a reader making a live decision should always return to the official warning service for the country, municipality, road network, ferry route, or coastal zone involved.'
    ],
    tornadoText: [
      'Outside the United States, tornado risk is often communicated as part of severe thunderstorm risk rather than as a stand-alone warning culture. That makes explanation important: a reader may need to understand damaging thunderstorm wind, hail, waterspouts, and rotation even if the live alert does not use the word tornado.',
      'European severe-weather reporting is especially useful for historical context. ESWD helps document severe convective events after they happen, while national warning services handle the real-time decision layer before and during the event.'
    ],
    forecastText: [
      'The best international forecast habit is to compare scale. A national warning shows official action guidance; radar and satellite show timing and storm evolution; a regional portal shows cross-border context; a severe-weather database helps with post-event learning.',
      'Readers should also compare hazard type. A yellow thunderstorm warning, an orange wind warning, a flood alert, and a marine wave warning may all affect the same person, but each one changes a different decision: shelter, delay travel, avoid water, secure property, or monitor official updates.'
    ],
    checklist: ['Start with the national weather agency for the country you are in.', 'Use Meteoalarm for cross-border context in Europe.', 'Use ESWD for severe-weather research after events, not live warnings.', 'Separate tornado curiosity from the broader severe thunderstorm safety plan.', 'Check whether the hazard is wind, water, heat, cold, fire weather, or marine exposure.']
  },
  australia: {
    country: 'Australia',
    adjective: 'Australian',
    region: 'Australia and the surrounding tropical, subtropical, temperate, coastal, inland, and alpine weather zones',
    agency: 'Bureau of Meteorology',
    warningShort: 'BoM warnings',
    climateFrame: 'a continent-scale weather setup where tropical oceans, desert heat, Southern Ocean fronts, east coast lows, monsoon lows, and local thunderstorms can all become the dominant risk depending on location and season',
    mainHazards: ['severe thunderstorms', 'tropical cyclones', 'flash flooding', 'river flooding', 'heat waves', 'bushfire weather', 'damaging coastal surf', 'alpine blizzards'],
    seasonalRows: [
      ['Summer', 'Heat, severe thunderstorms, flash flooding, tropical cyclones in the north, bushfire weather during hot windy spells.'],
      ['Autumn', 'Late-season cyclones, heavy rain events, coastal lows, severe thunderstorms, and changing fire-weather patterns.'],
      ['Winter', 'Cold fronts, damaging winds, alpine snow and blizzards, east coast lows, coastal erosion, and large surf.'],
      ['Spring', 'Severe thunderstorms, hail, gusty outflows, renewed heat, dry lightning, and early-season tropical moisture intrusions.']
    ],
    warningText: [
      'Australia needs a national guide because the same headline word can mean very different things by region. A severe thunderstorm near Brisbane, a tropical cyclone on the northwest shelf, a hot northwesterly wind change in South Australia, and a winter front crossing Tasmania are all dangerous, but they do not ask for the same plan.',
      'The Bureau of Meteorology groups many high-impact events under severe weather, including damaging winds, large hail, tornadoes, heavy rain, storm surge, surf, tides, and alpine blizzards. That broad framing is useful for public safety because the dangerous part of the day may be water, heat, wind, lightning, or fire weather rather than a single dramatic storm image.'
    ],
    tornadoText: [
      'Tornadoes do occur in Australia, but the public risk is usually communicated through severe thunderstorm and severe weather products rather than through a dedicated United States-style tornado-warning culture. That means readers should watch for language about destructive winds, very large hail, rotation, supercells, and fast-changing thunderstorm lines.',
      'For Tornado Hub readers, the practical lesson is not to ask whether Australia is a tornado country in the same way the central United States is. The better question is whether the day has the ingredients for localized violent wind: instability, lift, strong wind shear, and storms that can remain organized long enough to concentrate damage.'
    ],
    forecastText: [
      'BoM rainfall, river, fire weather, coastal, tropical cyclone, and severe thunderstorm services should be treated as the decision layer. A local social post or radar screenshot can be helpful, but official warnings are the stable reference for action.',
      'For flood decisions, BoM combines rainfall and streamflow observations, weather prediction, and hydrologic models. That matters in Australia because river flooding may continue after the sky clears, while flash flooding can peak before people have time to leave low crossings.'
    ],
    checklist: ['Know your local warning page before storm season.', 'Treat flooded roads as closed roads.', 'Have a heat and power-outage plan, not only a storm plan.', 'Use cyclone evacuation advice early in northern coastal regions.', 'Track fire weather warnings on hot, dry, windy days.']
  },
  finland: {
    country: 'Finland',
    adjective: 'Finnish',
    region: 'Finland, Lapland, the lake districts, the Gulf of Finland, the Gulf of Bothnia, and Baltic Sea travel corridors',
    agency: 'Finnish Meteorological Institute',
    warningShort: 'FMI warnings',
    climateFrame: 'a northern climate where winter road weather, Baltic marine hazards, severe thunderstorm gusts, heavy rain, fire weather, heat episodes, and long cold spells can each become the main safety issue',
    mainHazards: ['severe thunderstorm gusts', 'heavy rain', 'winter storms', 'wind chill', 'traffic weather', 'wildfire weather', 'Baltic Sea wind and waves', 'sea level changes'],
    seasonalRows: [
      ['Winter', 'Snow, ice, wind chill, difficult road weather, sea ice, coastal wind, and occasional storm-force marine conditions.'],
      ['Spring', 'Freeze-thaw travel problems, river ice and meltwater concerns, early wildfire weather when fuels dry, and changing lake ice safety.'],
      ['Summer', 'Severe thunderstorm gusts, lightning, heavy rain, heat warnings, wildfire weather, and lake or Baltic boating hazards.'],
      ['Autumn', 'Deep low-pressure systems, strong winds, heavy rain, darker commutes, colder roads, and rising Baltic wave risk.']
    ],
    warningText: [
      'Finland needs its own weather-risk guide because the most important hazard changes sharply with season. A winter travel warning, a severe thunderstorm gust warning, a wildfire warning, and a Baltic Sea wave warning all belong to the same national warning ecosystem, but each one changes daily behavior in a different way.',
      'The Finnish Meteorological Institute monitors weather continuously and uses a color scale from green through yellow, orange, and red. That makes the warning color a fast first signal, while the detailed text tells you whether the problem is wind, rain, road conditions, heat, cold, wildfire risk, sea level, waves, icing, or flooding.'
    ],
    tornadoText: [
      'Finland is not known for frequent violent tornado outbreaks, but severe convection still matters. FMI severe thunderstorm warnings focus on thunderstorm wind gusts, with escalating levels tied to gust intensity. A storm does not need a long-track tornado to damage trees, power lines, roofs, campsites, lakeside cabins, and outdoor events.',
      'The Tornado Hub angle for Finland is to treat tornadoes, waterspouts, and damaging thunderstorm gusts as part of the same convective-weather family. When a warm humid air mass, a front, and strong winds aloft overlap, localized wind damage can occur quickly even in a country where winter hazards dominate public memory.'
    ],
    forecastText: [
      'FMI wind warnings separate land and sea needs. Marine users often care about average wind and waves, while people inland care about gusts and falling trees. That difference is crucial for ferry travel, small craft, lakes, coastal roads, and forested neighborhoods.',
      'The Baltic Sea observation network also matters because marine weather is not just wind on a forecast map. Visibility, sea level, wave height, ice, water temperature, and coastal station observations all influence whether travel is routine or risky.'
    ],
    checklist: ['Check FMI warning colors and the hazard type, not only the color.', 'Plan winter road trips around road-weather timing and darkness.', 'Respect severe thunderstorm gust warnings around forests and lakes.', 'Use Baltic Sea forecasts before ferry, boating, or coastal plans.', 'Treat heat and wildfire warnings as serious summer hazards.']
  },
  sweden: {
    country: 'Sweden',
    adjective: 'Swedish',
    region: 'Sweden from Skane and the west coast to Stockholm, Norrland, the mountains, the Baltic coast, and large inland lake regions',
    agency: 'Swedish Meteorological and Hydrological Institute',
    warningShort: 'SMHI warnings',
    climateFrame: 'a long north-south country where coastal lows, Baltic and North Sea wind, snow, ice, forest fire weather, heavy rain, and localized severe thunderstorms interact with very different local geography',
    mainHazards: ['windstorms', 'snow and ice', 'heavy rain', 'river and urban flooding', 'forest fire weather', 'coastal and lake waves', 'severe thunderstorms', 'heat episodes'],
    seasonalRows: [
      ['Winter', 'Snow, ice, low visibility, strong winds, coastal effects, mountain conditions, and travel disruption.'],
      ['Spring', 'Snowmelt, river rises, frost swings, early fire weather, and changing road conditions.'],
      ['Summer', 'Thunderstorms, heavy rain, lightning, heat, forest fire weather, and lake or coastal recreation risk.'],
      ['Autumn', 'Windstorms, waves, heavy rain, dark commutes, first ice, and fast-changing low-pressure systems.']
    ],
    warningText: [
      'Sweden needs a country guide because weather risk is stretched across a long map. A storm that is mostly a coastal wind and wave event near the west coast can be a snow and road problem farther north, while a summer thunderstorm can become a localized flood or power-outage problem without affecting the whole country.',
      'SMHI warning pages, radar, satellite, sea-weather products, and observation networks are the practical backbone. Radar helps track rain and snow with high time and space detail, while satellite imagery shows wider cloud systems and storm evolution. Both matter when localized rain or snow bands decide who gets the impact.'
    ],
    tornadoText: [
      'Sweden can have severe thunderstorms, waterspouts, and occasional tornado reports, but the day-to-day public safety issue is often damaging wind, lightning, hail, heavy rain, or falling trees. The European Severe Weather Database is useful context because it collects severe convective reports across Europe, including events that may be too localized for casual memory.',
      'For readers used to U.S. tornado culture, the Swedish lesson is that low-frequency tornado risk should not make people ignore convective wind. A fast-moving thunderstorm line, a bowing segment on radar, or a storm over warm coastal water can create a narrow damage path that feels tornado-like to residents even when the official classification is different.'
    ],
    forecastText: [
      'SMHI sea-weather material highlights wind, waves, temperature, precipitation, observations, and forecasts for maritime users. That matters for a country where ferry routes, coastal cities, fishing, lakes, and archipelagos turn wind direction and wave growth into practical safety details.',
      'Observation systems are also part of the story. Weather stations, radar, satellites, balloons, buoys, and ships all help forecasters build the picture that eventually becomes a warning, a forecast map, or a local travel decision.'
    ],
    checklist: ['Use SMHI warnings as the main decision source.', 'Watch both radar and forecast text during heavy-rain setups.', 'Plan around wind and wave forecasts before coastal or lake travel.', 'Treat forest fire weather and heat as summer safety issues.', 'Check mountain and northern conditions separately from southern forecasts.']
  },
  latvia: {
    country: 'Latvia',
    adjective: 'Latvian',
    region: 'Latvia, Riga, the Gulf of Riga, Baltic coastal districts, inland forests, rivers, farmland, and neighboring Baltic weather corridors',
    agency: 'Latvian Environment, Geology and Meteorology Centre',
    warningShort: 'Latvian warning services',
    climateFrame: 'a Baltic climate where windstorms, heavy rain, river flooding, coastal water levels, winter ice and snow, thunderstorms, drought, heat, and forest fire weather can rotate through the year',
    mainHazards: ['Baltic windstorms', 'heavy rain', 'river flooding', 'coastal flooding', 'winter snow and ice', 'thunderstorms', 'heat and drought', 'forest fire weather'],
    seasonalRows: [
      ['Winter', 'Snow, ice, freezing rain, wind, coastal water-level changes, and difficult road conditions.'],
      ['Spring', 'Flood-prone rivers, snowmelt, saturated ground, changing temperatures, and early dry spells.'],
      ['Summer', 'Thunderstorms, heavy rain, heat, drought stress, lightning, local wind damage, and forest fire risk.'],
      ['Autumn', 'Baltic lows, windstorms, coastal flooding, prolonged rain, darker travel, and first winter transitions.']
    ],
    warningText: [
      'Latvia deserves a focused page because Baltic weather can be both regional and local. A low-pressure system moving through the Baltic Sea may produce wind, coastal water-level issues, and rain over a broad area, while summer thunderstorms can create street flooding, lightning, or wind damage in a much narrower corridor.',
      'The Latvian warning portal and Meteoalarm give readers an awareness-level view of current hazards. The useful habit is to read both the color and the hazard type: wind, rain, thunderstorm, heat, cold, snow, ice, flooding, or coastal effects require different plans.',
      'Latvia pages also need to account for exposure. A warning may affect Riga commuters, coastal residents, rural forests, river valleys, farms, ports, or winter roads in different ways. Good weather planning starts by asking which specific place and activity the warning changes.'
    ],
    tornadoText: [
      'Latvia is not a high-frequency tornado destination, but the Baltic region can produce waterspouts, small tornadoes, funnel clouds, and damaging convective wind events. That makes European severe-weather reporting valuable: it helps separate actual tornado reports from wind damage, hail, lightning, and heavy-rain impacts.',
      'For Tornado Hub readers, Latvia is a good example of low-frequency but nonzero tornado risk. The safer mental model is to track severe thunderstorm ingredients and official alerts instead of waiting for a familiar U.S.-style tornado warning workflow.'
    ],
    forecastText: [
      'Latvian warnings, Meteoalarm, and regional observation data should be used together. Meteoalarm gives a cross-border view, while local services provide the country-specific warning language and practical details.',
      'The European Severe Weather Database is a useful research layer, not a replacement for live warnings. It helps document severe convective reports after events, which is important for understanding what kinds of storms have happened in Latvia and nearby Baltic countries.'
    ],
    checklist: ['Check warnings.meteo.lv and Meteoalarm before stormy travel days.', 'Treat Baltic wind and coastal water-level risk as separate from ordinary rain.', 'Avoid flooded roads and underpasses during heavy rain.', 'Plan for winter ice and freezing rain on roads and sidewalks.', 'Use ESWD as a historical severe-weather research source, not a live alert.']
  }
};

const pages = [
  {
    slug: 'international-weather-risk-guides',
    profile: 'europe',
    country: 'International',
    category: 'International Weather',
    title: 'International Weather Risk Guides: Australia, Finland, Sweden, Latvia, and Europe',
    description: 'A country-by-country weather risk hub for Australia, Finland, Sweden, and Latvia, with official warning sources, severe storm context, and practical safety links.',
    lede: 'Weather risk does not translate cleanly from one country to another. This hub organizes Tornado Hub country guides for Australia, Finland, Sweden, and Latvia so readers can compare warnings, seasonal hazards, tornado context, and official sources without pretending every place works like the central United States.',
    quick: 'Use this hub as the international starting point: Australia for cyclone, flood, heat, bushfire, and severe thunderstorm risk; Finland for winter, Baltic marine, severe thunderstorm gust, and warning-color literacy; Sweden for wind, snow, coastal, radar, and forest-fire context; Latvia for Baltic wind, flood, winter, and European severe-storm reporting.',
    figureTitle: 'Country guide map',
    figureSubtitle: 'Four focused country clusters plus European severe-storm context',
    takeaways: [
      'Official national weather agencies should be the decision source for warnings.',
      'Tornado risk outside the United States is often embedded in broader severe thunderstorm or severe weather products.',
      'Country pages should teach local hazards first, then connect them back to tornado science.',
      'Baltic and Australian weather both need water-focused planning: coastal water, river flooding, flash flooding, and marine wind.',
      'International SEO improves when each page has a clear country, season, hazard, and source structure.'
    ],
    sections: [
      ['Why an international weather hub helps', [
        'Readers search by country when they want practical answers: Does Australia get tornadoes? What are Finland warning colors? How do Swedish radar maps fit severe weather decisions? What should someone in Latvia check during a Baltic windstorm? A single hub helps those searches land on organized, useful pages instead of scattered short articles.',
        'The goal is not to force every country into one tornado template. The goal is to explain the local warning system and the local hazard mix, then show where tornadoes, waterspouts, severe thunderstorm winds, hail, lightning, and flooding fit inside that bigger weather picture.'
      ]],
      ['How to read these pages', [
        'Each guide starts with the local weather pattern, then moves into seasonal hazards, severe-storm context, official warning sources, and practical decisions. That order matters because tornadoes are only one part of public safety. In many countries, wind, water, heat, winter travel, or wildfire weather will be the more common threat.',
        'Use the guides for education and planning, then switch to the official live warning source when weather is happening. Tornado Hub can explain how to think about the risk, but national agencies issue the warnings people should act on.'
      ]],
      ['Where tornado science fits', [
        'Tornado science still belongs in the international pages. Supercells, wind shear, instability, lifting boundaries, radar interpretation, damage surveys, and warning behavior are useful everywhere. What changes is the frequency, the public-alert vocabulary, the observation network, and the hazards that dominate headlines.',
        'This is why the country pages also link back to broader Tornado Hub explainers on Europe, storm surge, flood safety, severe thunderstorm warnings, radar, and the simulator. Good internal linking helps readers move from a country question to the deeper science behind the answer.'
      ]]
    ],
    related: ['/australia-weather-risk-guide/', '/finland-weather-risk-guide/', '/sweden-weather-risk-guide/', '/latvia-weather-risk-guide/', '/tornadoes-in-europe/', '/weather-extremes-guides/'],
    faqs: [
      ['Are these pages live warnings?', 'No. They are educational guides. Use the official national warning service for real-time alerts.'],
      ['Why include tornadoes on country weather pages?', 'Because tornadoes, waterspouts, damaging thunderstorm gusts, hail, lightning, and flash flooding often share severe-storm ingredients.'],
      ['Which countries are covered first?', 'This batch focuses on Australia, Finland, Sweden, and Latvia, with cross-links to European severe-weather sources.']
    ],
    sourceKeys: ['australia', 'finland', 'sweden', 'latvia', 'europe']
  },
  {
    slug: 'australia-weather-risk-guide',
    profile: 'australia',
    category: 'Australia Weather',
    title: 'Australia Weather Risk Guide: Severe Storms, Cyclones, Floods, Heat, Fire Weather, and Tornadoes',
    description: 'A science-based Australia weather risk guide covering severe thunderstorms, tornadoes, tropical cyclones, floods, heat, bushfire weather, coastal hazards, and official BoM sources.',
    lede: 'Australia is not one weather market. It is a continent where tropical cyclones, monsoon lows, desert heat, Southern Ocean fronts, east coast lows, severe thunderstorms, flash flooding, river flooding, damaging surf, and bushfire weather can all become the lead story depending on where you live.',
    quick: 'For Australia, treat weather risk as a seasonal and regional problem. Follow Bureau of Meteorology warnings, watch severe thunderstorm days for damaging wind, hail, intense rain, and possible tornadoes, and build plans for cyclones, floods, heat, and fire weather before the hazard is on top of you.',
    figureTitle: 'Australia risk layers',
    figureSubtitle: 'Tropical north, inland heat, southeast storms, coasts, rivers, and alpine hazards',
    takeaways: [
      'BoM is the key official source for warnings and hazard information.',
      'Tornadoes can occur, but they are usually part of a broader severe thunderstorm setup.',
      'Water is a major risk: flash flooding, river flooding, storm surge, coastal flooding, and dangerous surf.',
      'Heat and bushfire weather need their own plans because they may not look dramatic on radar.',
      'Tropical cyclone impacts can extend inland through flooding, wind, and post-landfall rain.'
    ],
    sections: [
      ['The Australian hazard mix', [
        'Australia has a wide weather range because warm oceans, dry interior air, mountain ranges, monsoon moisture, coastal boundaries, and fast-moving mid-latitude systems all interact. A summer day can produce a severe thunderstorm in one state, dangerous fire weather in another, and a tropical cyclone threat far to the north.',
        'That variety is why a single severe-weather habit is not enough. A household in northern Queensland may need cyclone supplies and flood awareness, while a household in Victoria may care more about wind changes, heat, smoke, thunderstorms, and winter cold fronts.'
      ]],
      ['Severe thunderstorms and tornado potential', [
        'The Bureau of Meteorology includes tornadoes within its severe-weather education, but most Australian readers will encounter tornado risk through severe thunderstorm language. Watch for destructive wind, very large hail, intense rain, supercell structure, and storm-scale rotation when storms become organized.',
        'The safest framing is ingredient-based. If the air is unstable, moisture is present, a front or trough provides lift, and winds change speed or direction with height, storms can become more dangerous than ordinary summer thunder. Tornadoes are uncommon compared with the United States, but localized wind damage is a real Australian hazard.'
      ]],
      ['Cyclones, floods, and water hazards', [
        'Tropical cyclones are not just wind events. Storm surge, coastal inundation, extreme rain, river flooding, road cutoffs, and long power outages can become the main impact. Inland communities can still face dangerous flooding after a cyclone weakens.',
        'Flooding in Australia has multiple forms. Flash flooding can occur within hours of intense rain, river flooding can build and last, and coastal water can rise during storms. The right action depends on timing: never drive into floodwater, and do not assume a clearing sky means rivers are already safe.'
      ]],
      ['Heat and fire weather', [
        'Heat is one of Australia biggest recurring hazards because it stresses people, animals, power systems, roads, and health services. Warm nights are especially important because bodies and buildings get less time to cool down.',
        'Bushfire weather combines fuel condition with hot, dry, windy air and wind changes. A fire-weather warning is not a scenic forecast; it is a planning signal. People should know local emergency advice, evacuation routes, power-backup limits, smoke exposure issues, and how warnings may change through the day.'
      ]]
    ],
    related: ['/australia-tornadoes-severe-thunderstorms-guide/', '/australia-cyclone-flood-heat-bushfire-guide/', '/storm-surge-explained/', '/flash-flood-safety/', '/tornadoes-around-the-world/'],
    faqs: [
      ['Does Australia get tornadoes?', 'Yes. Tornadoes can occur in Australia, usually as part of severe thunderstorm setups. They are much less central to public warning culture than in the United States.'],
      ['What is the main official source for Australian warnings?', 'Use the Bureau of Meteorology and local emergency services for live warning decisions.'],
      ['Are cyclones only coastal hazards?', 'No. Cyclones can create inland flooding, wind damage, transport disruption, and long recovery problems after landfall.']
    ]
  },
  {
    slug: 'australia-tornadoes-severe-thunderstorms-guide',
    profile: 'australia',
    category: 'Australia Weather',
    title: 'Australia Tornadoes and Severe Thunderstorms Guide: Supercells, Hail, Damaging Wind, and Warnings',
    description: 'A detailed guide to Australian tornadoes and severe thunderstorms, including supercells, hail, damaging winds, flash flooding, radar clues, and BoM warning habits.',
    lede: 'Australia severe thunderstorms can produce the same family of hazards that storm spotters study elsewhere: damaging gusts, large hail, intense rain, frequent lightning, rotating storms, waterspouts, and occasional tornadoes. The difference is how the risk is communicated and how quickly people recognize the day as dangerous.',
    quick: 'Australian tornado awareness should start with severe thunderstorm awareness. If storms are warned for destructive wind, giant hail, intense rain, or supercell structure, treat the day as capable of localized high-end damage even if the word tornado never appears in your app.',
    figureTitle: 'Severe thunderstorm ingredients',
    figureSubtitle: 'Moisture, lift, instability, wind shear, and storm organization',
    takeaways: [
      'Tornadoes are possible in Australia, but damaging wind and hail are more common severe storm impacts.',
      'Supercells matter because they can organize hail, wind, rain, and rotation into a smaller but more intense damage corridor.',
      'Radar screenshots are useful only when paired with official warnings and local observations.',
      'Flash flooding can be the deadliest part of a severe thunderstorm day.',
      'Outdoor events, schools, worksites, and drivers need warning routines before storm season.'
    ],
    sections: [
      ['What makes an Australian severe thunderstorm dangerous', [
        'A severe thunderstorm is not just a louder thunderstorm. It can organize wind, water, and ice into hazards that damage roofs, trees, power lines, vehicles, crops, and roads. The storms that deserve the most attention are the ones that remain organized, move into populated corridors, or train over the same area.',
        'Australia has several storm environments. Inland heat troughs, sea breezes, drylines, cold fronts, upper-level disturbances, and tropical moisture can each provide lift. When those boundaries overlap with unstable air and stronger winds aloft, a storm can become severe quickly.'
      ]],
      ['Tornadoes, waterspouts, and rotation', [
        'Australian tornadoes can form from supercells, squall lines, or smaller storm-scale circulations. Waterspouts can occur near coasts and lakes, and some may move ashore. The main public challenge is that a brief tornado may be embedded in rain or hidden by terrain, buildings, trees, or darkness.',
        'Rotation is not the only danger sign. A storm can produce destructive straight-line wind without a tornado, and those winds can still bring down trees and power lines across a wider swath. Treat thunderstorm wind warnings as action messages, not as lesser warnings.'
      ]],
      ['Hail and flash flooding', [
        'Large hail is a classic Australian severe storm hazard because strong updrafts can hold hailstones aloft long enough for them to grow. Hail damages cars, roofs, skylights, crops, and solar panels. Indoors is safer than any attempt to protect property while hail is falling.',
        'Intense rain can create flash flooding in streets, creeks, underpasses, and low crossings. The most dangerous choice is often driving into water because depth, current, and road damage are hard to judge from a vehicle.'
      ]],
      ['How to use BoM products on storm days', [
        'Start with official warnings, then use radar and satellite as situational awareness. Radar shows where precipitation cores are, but it does not automatically tell you which street is safe, which tree will fail, or whether a road is already flooded.',
        'A good routine is to decide your shelter location, parking choice, outdoor-event cutoff, and travel delay rule before storms arrive. The worst time to invent a storm plan is when thunder, traffic, and push alerts are already competing for attention.'
      ]]
    ],
    related: ['/australia-weather-risk-guide/', '/rain-wrapped-tornado/', '/tornado-debris-signature/', '/flash-flood-watch-vs-warning/', '/hail-damage-car-guide/'],
    faqs: [
      ['Are Australian tornadoes always visible?', 'No. They can be rain-wrapped, brief, obscured by terrain, or hidden after dark.'],
      ['Is straight-line wind less dangerous than a tornado?', 'Not necessarily. Severe thunderstorm gusts can damage roofs, trees, power lines, vehicles, and outdoor structures.'],
      ['Should I chase storms in Australia?', 'Only trained, safety-focused observers should consider field work. Most people are safer using official warnings and sheltering early.']
    ]
  },
  {
    slug: 'australia-cyclone-flood-heat-bushfire-guide',
    profile: 'australia',
    category: 'Australia Weather',
    title: 'Australia Cyclone, Flood, Heat, and Bushfire Weather Guide',
    description: 'A practical Australia guide to tropical cyclones, flood forecasting, heat waves, bushfire weather, coastal hazards, and how these risks can compound.',
    lede: 'Australia weather risk is often compound. A cyclone can become a flood emergency, a heat wave can intensify fire weather, a thunderstorm can create dry lightning, and a coastal low can combine rain, surf, wind, and erosion. The safest plans treat hazards as connected instead of separate checkboxes.',
    quick: 'For Australia, plan around compound risk: cyclone plus flood, heat plus power stress, fire weather plus wind change, and coastal low plus wave and rain impacts. Use BoM warnings first, then local emergency instructions for evacuation, shelter, and road closures.',
    figureTitle: 'Compound Australian hazards',
    figureSubtitle: 'Wind, water, heat, fire weather, and coastal impacts can overlap',
    takeaways: [
      'Cyclone impacts include wind, surge, rain, flooding, road cutoffs, and long outages.',
      'Flood forecasts are built from observations, rainfall forecasts, streamflow, and hydrologic modeling.',
      'Heat and bushfire weather can be life-threatening without a dramatic storm cloud.',
      'Coastal lows and strong swells can create dangerous surf and erosion far from the storm center.',
      'Preparation should include power, water, communications, medications, pets, and evacuation timing.'
    ],
    sections: [
      ['Tropical cyclones as multi-hazard events', [
        'A tropical cyclone can look like a wind problem on a map, but the biggest impacts may come from water and isolation. Surge and coastal flooding threaten low-lying areas, heavy rain can flood rivers and towns, and road cutoffs can isolate communities after the strongest winds are gone.',
        'The category tells only part of the story. Storm size, forward speed, track angle, tide timing, rainfall footprint, terrain, and local drainage can decide whether the worst impact is wind damage, surge, inland flooding, or a prolonged supply problem.'
      ]],
      ['Flooding before, during, and after rain', [
        'Australia flood risk can be fast or slow. Flash flooding can occur within hours in urban streets, steep catchments, and low crossings. River flooding may develop later and remain dangerous after rain ends.',
        'BoM flood services combine observations, numerical weather prediction, streamflow, and hydrologic models. That process matters because people often judge flood risk by what is happening above their own house, while rivers respond to rain over the whole catchment.'
      ]],
      ['Heat waves and fire weather', [
        'Heat safety is not only about the maximum temperature. Humidity, hot nights, age, outdoor work, medications, housing, and power reliability all shape risk. People need a cooling plan before the hottest afternoon, especially if air conditioning, transport, or medical devices depend on electricity.',
        'Fire weather is a meteorological hazard even before a fire starts. Hot dry air, strong winds, dry fuels, lightning, and wind changes can turn a small ignition into a fast-moving emergency. Warnings and local fire-agency advice should drive decisions.'
      ]],
      ['Coastal lows, surf, and erosion', [
        'Australia coastal risk is not limited to tropical cyclone landfalls. East coast lows, strong fronts, pressure gradients, and distant swells can produce dangerous surf, coastal erosion, flooding, and marine hazards.',
        'For coastal communities, the practical plan is to watch both weather and water: wind direction, waves, tides, rainfall, river outlets, beach closures, and local emergency advice. A weather system offshore can still affect roads, cliffs, marinas, and low-lying neighborhoods.'
      ]]
    ],
    related: ['/australia-weather-risk-guide/', '/storm-surge-explained/', '/flash-flood-safety/', '/heat-index-danger-levels/', '/wildfire-smoke-weather-guide/'],
    faqs: [
      ['Why can a weakening cyclone still be dangerous?', 'Because heavy rain, river flooding, storm surge, road cutoffs, and power outages can continue after peak wind weakens.'],
      ['What is the safest flood rule?', 'Do not drive through floodwater. Turn around and use official road-closure information.'],
      ['Is fire weather a weather warning or a fire warning?', 'It is both a weather-driven risk and an emergency-management issue. Use BoM weather warnings and local fire authority instructions together.']
    ]
  },
  {
    slug: 'finland-weather-risk-guide',
    profile: 'finland',
    category: 'Finland Weather',
    title: 'Finland Weather Risk Guide: FMI Warnings, Winter Storms, Thunderstorm Gusts, Baltic Weather, Heat, and Cold',
    description: 'A science-based Finland weather guide covering FMI warnings, severe thunderstorm gusts, winter storms, wind, heavy rain, Baltic Sea weather, heat, cold, wildfire risk, and road safety.',
    lede: 'Finland weather safety depends on season, terrain, roads, forests, lakes, and the Baltic Sea. The same household may need a winter road plan, a severe thunderstorm plan, a wildfire-weather plan, a heat plan, and a marine-weather habit during different parts of the year.',
    quick: 'For Finland, use FMI warning colors and hazard types together. Winter roads, Baltic wind and waves, severe thunderstorm gusts, heavy rain, heat, cold, wildfire weather, and flooding all use different decision rules.',
    figureTitle: 'Finland warning layers',
    figureSubtitle: 'Winter roads, Baltic marine weather, thunderstorms, heat, cold, and wildfire risk',
    takeaways: [
      'FMI monitors weather continuously and uses green, yellow, orange, and red warning levels.',
      'Severe thunderstorm warnings focus heavily on thunderstorm wind gusts.',
      'Baltic marine weather adds waves, sea level, ice, visibility, and coastal observations.',
      'Winter road weather can be the most practical day-to-day hazard.',
      'Heat, cold, wildfire weather, and heavy rain should not be treated as minor background risks.'
    ],
    sections: [
      ['Why Finland weather risk is seasonal', [
        'Finland hazard awareness changes with the calendar. Winter emphasizes roads, ice, wind chill, darkness, snow, and marine icing. Summer shifts attention to thunderstorms, lightning, heavy rain, heat, wildfire weather, lakes, and outdoor recreation.',
        'That seasonal swing makes warning literacy especially important. A yellow warning in January may change a road trip, while a yellow or orange warning in July may change boating, camping, outdoor work, or power-outage preparation.'
      ]],
      ['FMI warning colors and hazard types', [
        'The Finnish Meteorological Institute uses a color scale that quickly communicates severity, but the color is only the beginning. The hazard type tells you what to do: wind, severe thunderstorm, heavy rain, pedestrian weather, traffic weather, wildfire, heat, cold, UV, sea level, waves, ice accretion, or flooding.',
        'This is the key habit for visitors and residents: do not simply ask whether Finland is under a warning. Ask what kind of warning it is, when it peaks, where it applies, and which activity it affects.'
      ]],
      ['Thunderstorm gusts and tornado context', [
        'FMI severe thunderstorm warnings emphasize gusts, with higher levels for stronger expected wind. That makes sense in a forested northern country where falling trees, power lines, campsites, roads, and lake recreation can all be vulnerable.',
        'Tornadoes and waterspouts are possible but not the everyday severe-weather headline. The practical safety focus is to take organized thunderstorms seriously even when the official language centers on gusts rather than tornadoes.'
      ]],
      ['Baltic Sea and lake-country decisions', [
        'Finland marine weather is a separate layer because wind over water creates different risks than wind over land. Waves, sea level, visibility, ice, water temperature, and coastal observations can decide whether ferry, boating, or coastal travel is sensible.',
        'Large lakes also make weather personal. A thunderstorm that is manageable on land can become dangerous on open water because wind shifts, lightning, and waves reduce escape options.'
      ]]
    ],
    related: ['/finland-thunderstorms-winter-storms-guide/', '/finland-baltic-sea-weather-safety-guide/', '/winter-storm-watch-vs-warning/', '/lightning-at-home-safety/', '/tornadoes-in-europe/'],
    faqs: [
      ['What agency issues Finland weather warnings?', 'The Finnish Meteorological Institute issues national weather warnings.'],
      ['Does Finland have tornadoes?', 'Finland can have tornadoes and waterspouts, but severe thunderstorm gusts, lightning, heavy rain, and winter hazards are more common planning concerns.'],
      ['Why do FMI warnings include road and pedestrian weather?', 'Because winter surfaces, visibility, ice, snow, and wind can create direct travel and walking hazards.']
    ]
  },
  {
    slug: 'finland-thunderstorms-winter-storms-guide',
    profile: 'finland',
    category: 'Finland Weather',
    title: 'Finland Thunderstorms and Winter Storms Guide: Gusts, Lightning, Snow, Ice, and Road Weather',
    description: 'A detailed Finland guide to severe thunderstorm gusts, tornado context, winter storms, snow, ice, traffic weather, wind chill, and practical warning decisions.',
    lede: 'Finland severe weather is a two-season classroom. Summer teaches thunderstorm gusts, lightning, heavy rain, and lake safety. Winter teaches snow, ice, wind chill, visibility, and travel timing. Both seasons reward people who read warnings early instead of waiting for conditions to become obvious.',
    quick: 'In Finland, severe thunderstorm gusts and winter road weather are both action hazards. A summer gust warning can mean tree and power damage, while a winter road warning can mean the highest-risk decision is simply whether to travel.',
    figureTitle: 'Finland storm seasons',
    figureSubtitle: 'Summer convection and winter road weather both need early decisions',
    takeaways: [
      'Severe thunderstorm gust warnings matter because trees, power lines, campsites, and lake users are exposed.',
      'Winter weather risk depends on timing, surface temperature, wind, visibility, and road treatment.',
      'Cold warnings and wind chill affect health and outdoor work decisions.',
      'Heavy rain can cause urban and small-stream flooding even in a country known for winter hazards.',
      'People should set travel and outdoor-event thresholds before the warning peaks.'
    ],
    sections: [
      ['Summer thunderstorm risk', [
        'Finland thunderstorms are often localized, which makes complacency tempting. One city may only hear distant thunder while a nearby forest, road, festival, cabin area, or lake receives damaging gusts, lightning, hail, and heavy rain.',
        'The warning language around gusts is practical because wind is a direct damage mechanism. Trees can fall, boats can be caught far from shore, tents can fail, and power lines can come down even without a confirmed tornado.'
      ]],
      ['Tornado and waterspout awareness', [
        'Finland tornado risk is low compared with the Great Plains, but it is not zero. Waterspouts, funnel clouds, and brief tornadoes can happen when local rotation forms beneath convective clouds or over water.',
        'The useful safety response is not to chase the label. If a severe thunderstorm warning highlights strong gusts or dangerous storms, move indoors, avoid forests and water, and keep distance from windows and electrical hazards.'
      ]],
      ['Winter storm mechanics', [
        'Winter travel risk is not controlled by snowfall totals alone. Temperature near freezing, freezing rain, wind, blowing snow, darkness, road-treatment timing, and traffic density all affect whether a route is safe.',
        'A small amount of ice can be more disruptive than a larger amount of dry snow. Visibility can also fall quickly in blowing snow, especially in open country or near exposed roads.'
      ]],
      ['Cold, heat, and human health', [
        'FMI hot and cold weather warnings are health products as much as forecast products. Outdoor workers, older adults, children, people with health conditions, and people without reliable cooling or heating can be at higher risk.',
        'Cold risk includes wind chill, while heat risk includes nighttime recovery. A household plan should include clothing, medications, transport, heating, cooling, battery backup, and check-ins for vulnerable people.'
      ]]
    ],
    related: ['/finland-weather-risk-guide/', '/finland-baltic-sea-weather-safety-guide/', '/winter-storm-watch-vs-warning/', '/wind-chill-vs-heat-index/', '/lightning-safety-guide/'],
    faqs: [
      ['What do Finland severe thunderstorm warnings focus on?', 'They focus strongly on thunderstorm wind gusts, with higher warning levels for stronger expected gusts.'],
      ['Can winter driving be dangerous without huge snowfall?', 'Yes. Ice, freezing rain, blowing snow, darkness, and road temperature can make modest precipitation dangerous.'],
      ['Should lake users react differently to thunderstorm warnings?', 'Yes. Open water reduces shelter options, so boaters and swimmers should act before storms arrive.']
    ]
  },
  {
    slug: 'finland-baltic-sea-weather-safety-guide',
    profile: 'finland',
    category: 'Finland Weather',
    title: 'Finland Baltic Sea Weather Safety Guide: Wind, Waves, Sea Level, Ice, Visibility, and Coastal Storms',
    description: 'A Finland Baltic Sea weather guide covering FMI marine observations, wind warnings, waves, sea level, ice, visibility, ferry travel, boating, and coastal storm decisions.',
    lede: 'For Finland, the Baltic Sea is a weather hazard layer, not just a backdrop. Wind, waves, sea level, ice, visibility, water temperature, and coastal observations can turn a routine boat trip, ferry crossing, harbor job, or shoreline walk into a risk decision.',
    quick: 'Use Finnish marine forecasts and observations before Baltic or large-lake plans. Land weather can look manageable while waves, visibility, ice, sea level, or gusty coastal wind create a very different risk offshore.',
    figureTitle: 'Baltic marine forecast layers',
    figureSubtitle: 'Wind, waves, sea level, visibility, ice, water temperature, and coastal observations',
    takeaways: [
      'Marine forecasts include more than rain and temperature.',
      'FMI observes coastal stations, lake stations, wave buoys, sea-temperature buoys, and sea-level stations.',
      'Wind over water affects ferries, small craft, harbors, rescue timing, and shoreline safety.',
      'Ice and cold water can make a minor incident life-threatening.',
      'Marine planning should happen before departure, not after conditions worsen.'
    ],
    sections: [
      ['Why marine weather is different', [
        'A forecast that feels acceptable on land can be unsafe on the Baltic Sea because exposure is greater and escape options are fewer. Wind has more room to build waves, visibility can collapse, cold water increases survival risk, and coastal water levels can affect docks, roads, and low shorelines.',
        'This is why marine weather uses its own parameters. Wind, waves, sea level, ice, visibility, precipitation, pressure, air temperature, and water temperature all answer different safety questions.'
      ]],
      ['Observations that matter', [
        'FMI marine observations include coastal and lake stations, wave buoys, sea-temperature buoys, and sea-level stations. Those observations are valuable because local water conditions can differ from a general inland forecast.',
        'Before a trip, compare forecast wind with observed trends. If wind or waves are already higher than expected, the safest interpretation is that the margin is smaller than the forecast headline suggests.'
      ]],
      ['Coastal storms and sea level', [
        'Strong pressure systems can push water toward parts of the coast and raise local sea levels. Combined with waves and wind, that can affect harbors, waterfront paths, causeways, and low-lying shorelines.',
        'Coastal flooding does not need to look like an ocean hurricane to matter. For pedestrians, drivers, harbor workers, and boat owners, a smaller Baltic water-level event can still create practical damage and access problems.'
      ]],
      ['Ice, cold water, and shoulder seasons', [
        'Cold water changes the risk calculation. A fall from a dock, boat, or thin ice surface can become dangerous quickly even when the air temperature does not feel extreme.',
        'Shoulder seasons are especially tricky because land habits may shift faster than water conditions. A mild day can encourage boating or shoreline recreation while water temperature, wind, and ice remain dangerous.'
      ]]
    ],
    related: ['/finland-weather-risk-guide/', '/finland-thunderstorms-winter-storms-guide/', '/sweden-coastal-winter-weather-guide/', '/storm-surge-explained/', '/weather-satellite-guide/'],
    faqs: [
      ['Why check marine weather if I already checked the city forecast?', 'Marine forecasts include waves, sea level, visibility, ice, and coastal wind details that city forecasts may not emphasize.'],
      ['Are waves important on the Baltic Sea?', 'Yes. Wind-driven waves can create hazardous conditions for small craft, ferries, harbors, and shoreline activity.'],
      ['Can cold water be dangerous on a warm day?', 'Yes. Water temperature may lag behind air temperature, especially in spring and early summer.']
    ]
  },
  {
    slug: 'sweden-weather-risk-guide',
    profile: 'sweden',
    category: 'Sweden Weather',
    title: 'Sweden Weather Risk Guide: SMHI Warnings, Windstorms, Snow, Flooding, Thunderstorms, Forest Fire Weather, and Coasts',
    description: 'A science-based Sweden weather guide covering SMHI warnings, radar, satellite, windstorms, snow, flooding, thunderstorms, forest fire weather, coastal hazards, and tornado context.',
    lede: 'Sweden weather risk stretches across a long country with coastlines, mountains, forests, cities, lakes, and northern winter conditions. A useful Sweden guide has to connect SMHI warnings, radar, satellite, observations, marine forecasts, flood awareness, forest fire weather, and severe thunderstorm context.',
    quick: 'For Sweden, start with SMHI warnings, then use radar, satellite, observations, and marine forecasts to understand the timing and local impact. Wind, snow, ice, flooding, thunderstorms, heat, and forest fire weather all deserve separate planning habits.',
    figureTitle: 'Sweden weather layers',
    figureSubtitle: 'North-south climate range, coasts, mountains, forests, lakes, and cities',
    takeaways: [
      'SMHI is the core source for national forecasts, warnings, radar, satellite, observations, and sea weather.',
      'A long country means the same storm system can produce different hazards by region.',
      'Radar and satellite are strongest when used with warning text and local observations.',
      'Coastal and lake weather need wave, wind, and water-level awareness.',
      'Tornado risk is low but severe thunderstorm wind, hail, lightning, and heavy rain matter.'
    ],
    sections: [
      ['Why Sweden needs a country-specific guide', [
        'Sweden weather is organized by geography as much as by season. Southern cities, Baltic islands, west-coast marine zones, inland forests, northern roads, and mountain areas can all experience different versions of the same pressure system.',
        'That is why a national headline should be followed by local interpretation. Wind direction, elevation, snow line, lake influence, coastal exposure, forest cover, and commuting patterns can decide which places see the most impact.'
      ]],
      ['Using SMHI radar, satellite, and observations', [
        'SMHI radar tracks rain and snow with high time and space detail, which helps during showers, heavy rain bands, and winter precipitation. Satellite imagery shows broader cloud systems and the evolution of weather over land and sea.',
        'Observations add ground truth: temperature, wind, humidity, pressure, and precipitation show what is actually happening. Forecasts improve when readers use the three layers together: warning text for action, radar or satellite for timing, and observations for local reality.'
      ]],
      ['Windstorms, winter weather, and flooding', [
        'Sweden windstorms can damage trees, power lines, roofs, rail networks, bridges, ferries, and forests. The risk is not only peak wind speed; saturated soil, leaf-on trees, snow load, and infrastructure exposure can change outcomes.',
        'Flooding can follow heavy rain, snowmelt, ice jams, or repeated wet systems. Urban areas may flood differently from rural rivers, and mountain or northern regions can have timing issues tied to snowpack and thaw.'
      ]],
      ['Thunderstorms and tornado context', [
        'Severe thunderstorms in Sweden are usually discussed through wind, hail, lightning, heavy rain, and localized flooding. Tornadoes and waterspouts are possible, but they are not the central everyday hazard.',
        'For Tornado Hub readers, the important science is storm organization. If radar shows a strong convective line or a persistent intense cell, and warnings highlight severe weather, the safe response is to shelter and protect travel plans regardless of whether a tornado label is used.'
      ]]
    ],
    related: ['/sweden-thunderstorms-windstorms-floods-guide/', '/sweden-coastal-winter-weather-guide/', '/tornadoes-in-europe/', '/weather-radar-guide/', '/winter-storm-watch-vs-warning/'],
    faqs: [
      ['What is Sweden main weather agency?', 'SMHI, the Swedish Meteorological and Hydrological Institute, provides warnings, forecasts, observations, radar, satellite, and sea weather information.'],
      ['Does Sweden get tornadoes?', 'Sweden can have tornadoes and waterspouts, but severe wind, hail, lightning, heavy rain, snow, ice, and coastal storms are more common planning issues.'],
      ['Why use radar and satellite together?', 'Radar gives local precipitation detail, while satellite shows larger cloud systems and storm evolution.']
    ]
  },
  {
    slug: 'sweden-thunderstorms-windstorms-floods-guide',
    profile: 'sweden',
    category: 'Sweden Weather',
    title: 'Sweden Thunderstorms, Windstorms, and Floods Guide',
    description: 'A Sweden severe weather guide for thunderstorms, tornado context, windstorms, heavy rain, river flooding, urban flooding, radar, satellite, and practical safety decisions.',
    lede: 'Sweden severe weather often comes down to three overlapping questions: how strong will the wind be, where will the rain concentrate, and how fast will people recognize a localized thunderstorm or flood threat? The answer depends on forecasts, radar, observations, terrain, coastlines, and season.',
    quick: 'In Sweden, use SMHI warnings plus radar and observations to track thunderstorm wind, heavy rain, windstorms, and flood risk. Local impacts may be narrow, but trees, roads, rail, basements, rivers, and coastal routes can be affected quickly.',
    figureTitle: 'Sweden severe weather pathways',
    figureSubtitle: 'Thunderstorm wind, synoptic windstorms, heavy rain, and flood response',
    takeaways: [
      'Windstorms and thunderstorms can both bring damaging wind, but their timing and footprint differ.',
      'Heavy rain can create urban flooding even when river flooding is not the main headline.',
      'Radar is useful for timing rain bands, but warnings and local observations still drive decisions.',
      'Forests and power networks can be vulnerable when wind follows wet ground or snow load.',
      'European severe-weather databases help document rare tornado and severe convective events.'
    ],
    sections: [
      ['Thunderstorm days in Sweden', [
        'Thunderstorm risk in Sweden is usually localized. A summer setup may bring lightning and heavy rain to one district while another stays mostly dry. That patchiness makes radar useful, but it also makes people underreact if their own sky looks calm early in the day.',
        'A severe thunderstorm can produce wind damage, hail, lightning injury, street flooding, and outdoor-event disruption. The safest habit is to set a shelter threshold based on thunder, warning text, and radar trends before the storm reaches the venue, campsite, worksite, or road.'
      ]],
      ['Windstorms versus thunderstorm gusts', [
        'A large windstorm can affect a broad region for many hours, while a thunderstorm gust can strike a smaller area suddenly. Both can damage trees and power lines, but they require different planning. Windstorm planning focuses on forecasts, power backups, travel disruption, and loose outdoor objects. Thunderstorm planning focuses on rapid shelter and avoiding trees, water, and exposed places.',
        'Wet soil, snow load, and leaf conditions can increase tree-fall risk. That means a wind speed that was manageable in one situation may cause more damage in another.'
      ]],
      ['Heavy rain and flood pathways', [
        'Flood risk in Sweden can come from intense rain, repeated rain, snowmelt, rivers, lakes, or urban drainage limits. The visible storm cloud is only one part of the system; water may continue rising after rain moves away.',
        'For urban flooding, the immediate risk is often underpasses, basements, low roads, and overwhelmed drains. For river flooding, the key information is upstream rainfall, snowmelt, and forecast duration.'
      ]],
      ['European tornado documentation', [
        'Rare tornadoes and waterspouts are best understood through documented reports rather than rumor. The European Severe Weather Database is useful because it collects quality-controlled severe convective events across Europe.',
        'That historical layer helps readers understand that low tornado frequency does not equal zero risk. It also keeps attention on the broader severe-storm family: hail, wind, heavy rain, lightning, and tornadoes.'
      ]]
    ],
    related: ['/sweden-weather-risk-guide/', '/sweden-coastal-winter-weather-guide/', '/tornadoes-in-europe/', '/flash-flood-watch-vs-warning/', '/weather-radar-guide/'],
    faqs: [
      ['Are Sweden windstorms and thunderstorm gusts the same thing?', 'No. Large windstorms are broader and longer-lived, while thunderstorm gusts are localized and faster-changing.'],
      ['Can heavy rain cause flooding in cities?', 'Yes. Intense rain can overwhelm drains, flood underpasses, and damage basements even without major river flooding.'],
      ['Where can rare European tornado reports be studied?', 'The European Severe Weather Database is a useful severe convective storm report source.']
    ]
  },
  {
    slug: 'sweden-coastal-winter-weather-guide',
    profile: 'sweden',
    category: 'Sweden Weather',
    title: 'Sweden Coastal and Winter Weather Guide: Sea Weather, Snow, Ice, Wind, Waves, and Travel',
    description: 'A Sweden coastal and winter weather guide covering SMHI sea weather, wind, waves, snow, ice, road and rail impacts, coastal flooding, and winter storm decisions.',
    lede: 'Sweden coastal and winter weather decisions often overlap. A low-pressure system can bring wind and waves along the coast, snow and ice inland, difficult travel in the north, and water-level or ferry impacts around exposed routes.',
    quick: 'For Swedish coastal and winter weather, check SMHI sea weather, warnings, observations, and local travel information together. Wind, waves, snow, ice, low visibility, and coastal water levels can all change the practical risk.',
    figureTitle: 'Coast and winter overlap',
    figureSubtitle: 'Sea weather, snow, ice, wind, waves, road, rail, and ferry impacts',
    takeaways: [
      'Sea weather adds wind, waves, water temperature, sea level, and maritime observations to the forecast.',
      'Winter impacts depend on surface temperature, timing, snow type, wind, and visibility.',
      'Coastal routes, bridges, ferries, and archipelagos can have different risks from inland towns.',
      'A moderate storm can become high impact when it hits during commuting or holiday travel.',
      'Warnings should be paired with transport updates and local observations.'
    ],
    sections: [
      ['Sea weather as a planning layer', [
        'SMHI sea weather focuses on conditions that matter to maritime users: wind, waves, temperature, precipitation, and observations from buoys, ships, satellites, and coastal stations. That is a different view from a simple city forecast.',
        'People on ferries, small craft, coastal roads, harbors, islands, and bridges need that marine layer because wind direction and wave growth can change safety even when inland rain or snow looks ordinary.'
      ]],
      ['Winter weather timing', [
        'Winter risk depends heavily on timing. Snow during a quiet night can be manageable, while wet snow, freezing rain, or blowing snow during a commute can create a much larger impact.',
        'Temperature near freezing is especially tricky because precipitation type can change over short distances. Roads, rails, sidewalks, and bridges may all respond differently depending on treatment, traffic, shade, and wind.'
      ]],
      ['Wind, waves, and water levels', [
        'Strong winds can build waves and push water toward exposed coastlines. Combined with low pressure and local geography, that can affect docks, coastal paths, harbors, and low-lying access roads.',
        'For coastal planning, do not look only at the rain icon. Wind direction, gusts, wave forecasts, water level, and ferry or bridge notices may be the more important information.'
      ]],
      ['Practical winter readiness', [
        'A Swedish winter plan should include warm clothing, traction, phone power, medication timing, vehicle supplies, safe heating, and the ability to delay travel. A forecast is most useful when it changes behavior before the worst conditions start.',
        'For homes, wind and snow preparation includes securing outdoor objects, clearing drains when safe, preparing for outages, and avoiding damaged trees or power lines after the storm.'
      ]]
    ],
    related: ['/sweden-weather-risk-guide/', '/sweden-thunderstorms-windstorms-floods-guide/', '/finland-baltic-sea-weather-safety-guide/', '/winter-storm-watch-vs-warning/', '/ice-storm-safety/'],
    faqs: [
      ['Why is sea weather separate from regular weather?', 'Marine users need wind, waves, sea level, water temperature, and observations that may not be central in a land forecast.'],
      ['What makes Swedish winter travel risky?', 'Snow, ice, freezing rain, wind, darkness, low visibility, and timing can combine to make travel dangerous.'],
      ['Can coastal weather affect inland plans?', 'Yes. Large systems can bring coastal wind and waves while also producing inland snow, rain, or travel disruption.']
    ]
  },
  {
    slug: 'latvia-weather-risk-guide',
    profile: 'latvia',
    category: 'Latvia Weather',
    title: 'Latvia Weather Risk Guide: Warnings, Baltic Windstorms, Floods, Thunderstorms, Winter Weather, Heat, and Tornado Context',
    description: 'A science-based Latvia weather guide covering official warnings, Meteoalarm, Baltic windstorms, flooding, thunderstorms, winter ice and snow, heat, drought, and tornado context.',
    lede: 'Latvia weather risk sits at the intersection of Baltic wind, coastal water, inland rivers, forests, winter ice, summer thunderstorms, heat, drought, and European severe-storm reporting. A focused guide helps readers separate ordinary unsettled weather from days that require a plan.',
    quick: 'For Latvia, use warnings.meteo.lv, Meteoalarm, and local emergency information for live decisions. Watch Baltic windstorms, heavy rain, river flooding, coastal water levels, winter ice, summer thunderstorms, heat, drought, and rare tornado or waterspout potential.',
    figureTitle: 'Latvia risk layers',
    figureSubtitle: 'Baltic coast, Riga, rivers, forests, farmland, winter roads, and thunderstorms',
    takeaways: [
      'Latvia warnings should be read by hazard type, not just color.',
      'Baltic wind and coastal water-level changes can create impacts beyond ordinary rain.',
      'Heavy rain can create urban flooding, river rises, and difficult travel.',
      'Tornado risk is low but not zero; severe thunderstorm winds and waterspouts deserve attention.',
      'ESWD is useful for severe convective storm documentation across Europe.'
    ],
    sections: [
      ['Why Latvia needs its own guide', [
        'Latvia is small enough that regional storms can affect the whole public conversation, but local enough that impacts still vary by coast, city, river basin, forest, and road corridor. Riga may care about drainage and wind, while coastal towns care about water levels and waves, and inland areas may watch rivers, trees, and winter roads.',
        'The result is a weather-risk profile that should not be copied from a U.S. tornado page or a generic Europe page. Latvia needs Baltic context first, then thunderstorm and tornado context inside that larger framework.'
      ]],
      ['Official warnings and Meteoalarm', [
        'The Latvian warning portal provides current hazard awareness, while Meteoalarm gives a cross-border European view. That pairing is useful because Baltic storms and winter systems do not stop at national borders.',
        'The key habit is to read the hazard name: wind, rain, thunderstorm, heat, cold, snow, ice, flooding, or coastal conditions. A warning color tells you urgency, but the hazard type tells you what action actually makes sense.'
      ]],
      ['Baltic windstorms and flooding', [
        'Windstorms over the Baltic region can damage trees, power lines, roofs, roads, and coastal infrastructure. Coastal water levels and waves can create separate problems from inland rainfall.',
        'Flooding can come from heavy rain, repeated wet spells, snowmelt, rivers, poor drainage, and coastal water-level changes. Drivers should treat flooded roads and underpasses as closed because depth and road condition are hard to judge.'
      ]],
      ['Thunderstorms, tornadoes, and ESWD', [
        'Latvia thunderstorm days may bring lightning, heavy rain, hail, and wind damage. Tornadoes and waterspouts are rare, but European severe-weather records show that severe convective events are part of the regional climate.',
        'ESWD is useful after events because it organizes reports and quality control for severe convective storms. Live safety decisions, however, should still come from official warnings and local emergency instructions.'
      ]]
    ],
    related: ['/latvia-thunderstorms-windstorms-floods-guide/', '/latvia-baltic-coastal-weather-guide/', '/tornadoes-in-europe/', '/flash-flood-safety/', '/weather-alerts-guide/'],
    faqs: [
      ['What warning sites should Latvia readers use?', 'Use warnings.meteo.lv, Meteoalarm Latvia, and local official guidance for live weather decisions.'],
      ['Does Latvia get tornadoes?', 'Latvia can have rare tornadoes, waterspouts, or funnel clouds, but severe thunderstorm wind, heavy rain, lightning, and Baltic windstorms are more common concerns.'],
      ['Why mention ESWD?', 'The European Severe Weather Database helps document severe convective storm reports across Europe, including rare tornado and damaging-wind events.']
    ]
  },
  {
    slug: 'latvia-thunderstorms-windstorms-floods-guide',
    profile: 'latvia',
    category: 'Latvia Weather',
    title: 'Latvia Thunderstorms, Windstorms, and Floods Guide',
    description: 'A detailed Latvia severe weather guide for thunderstorms, tornado context, Baltic windstorms, heavy rain, urban flooding, river flooding, and European severe-weather reports.',
    lede: 'Latvia severe weather often concentrates in wind and water. A Baltic low can bring broad wind impacts, while a summer thunderstorm can produce lightning, hail, heavy rain, flash flooding, and localized wind damage over a much smaller area.',
    quick: 'For Latvia severe weather, track official warnings for wind, rain, thunderstorms, flooding, and coastal impacts. Use ESWD as a research source for severe storm reports, but use Latvian warning services for real-time action.',
    figureTitle: 'Latvia severe weather pathways',
    figureSubtitle: 'Thunderstorms, Baltic windstorms, river flooding, urban flooding, and rare tornadoes',
    takeaways: [
      'Windstorms and thunderstorms both create wind risk, but one is broad and one is localized.',
      'Heavy rain can flood streets, underpasses, basements, rivers, and low agricultural land.',
      'Lightning safety matters even if a storm is not producing a tornado.',
      'Waterspouts and brief tornadoes are rare but plausible in the Baltic severe-storm environment.',
      'Reports after storms help improve local memory and preparedness.'
    ],
    sections: [
      ['Summer thunderstorm hazards', [
        'Latvia thunderstorms can be short-lived but high-impact. Lightning, intense rain, hail, and gusty outflows can affect roads, outdoor events, forests, farms, and power lines quickly.',
        'A common mistake is to judge risk by how large the storm looks on a national map. Convective storms can be narrow, and a small intense cell can cause more local damage than a broad area of lighter rain.'
      ]],
      ['Windstorms from Baltic lows', [
        'Baltic windstorms are broader than thunderstorms and can create multi-hour impacts. Trees, roofs, power systems, coastal roads, bridges, ports, and outdoor objects may be vulnerable depending on wind direction and soil conditions.',
        'Wind after wet weather can be more damaging because saturated ground holds tree roots less firmly. That is why warning impact can depend on the days before the storm, not only the peak gust in the forecast.'
      ]],
      ['Flooding routes in Latvia', [
        'Flooding can begin as intense rain in a city, repeated rainfall over a river basin, snowmelt, coastal water backup, or drainage overwhelmed by debris. The danger is often highest where people underestimate familiar roads.',
        'Turn around at flooded roads and underpasses. Moving water can hide broken pavement, open drains, or strong current, and even shallow-looking water can stall or move a vehicle.'
      ]],
      ['Tornado context without overhyping it', [
        'Latvia does not need exaggerated tornado messaging to take severe storms seriously. The science-based message is that tornadoes are rare but possible, while damaging thunderstorm wind, hail, lightning, and heavy rain are more common.',
        'A credible severe-weather page should teach the whole storm family. That helps readers react to official warnings without waiting for a rare label that may never be used in time.'
      ]]
    ],
    related: ['/latvia-weather-risk-guide/', '/latvia-baltic-coastal-weather-guide/', '/tornadoes-in-europe/', '/flash-flood-watch-vs-warning/', '/lightning-safety-guide/'],
    faqs: [
      ['Are Latvia thunderstorms usually widespread?', 'Not always. Some are localized, so radar and warning updates are important.'],
      ['Can Baltic windstorms cause flooding?', 'They can contribute to coastal water-level issues, especially when wind direction and low pressure push water toward vulnerable areas.'],
      ['Should rare tornado risk be ignored?', 'No. It should be understood in context with the more common severe thunderstorm hazards.']
    ]
  },
  {
    slug: 'latvia-baltic-coastal-weather-guide',
    profile: 'latvia',
    category: 'Latvia Weather',
    title: 'Latvia Baltic Coastal Weather Guide: Gulf of Riga Wind, Waves, Water Levels, Winter Ice, and Storm Planning',
    description: 'A Latvia Baltic coastal weather guide covering Gulf of Riga wind, waves, coastal flooding, water levels, winter ice, ports, beaches, roads, and storm preparation.',
    lede: 'Latvia coastal weather is shaped by the Baltic Sea and the Gulf of Riga. Wind direction, wave growth, water levels, freezing conditions, and storm timing can change risk for ports, beaches, roads, homes, ferries, and outdoor plans.',
    quick: 'For Latvia coastal weather, check official warnings for wind, coastal water, rain, snow, and ice before travel or shoreline plans. Baltic impacts can be serious even when the storm is not a tropical system.',
    figureTitle: 'Latvia coastal risk layers',
    figureSubtitle: 'Gulf of Riga, Baltic wind, waves, sea level, winter ice, and coastal roads',
    takeaways: [
      'Coastal weather is more than rain: wind direction, waves, water level, ice, and visibility matter.',
      'The Gulf of Riga can focus local water and wind impacts depending on storm track.',
      'Winter coastal risk includes ice, freezing spray, slippery surfaces, and cold-water exposure.',
      'Ports, low roads, waterfront paths, and beaches need different plans from inland neighborhoods.',
      'Official warning sites are the decision source during active weather.'
    ],
    sections: [
      ['Why the Gulf of Riga matters', [
        'The Gulf of Riga can shape local coastal conditions because wind direction, pressure, and coastline geometry influence water levels and waves. A storm does not need to be globally famous to create local coastal trouble.',
        'For residents and visitors, the practical question is whether water, wind, or ice affects access. Roads, harbors, beaches, low paths, parking areas, and waterfront businesses can all become difficult before inland areas look dramatic.'
      ]],
      ['Wind and water as separate hazards', [
        'Wind can damage structures and trees, while water can flood low areas or create dangerous wave action. The two often arrive together, but they require different responses.',
        'Secure loose objects for wind, avoid exposed shorelines for waves, do not drive into water-covered roads, and follow official guidance if coastal areas are restricted.'
      ]],
      ['Winter ice and cold-water risk', [
        'Winter coastal weather adds slippery surfaces, ice, reduced visibility, cold-water exposure, and difficult rescue conditions. A brief fall into cold water can become dangerous quickly.',
        'Mild air does not always mean safe water or ice. Coastal ice conditions can change with wind, currents, water level, and temperature swings.'
      ]],
      ['Planning for coastal storms', [
        'A useful storm plan includes alternate routes, charged phones, warm clothing, safe heating, secured outdoor items, medication timing, and a decision point for delaying shoreline travel.',
        'Businesses and event organizers should decide ahead of time when wind, waves, lightning, or flooding will close outdoor areas. Waiting until people are already at the waterfront creates avoidable risk.'
      ]]
    ],
    related: ['/latvia-weather-risk-guide/', '/latvia-thunderstorms-windstorms-floods-guide/', '/finland-baltic-sea-weather-safety-guide/', '/sweden-coastal-winter-weather-guide/', '/storm-surge-explained/'],
    faqs: [
      ['Can Latvia have coastal flooding without a hurricane?', 'Yes. Baltic wind, low pressure, water levels, and waves can create coastal impacts without tropical weather.'],
      ['Why is winter coastal weather dangerous?', 'Ice, cold water, wind, and low visibility reduce safety margins and make rescue harder.'],
      ['What should I check before going to the coast?', 'Check official warnings, wind, waves, water levels, ice conditions, road updates, and local restrictions.']
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function slugToLabel(slug) {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function adSlot() {
  return `<div class="ad-inline" aria-label="Advertisement">
<script type="text/javascript">
  atOptions = {'key':'${ad300Key}','format':'iframe','height':250,'width':300,'params':{}};
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${ad300Key}/invoke.js"></script>
</div>`;
}

function sideAd() {
  return `<aside id="adsterra-side" aria-label="Advertisement">
<script type="text/javascript">
  atOptions = {'key':'${sideRailKey}','format':'iframe','height':600,'width':160,'params':{}};
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${sideRailKey}/invoke.js"></script>
</aside>`;
}

function combinedSources(page) {
  const keys = page.sourceKeys || [page.profile];
  const map = new Map();
  for (const key of keys) {
    for (const [label, url] of sources[key] || []) {
      map.set(url, label);
    }
  }
  return [...map.entries()].map(([url, label]) => [label, url]);
}

function renderFigure(page, profile) {
  const hazards = profile?.mainHazards || ['warnings', 'official sources', 'seasonal hazards', 'severe storms', 'flooding', 'coastal risk'];
  const bars = hazards.slice(0, 6).map((hazard, index) => {
    const y = 78 + index * 42;
    const width = 230 + ((index * 47) % 230);
    const colors = ['#a02818', '#1e3a5f', '#2d6a4f', '#b8620f', '#5b5f6f', '#7d1f13'];
    return `<g>
      <rect x="300" y="${y}" width="${width}" height="24" rx="6" fill="${colors[index]}" opacity="0.9"></rect>
      <text x="548" y="${y + 17}" text-anchor="end">${escapeHtml(hazard)}</text>
    </g>`;
  }).join('\n');

  return `<figure class="country-figure">
    <svg viewBox="0 0 860 380" role="img" aria-labelledby="fig-title fig-desc">
      <title id="fig-title">${escapeHtml(page.figureTitle || page.title)}</title>
      <desc id="fig-desc">${escapeHtml(page.figureSubtitle || page.description)}</desc>
      <rect x="0" y="0" width="860" height="380" rx="8" fill="#f4f1ea"></rect>
      <path d="M80 280 C160 150 250 120 330 210 C390 278 490 90 610 128 C710 160 744 242 792 302" fill="none" stroke="#d4cfc3" stroke-width="18" stroke-linecap="round"></path>
      <path d="M80 280 C160 150 250 120 330 210 C390 278 490 90 610 128 C710 160 744 242 792 302" fill="none" stroke="#1e3a5f" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 14"></path>
      <circle cx="132" cy="235" r="42" fill="#ffffff" stroke="#e5e1d8"></circle>
      <circle cx="270" cy="178" r="54" fill="#ffffff" stroke="#e5e1d8"></circle>
      <circle cx="478" cy="156" r="46" fill="#ffffff" stroke="#e5e1d8"></circle>
      <circle cx="672" cy="182" r="58" fill="#ffffff" stroke="#e5e1d8"></circle>
      <text x="52" y="58" class="fig-kicker">${escapeHtml(page.category)}</text>
      <text x="52" y="94" class="fig-title">${escapeHtml(page.figureTitle || page.title)}</text>
      <text x="52" y="124" class="fig-sub">${escapeHtml(page.figureSubtitle || page.description)}</text>
      <text x="302" y="58" class="fig-kicker">Hazard layers</text>
      ${bars}
      <text x="52" y="326" class="fig-note">Use official warnings for live decisions. This visual is an educational risk map, not a live forecast.</text>
    </svg>
  </figure>`;
}

function renderTakeaways(page) {
  return `<section class="takeaway-box">
    <h2>Key takeaways</h2>
    <ul>
      ${page.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')}
    </ul>
  </section>`;
}

function renderSeasonTable(profile) {
  if (!profile?.seasonalRows) return '';
  return `<section>
    <h2>Seasonal risk calendar</h2>
    <p>${profile.country} weather risk changes through the year, so the best plan is seasonal rather than generic. Use this table as a planning guide, then confirm details with ${profile.agency} and local emergency information when weather is active.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Season</th><th>Main planning concern</th></tr></thead>
        <tbody>
          ${profile.seasonalRows.map(([season, note]) => `<tr><td>${escapeHtml(season)}</td><td>${escapeHtml(note)}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </section>`;
}

function renderProfileSections(profile) {
  if (!profile) return '';
  const hazards = profile.mainHazards.map((hazard) => `<li>${escapeHtml(hazard)}</li>`).join('\n');
  return `<section>
    <h2>Country risk profile</h2>
    <p>${profile.country} sits inside ${profile.climateFrame}. That makes the country a useful weather study because the most important hazard is not always the most dramatic one on a radar image.</p>
    <p>The core hazards to watch are:</p>
    <ul>${hazards}</ul>
  </section>

  <section>
    <h2>Warnings and official sources</h2>
    ${profile.warningText.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
  </section>

  <section>
    <h2>Tornado and severe-storm context</h2>
    ${profile.tornadoText.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
  </section>

  <section>
    <h2>Forecast signals to watch</h2>
    ${profile.forecastText.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
  </section>`;
}

function renderChecklist(profile) {
  if (!profile?.checklist) return '';
  return `<section class="checklist">
    <h2>Practical planning checklist</h2>
    <p>Use this as a plain-language starting point before switching to live official warnings and local instructions.</p>
    <ul>
      ${profile.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')}
    </ul>
  </section>`;
}

function renderSources(page) {
  const sourceLinks = combinedSources(page).map(([label, url]) => `<li><a href="${escapeHtml(url)}" rel="nofollow noopener">${escapeHtml(label)}</a></li>`).join('\n');
  return `<section class="sources">
    <h2>Sources and further reading</h2>
    <p>This guide is written as an educational Tornado Hub article and cross-checks hazard language against official weather agencies, national warning portals, and European severe-weather reporting sources.</p>
    <ul>${sourceLinks}</ul>
  </section>`;
}

function renderRelated(page) {
  return `<section class="related">
    <h2>Related guides</h2>
    <div class="related-grid">
      ${page.related.map((url) => `<a href="${url}">${escapeHtml(slugToLabel(url.replace(/^\/|\/$/g, '')))}</a>`).join('\n')}
    </div>
  </section>`;
}

function renderFaq(page) {
  return `<section class="faq">
    <h2>Frequently asked questions</h2>
    ${page.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('\n')}
  </section>`;
}

function renderPage(page) {
  const profile = profiles[page.profile];
  const url = `${site}/${page.slug}/`;
  const sourceList = combinedSources(page);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text }
    }))
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    datePublished: today,
    dateModified: today,
    author: { '@type': 'Organization', name: 'Tornado Hub' },
    publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site },
    mainEntityOfPage: url,
    about: [page.category, profile?.country || page.country, 'weather safety', 'severe weather']
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${site}/articles/` },
      { '@type': 'ListItem', position: 3, name: page.title, item: url }
    ]
  };
  const sections = page.sections.map(([heading, paragraphs]) => `<section>
    <h2>${escapeHtml(heading)}</h2>
    ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
  </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}" />
<meta name="twitter:description" content="${escapeHtml(page.description)}" />
<meta name="twitter:title" content="${escapeHtml(page.title)}" />
<meta name="twitter:card" content="summary" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="article" />
<meta property="og:description" content="${escapeHtml(page.description)}" />
<meta property="og:title" content="${escapeHtml(page.title)}" />
<meta property="og:site_name" content="Tornado Hub" />
<link rel="canonical" href="${url}" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8C%AA%EF%B8%8F%3C/text%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>
:root {
  --bg:#fbfaf7; --bg-alt:#f4f1ea; --surface:#ffffff; --text:#14161c; --text-secondary:#4a5061; --text-muted:#737887;
  --border:#e5e1d8; --border-strong:#d4cfc3; --accent:#a02818; --accent-hover:#7d1f13; --link:#1e3a5f;
  --green:#2d6a4f; --amber:#b8620f; --blue:#1e3a5f; --serif:"Fraunces", Georgia, "Times New Roman", serif;
  --sans:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:var(--sans); background:var(--bg); color:var(--text); line-height:1.65; -webkit-font-smoothing:antialiased; }
a { color:var(--link); text-decoration:none; }
a:hover { color:var(--accent); text-decoration:underline; }
.nav { background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
.nav-inner { max-width:1200px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
.nav-brand { font-family:var(--serif); font-weight:700; font-size:20px; color:var(--text); display:flex; align-items:center; gap:8px; text-decoration:none; }
.nav-links { display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
.nav-links a { color:var(--text-secondary); padding:8px 14px; font-size:14px; font-weight:500; border-radius:6px; text-decoration:none; }
.nav-links a:hover { background:var(--bg-alt); color:var(--text); text-decoration:none; }
.nav-links a.cta { background:var(--accent); color:white; font-weight:600; }
.nav-links a.cta:hover { background:var(--accent-hover); color:white; }
.breadcrumb { max-width:900px; margin:0 auto; padding:18px 24px 0; color:var(--text-muted); font-size:13px; }
.article { max-width:820px; margin:0 auto; padding:24px 24px 64px; }
.article-header { border-bottom:1px solid var(--border); padding-bottom:28px; margin-bottom:28px; }
.eyebrow { color:var(--accent); font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:14px; }
h1 { font-family:var(--serif); font-size:clamp(32px, 4vw, 48px); line-height:1.12; letter-spacing:-0.01em; margin-bottom:16px; }
.lede { font-size:19px; line-height:1.55; color:var(--text-secondary); }
.quick-answer { background:var(--surface); border:1px solid var(--border); border-left:5px solid var(--accent); border-radius:8px; padding:20px 22px; margin:28px 0; }
.quick-answer strong { display:block; color:var(--accent); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.08em; font-size:12px; }
h2 { font-family:var(--serif); font-size:28px; line-height:1.2; margin:44px 0 14px; letter-spacing:-0.01em; }
p { font-size:17px; margin-bottom:16px; }
ul { margin:0 0 22px 24px; }
li { font-size:16.5px; margin-bottom:8px; }
.country-figure { margin:32px 0; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:var(--surface); }
.country-figure svg { width:100%; display:block; }
.country-figure text { font-family:var(--sans); fill:var(--text); font-size:16px; }
.country-figure .fig-kicker { fill:var(--accent); font-size:13px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
.country-figure .fig-title { font-family:var(--serif); font-size:28px; font-weight:700; }
.country-figure .fig-sub { fill:var(--text-secondary); font-size:15px; }
.country-figure .fig-note { fill:var(--text-muted); font-size:13px; }
.takeaway-box, .checklist, .sources, .faq { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:22px; margin:34px 0; }
.takeaway-box h2, .checklist h2, .sources h2, .faq h2 { margin-top:0; }
.table-wrap { overflow-x:auto; border:1px solid var(--border); border-radius:8px; background:var(--surface); margin:18px 0 30px; }
table { width:100%; border-collapse:collapse; min-width:620px; }
th, td { padding:14px 16px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; font-size:15px; }
th { background:var(--bg-alt); color:var(--text); font-weight:800; }
tr:last-child td { border-bottom:0; }
.sources li { margin-bottom:10px; }
.related { border-top:1px solid var(--border); margin-top:44px; padding-top:28px; }
.related-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }
.related-grid a { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:12px 14px; color:var(--text); font-weight:700; font-size:14px; text-decoration:none; }
.related-grid a:hover { border-color:var(--accent); color:var(--accent); }
details { border-top:1px solid var(--border); padding:14px 0; }
details:first-of-type { border-top:0; }
summary { cursor:pointer; font-weight:800; color:var(--text); }
details p { margin:10px 0 0; color:var(--text-secondary); }
.ad-inline { text-align:center; min-height:250px; margin:30px auto; display:flex; justify-content:center; align-items:center; }
.footer { background:#14161c; color:#94a3b8; padding:40px 24px; border-top:4px solid var(--accent); }
.footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:20px; font-size:13px; }
.footer a { color:white; text-decoration:none; }
#adsterra-side { display:none; }
@media (min-width:1280px) {
  #adsterra-side { display:block; position:fixed; right:8px; top:50%; transform:translateY(-50%); width:160px; min-height:600px; z-index:50; }
}
@media (max-width:640px) {
  .nav-inner { align-items:flex-start; flex-direction:column; gap:10px; }
  .nav-links a { padding:6px 10px; font-size:13px; }
  .article { padding-left:18px; padding-right:18px; }
  p { font-size:16px; }
}
</style>
</head>
<body>
${sideAd()}
<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-brand"><span>Tornado Hub</span></a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="/search/">Search</a>
      <a href="/quiz/">Quizzes</a>
      <a href="/weather-trivia/">Weather Trivia</a>
      <a href="/tornadoes/">Tornado Index</a>
      <a href="/simulator/" class="cta">Launch Simulator</a>
    </div>
  </div>
</nav>
<div class="breadcrumb"><a href="/">Home</a> &middot; <a href="/articles/">Articles</a> &middot; ${escapeHtml(page.country || profile?.country || page.category)}</div>
<article class="article">
  <header class="article-header">
    <div class="eyebrow">${escapeHtml(page.category)}</div>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="lede">${escapeHtml(page.lede)}</p>
  </header>
  <div class="quick-answer"><strong>Quick answer</strong><p>${escapeHtml(page.quick)}</p></div>
  ${adSlot()}
  ${renderFigure(page, profile)}
  ${renderTakeaways(page)}
  ${sections}
  ${renderProfileSections(profile)}
  ${adSlot()}
  ${renderSeasonTable(profile)}
  ${renderChecklist(profile)}
  ${renderSources(page)}
  <p class="source-note">Source count for this guide: ${sourceList.length}. Tornado Hub uses these links for educational citation and directs readers back to official agencies for live warnings.</p>
  ${renderFaq(page)}
  ${renderRelated(page)}
</article>
<footer class="footer">
  <div class="footer-inner">
    <span>&copy; 2026 Tornado Hub</span>
    <span><a href="/privacy/">Privacy</a> &middot; <a href="/terms/">Terms</a> &middot; <a href="/contact/">Contact</a> &middot; <a href="/about/">About</a></span>
  </div>
</footer>
</body>
</html>`;
}

function writePages() {
  for (const page of pages) {
    const dir = path.join(root, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderPage(page));
  }
}

function walkIndexFiles(dir, files = []) {
  const skip = new Set(['.git', '.agents', '.codex', 'node_modules', 'dist', 'work', 'outputs']);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkIndexFiles(full, files);
    } else if (entry.name === 'index.html') {
      files.push(full);
    }
  }
  return files;
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i');
  return html.match(re)?.[1] || '';
}

function extractTitle(html) {
  return stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || 'Tornado Hub');
}

function pageUrlFor(file) {
  const dir = path.dirname(file);
  const rel = path.relative(root, dir).replace(/\\/g, '/');
  return rel ? `/${rel}/` : '/';
}

function rebuildContentIndex() {
  const items = walkIndexFiles(root)
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8');
      const url = pageUrlFor(file);
      const category = stripHtml(html.match(/class=["'](?:eyebrow|page-eyebrow|article-cat)["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || 'Guide');
      return {
        title: extractTitle(html),
        description: extractMeta(html, 'description') || stripHtml(html.match(/<p[^>]*class=["']lede["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || ''),
        url,
        category
      };
    })
    .sort((a, b) => a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(root, 'assets', 'content-index.js'), `window.TORNADO_CONTENT_INDEX = ${JSON.stringify(items, null, 2)};\n`);
}

function rebuildSitemap() {
  const urls = walkIndexFiles(root)
    .map((file) => pageUrlFor(file))
    .sort((a, b) => a.localeCompare(b))
    .map((url) => `  <url>\n    <loc>${site}${url === '/' ? '/' : url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${url === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${url === '/' ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}

function updateArticlesIndex() {
  const file = path.join(root, 'articles', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const links = pages.map((page) => `    <a class="link-card" href="/${page.slug}/">${escapeHtml(page.title)} <small>${escapeHtml(page.category)}</small></a>`).join('\n');
  const section = `<section class="cat-section" data-generated="international-country-weather">
  <h2 class="cat-heading">International country weather guides <span class="cat-count">${pages.length} guides</span></h2>
  <p class="cat-sub">High-quality country pages for Australia, Finland, Sweden, and Latvia, with official warning sources, severe-storm context, seasonal risk calendars, and internal links to the simulator and weather library.</p>
  <div class="link-grid">
${links}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="international-country-weather">[\s\S]*?<\/section>\s*/m, '');
  const anchor = '<section class="cat-section">\n  <h2 class="cat-heading">New safety and science guides';
  if (html.includes(anchor)) {
    html = html.replace(anchor, section + anchor);
  } else {
    html = html.replace('<main class="main">', '<main class="main">\n\n' + section);
  }
  fs.writeFileSync(file, html);
}

function updateHomePage() {
  const file = path.join(root, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const countryCards = [
    ['Australia', '/australia-weather-risk-guide/', 'Cyclones, floods, heat, fire weather, severe thunderstorms, and tornado context.'],
    ['Finland', '/finland-weather-risk-guide/', 'FMI warning colors, winter roads, thunderstorm gusts, Baltic marine weather, heat, and cold.'],
    ['Sweden', '/sweden-weather-risk-guide/', 'SMHI warnings, radar, satellite, windstorms, snow, flooding, forest fire weather, and coasts.'],
    ['Latvia', '/latvia-weather-risk-guide/', 'Baltic windstorms, warnings, floods, winter weather, thunderstorms, and European severe-storm reports.']
  ];
  const cards = countryCards.map(([name, url, copy]) => `      <article class="article-card">
        <div class="article-cat">Country Guide</div>
        <h3 class="article-title"><a href="${url}">${name} weather risk guide</a></h3>
        <p class="article-excerpt">${copy}</p>
        <div class="article-meta">Official sources and seasonal hazards</div>
      </article>`).join('\n');
  const section = `<section class="section" data-generated="international-country-weather-home">
  <div class="section-inner">
    <div class="section-header">
      <div class="section-eyebrow">International Weather</div>
      <h2 class="section-title">Country guides for Australia, Finland, Sweden, and Latvia.</h2>
      <p class="section-lede">Official warning sources, seasonal hazard calendars, severe thunderstorm context, tornado reality checks, and practical planning links for readers outside the United States.</p>
    </div>
    <div class="article-grid">
${cards}
    </div>
    <div style="margin-top:24px;">
      <a href="/international-weather-risk-guides/" class="btn btn-outline">Open the international weather hub</a>
    </div>
  </div>
</section>

`;
  html = html.replace(/<section class="section" data-generated="international-country-weather-home">[\s\S]*?<\/section>\s*/m, '');
  const anchor = '<!-- ============ SIMULATOR PREVIEW ============ -->';
  html = html.replace(anchor, section + anchor);
  fs.writeFileSync(file, html);
}

writePages();
updateArticlesIndex();
updateHomePage();
rebuildContentIndex();
rebuildSitemap();

console.log(`Added ${pages.length} international country weather pages.`);

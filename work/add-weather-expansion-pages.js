import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  {
    slug: 'storm-surge-explained',
    category: 'Hurricanes',
    title: 'Storm Surge Explained: Why Hurricane Water Can Be Deadlier Than Wind',
    description: 'A plain-English guide to storm surge, why it rises before and during hurricanes, how it differs from waves and flooding, and why evacuation zones matter.',
    quick: 'Storm surge is ocean water pushed onto land by a tropical cyclone. It can rise quickly, travel far inland through bays and rivers, and make roads impossible to use long before the worst wind arrives.',
    sections: [
      ['What storm surge is', ['Storm surge is not just a big wave. It is a broad rise in sea level caused mainly by hurricane winds pushing water toward the coast. Low pressure contributes too, but wind-driven water is usually the biggest factor.', 'The shape of the coastline, shallow water, bays, inlets, and the storm track all affect how high the water can rise. Two hurricanes with the same category can produce very different surge impacts.']],
      ['Why it is so dangerous', ['Surge can arrive before the eye or strongest wind, which means waiting until conditions look terrible can trap people. Roads may flood, bridges may close, and emergency responders may stop moving once winds become unsafe.', 'Moving water is heavy and destructive. It can push cars, break walls, undermine foundations, and hide debris or downed lines. Even shallow-looking water can be dangerous when it is moving.']],
      ['Surge vs rainfall flooding', ['Storm surge comes from the ocean, gulf, bay, or tidal waterway. Rainfall flooding comes from water falling from the sky and draining through streets, streams, and rivers.', 'A hurricane can produce both at once. Coastal communities may flood from surge while inland areas flood from rain hours or days later.']],
      ['What to do', ['Know whether you live in an evacuation zone before hurricane season. Evacuation zones are often based on surge risk, not just distance from the beach.', 'If local officials order evacuation for your zone, leave early. The goal is to be out before water covers roads and before wind makes travel unsafe.']]
    ],
    faqs: [
      ['Is storm surge included in the hurricane category?', 'No. The category is based on wind speed. Surge depends on storm size, track, coastline shape, forward speed, tides, and water depth.'],
      ['Can storm surge happen in a tropical storm?', 'Yes. Strong onshore winds from a tropical storm can push water inland, especially in vulnerable bays and shallow coastal areas.'],
      ['Is a higher floor safe from storm surge?', 'A higher floor may reduce drowning risk but does not solve isolation, structural damage, fire, medical, or rescue issues. Follow evacuation orders.']
    ],
    related: ['/hurricane-season-preparedness/', '/hurricane-vs-tornado/', '/hurricane-category-explorer/', '/flash-flood-safety/']
  },
  {
    slug: 'hurricane-evacuation-zone-vs-flood-zone',
    category: 'Hurricanes',
    title: 'Hurricane Evacuation Zone vs Flood Zone: What Is the Difference?',
    description: 'Evacuation zones and flood zones are often confused. Learn what each one means, how officials use them, and why you should know both before hurricane season.',
    quick: 'An evacuation zone tells you whether officials may ask you to leave for a hurricane threat. A flood zone is mainly used for long-term flood risk and insurance. They can overlap, but they are not the same map.',
    sections: [
      ['Evacuation zones are action maps', ['Evacuation zones are designed for decisions during a storm. Local officials use them to move people away from areas that could become dangerous from storm surge, coastal flooding, or access problems.', 'These zones are usually labeled by letters, numbers, or colors. Your zone can determine whether an evacuation order applies to you.']],
      ['Flood zones are risk maps', ['Flood zones describe longer-term flood risk and are often connected to insurance, mortgages, building rules, and floodplain management.', 'A home can be outside a high-risk flood insurance zone but still be in a hurricane evacuation zone if storm surge, islands, bridges, or access roads create danger.']],
      ['Why both matter', ['Before hurricane season, look up both maps. The evacuation zone helps you decide where to go when officials issue orders. The flood zone helps you understand insurance and property risk.', 'If maps disagree, do not assume the safer-looking one wins. They answer different questions.']],
      ['Planning around zones', ['Know your destination, route, pets plan, medication needs, and the time it takes to leave. Evacuations work better when people leave before bridges, causeways, and highways become crowded.', 'If you are not in an evacuation zone, you may still need a plan for power outages, freshwater, food, medical needs, and inland flooding.']]
    ],
    faqs: [
      ['Can I be in an evacuation zone but not a flood zone?', 'Yes. The maps serve different purposes and may use different hazards, assumptions, and agencies.'],
      ['Should renters check evacuation zones?', 'Yes. Evacuation zones apply to where you are staying, not whether you own the property.'],
      ['Do evacuation zones change?', 'They can. Check your local emergency management site before each hurricane season.']
    ],
    related: ['/storm-surge-explained/', '/hurricane-season-preparedness/', '/hurricane-forecast-accuracy/', '/weather-app-comparison-2026/']
  },
  {
    slug: 'hurricane-spaghetti-models-explained',
    category: 'Forecasting',
    title: 'Hurricane Spaghetti Models Explained: How to Read the Lines',
    description: 'What hurricane spaghetti models show, what they do not show, why tracks spread out, and how to avoid common forecast mistakes.',
    quick: 'Spaghetti models show possible storm tracks from different forecast models or ensemble members. They are useful for uncertainty, but they are not impact maps and they do not show storm size, rainfall, surge, or tornado risk.',
    sections: [
      ['What the lines mean', ['Each line is one forecast track from a model or ensemble member. When lines cluster tightly, track confidence may be higher. When they spread out, uncertainty is larger.', 'The lines often show the center track, not the full hazard area. A hurricane can bring dangerous surge, rain, wind, and tornadoes far from the center line.']],
      ['Why models disagree', ['Models ingest different data, use different physics, and handle steering winds, storm structure, and land interaction differently. Small early differences can become large track differences several days later.', 'That is why official forecasts use more than one model and include human forecaster judgment.']],
      ['Common mistakes', ['Do not pick the line you like best. Do not assume a line over your town means the storm will definitely hit you. Do not assume a line offshore means you are safe.', 'Use the official cone, watches, warnings, rainfall outlooks, surge products, and local guidance together.']],
      ['Better way to use them', ['Spaghetti models are best for seeing uncertainty and trends. If the cluster shifts toward you for several runs, pay attention. If the spread is wide, keep your plan flexible.', 'For decisions, use official forecast products and local emergency management instructions.']]
    ],
    faqs: [
      ['Are spaghetti models official forecasts?', 'No. They are model guidance. Official hurricane forecasts come from the responsible forecast center.'],
      ['Why are spaghetti lines missing sometimes?', 'Some models may not initialize, may be delayed, or may not be appropriate for a particular storm.'],
      ['Do spaghetti models show hurricane strength?', 'Usually no. Most spaghetti graphics focus on track. Intensity and impacts require other products.']
    ],
    related: ['/hurricane-forecast-accuracy/', '/forecast-uncertainty-explained/', '/weather-forecasting-mistakes-history/', '/hurricane-season-preparedness/']
  },
  {
    slug: 'tropical-storm-watch-vs-warning',
    category: 'Hurricanes',
    title: 'Tropical Storm Watch vs Warning: What Each Alert Means',
    description: 'The difference between a tropical storm watch and warning, what actions to take, and how these alerts relate to hurricane watches and warnings.',
    quick: 'A tropical storm watch means tropical-storm-force winds are possible. A warning means they are expected. The warning is the stronger signal to finish preparations and stay off roads before conditions deteriorate.',
    sections: [
      ['The basic difference', ['A watch is about possibility. A warning is about expected conditions. Tropical-storm-force winds can knock out power, make bridges dangerous, push water onto roads, and make last-minute errands risky.', 'These alerts are not only for storms named hurricanes. A tropical storm can still produce flooding, surge, tornadoes, and damaging wind.']],
      ['What to do during a watch', ['Review your plan, fuel vehicles if you need them, charge devices, secure outdoor items, check prescriptions, and confirm where pets and family members will be.', 'If you live in an evacuation zone, watch local emergency guidance closely. Leaving early is easier than leaving when rain bands and traffic arrive.']],
      ['What to do during a warning', ['Finish preparations quickly. Bring in outdoor objects, move vehicles away from flood-prone spots if safe, and avoid unnecessary travel.', 'Once winds increase, emergency help may be delayed. Treat the warning as the point where preparation ends and riding out the storm begins.']],
      ['How it relates to hurricane alerts', ['A hurricane watch or warning means hurricane-force winds are possible or expected. Tropical storm alerts may be issued around the same system for areas expected to get lower but still hazardous wind speeds.', 'Read the full forecast, not just the headline alert. Water hazards often cause the most serious impacts.']]
    ],
    faqs: [
      ['Is a tropical storm warning serious?', 'Yes. Tropical-storm-force winds can cause power outages, tree damage, coastal flooding, and dangerous travel.'],
      ['Can a tropical storm warning become a hurricane warning?', 'Yes, if the forecast changes or the storm strengthens. Keep checking official updates.'],
      ['Should I evacuate for a tropical storm warning?', 'Follow local orders. Evacuation decisions depend on surge zones, flooding, housing, bridges, medical needs, and local conditions.']
    ],
    related: ['/hurricane-season-preparedness/', '/storm-surge-explained/', '/hurricane-vs-typhoon-vs-cyclone/', '/weather-radio-buying-guide/']
  },
  {
    slug: 'super-typhoon-explained',
    category: 'Typhoons',
    title: 'Super Typhoon Explained: What Makes a Typhoon Super?',
    description: 'What a super typhoon is, how it compares with major hurricanes, why terminology varies, and what impacts people should prepare for.',
    quick: 'A super typhoon is an extremely intense tropical cyclone in the western North Pacific. The exact wind threshold depends on the agency, but the practical message is simple: destructive wind, surge, flooding, and landslides are possible.',
    sections: [
      ['Typhoon, hurricane, cyclone', ['Hurricanes, typhoons, and tropical cyclones are the same basic type of storm. The name depends on the ocean basin. In the western North Pacific, the word typhoon is used.', 'A super typhoon is a particularly intense typhoon, broadly comparable in seriousness to a major hurricane.']],
      ['Why definitions vary', ['Different meteorological agencies use different wind averaging periods and thresholds. That can make direct comparisons confusing.', 'For public safety, the exact label matters less than the local warnings, forecast track, storm size, rainfall threat, and surge risk.']],
      ['Main hazards', ['Extreme wind can damage roofs, power systems, communications, crops, and weak structures. Coastal areas may face surge and large waves, while mountainous islands can face landslides and flash floods.', 'A storm weakening before landfall can still be dangerous if it is large, wet, or pushing water into bays and low-lying communities.']],
      ['How to prepare', ['Prepare early because supply chains and ferry, bridge, road, and airport access can be disrupted. Store water, food, medicine, lighting, and battery power.', 'Follow local evacuation orders, especially in coastal, river, landslide, or low-lying areas.']]
    ],
    faqs: [
      ['Is a super typhoon the same as a Category 5 hurricane?', 'Not exactly, because agencies use different wind scales and averaging periods, but both describe extremely dangerous tropical cyclones.'],
      ['Do super typhoons only happen in Asia?', 'The term is used for the western North Pacific, which affects places such as the Philippines, Japan, Taiwan, China, Guam, and nearby regions.'],
      ['Can a typhoon produce tornadoes?', 'Tropical cyclones can produce tornadoes in rain bands, though the risk varies by storm and location.']
    ],
    related: ['/hurricane-vs-typhoon-vs-cyclone/', '/tornado-vs-typhoon/', '/hurricane-tornadoes/', '/weather-trivia/hurricanes/']
  },
  {
    slug: 'western-pacific-typhoon-season',
    category: 'Typhoons',
    title: 'Western Pacific Typhoon Season: Why It Can Last So Long',
    description: 'Why the western North Pacific can produce typhoons across much of the year, what peak season means, and how residents should think about readiness.',
    quick: 'The western North Pacific can support tropical cyclones during many months of the year, with a broad peak when ocean heat, moisture, and atmospheric patterns are most favorable.',
    sections: [
      ['Why the basin is active', ['The western North Pacific has vast warm ocean water and favorable tropical disturbances. That gives storms room to form, organize, and intensify.', 'Because the basin is large and warm, activity can occur outside the months people casually think of as peak season.']],
      ['Peak does not mean only', ['Peak season means the odds are higher, not that risk disappears before or after. Some damaging typhoons occur during shoulder months.', 'Preparedness works best as a year-round habit in places frequently affected by typhoons.']],
      ['Different impacts by location', ['Islands, coastlines, mountains, and dense cities experience typhoons differently. One place may face surge and waves while another faces landslides and river flooding.', 'Track direction matters too. A small shift can change which side receives the strongest wind, highest water, or heaviest rain bands.']],
      ['Readiness basics', ['Know local alert terminology, shelter options, evacuation routes, and how your home handles power and water outages.', 'Have supplies ready before a storm forms nearby because stores, roads, and ports can become crowded or disrupted quickly.']]
    ],
    faqs: [
      ['Can typhoons happen outside peak season?', 'Yes. Peak season only describes higher probability, not the only possible time for storms.'],
      ['Why do some typhoons intensify so quickly?', 'Warm water, moist air, low wind shear, and an organized inner core can allow rapid strengthening.'],
      ['Are typhoon forecasts perfect?', 'No. Track forecasts have improved, but intensity, rainfall placement, and local impacts still carry uncertainty.']
    ],
    related: ['/super-typhoon-explained/', '/hurricane-vs-typhoon-vs-cyclone/', '/hurricane-forecast-accuracy/', '/weather-satellite-guide/']
  },
  {
    slug: 'monsoon-season-explained',
    category: 'Weather Science',
    title: 'Monsoon Season Explained: Wind Shift, Moisture, Storms, and Flooding',
    description: 'A beginner-friendly explanation of monsoon season, why it is more than just rain, and how monsoon storms can create flash flooding, dust, lightning, and heat relief.',
    quick: 'A monsoon is a seasonal wind pattern that transports moisture and changes storm behavior. In many regions it brings needed rain, but it can also produce flash flooding, lightning, dust storms, and dangerous travel.',
    sections: [
      ['More than rainy season', ['People often use monsoon to mean heavy summer rain, but the core idea is a seasonal wind shift. That wind shift can pull deep moisture into a region and change daily thunderstorm patterns.', 'The exact timing and impacts vary by region. Some areas depend on monsoon rainfall for water supply and agriculture.']],
      ['Why storms can be intense', ['Moist air, daytime heating, terrain, and storm outflows can combine to produce sudden thunderstorms. Dry ground and steep terrain can turn heavy rain into fast runoff.', 'A storm miles away can send water rushing through washes, canyons, and low-water crossings.']],
      ['Other hazards', ['Monsoon storms can produce frequent lightning, damaging wind gusts, blowing dust, poor visibility, hail, and localized flooding.', 'Heat can still be dangerous between storms because humidity makes it harder for the body to cool itself.']],
      ['Safety habits', ['Avoid flooded crossings, keep distance from washes and slot canyons during storm days, and take lightning seriously even if rain has not reached you yet.', 'Secure loose outdoor items before storms and watch for dust walls that can reduce visibility rapidly on roads.']]
    ],
    faqs: [
      ['Is monsoon season the same everywhere?', 'No. Different regions have different timing, wind patterns, rainfall amounts, and hazards.'],
      ['Can monsoon storms happen without much warning?', 'Yes. Thunderstorms can build quickly, especially near mountains or boundaries left by earlier storms.'],
      ['Why is flash flooding common in monsoon storms?', 'Heavy rain can fall over dry, hard, steep, or urban ground where water runs off quickly.']
    ],
    related: ['/flash-flood-safety/', '/lightning-safety-guide/', '/dust-devil-vs-tornado/', '/weather-map-symbols/']
  },
  {
    slug: 'flash-flood-watch-vs-warning',
    category: 'Flooding',
    title: 'Flash Flood Watch vs Warning: What to Do When Water Rises Fast',
    description: 'The difference between flash flood watches and warnings, why water can rise faster than expected, and how to avoid the most common deadly mistake.',
    quick: 'A flash flood watch means conditions could produce rapid flooding. A flash flood warning means flooding is happening or expected soon. Never drive across flooded roads.',
    sections: [
      ['Watch vs warning', ['A watch is a preparedness signal. Check forecasts, avoid camping in low spots, and be ready to move if storms develop.', 'A warning is an action signal. Move away from low water, streams, washes, underpasses, and flooded roads.']],
      ['Why flash floods surprise people', ['Flash flooding can happen downstream from the heaviest rain. Water may rush through dry channels, urban streets, and low crossings after storms pass nearby.', 'At night, it is harder to judge water depth and road damage. The safest choice is to turn around.']],
      ['Driving is the big risk', ['Vehicles can float, stall, or be pushed off roads in water that looks manageable. Floodwater can hide washed-out pavement, debris, sinkholes, and strong current.', 'Do not follow another driver through water. Their vehicle may be heavier, higher, or simply lucky.']],
      ['Home and neighborhood actions', ['Move valuables upward if flooding is possible and safe to do so. Keep devices charged and know where higher ground is.', 'After flooding, avoid contaminated water and stay away from downed power lines.']]
    ],
    faqs: [
      ['Can flash flooding happen if it is not raining where I am?', 'Yes. Rain upstream or uphill can send water into your area.'],
      ['Is a flash flood warning more urgent than a flood warning?', 'A flash flood warning usually indicates rapid, dangerous flooding that needs immediate action.'],
      ['Should I walk through floodwater?', 'Avoid it. Moving water can knock people down and hide sharp debris, holes, or contamination.']
    ],
    related: ['/flash-flood-safety/', '/tornado-vs-flood/', '/monsoon-season-explained/', '/storm-surge-explained/']
  },
  {
    slug: 'lightning-at-home-safety',
    category: 'Lightning',
    title: 'Lightning Safety at Home: What to Avoid Indoors During Thunderstorms',
    description: 'Indoor lightning safety tips: plumbing, corded electronics, windows, porches, garages, pets, and when it is safe to resume normal activity.',
    quick: 'Being indoors is much safer than being outside during lightning, but not every indoor activity is risk-free. Avoid plumbing, corded electronics, windows, and open porches until the storm has moved away.',
    sections: [
      ['Why indoor risk exists', ['Lightning can travel through wiring, plumbing, metal framing, phone lines, and other conductive paths. A house greatly reduces risk, but it does not make every contact safe.', 'The safest indoor habit is simple: stay away from things that connect you to outside conductors.']],
      ['What to avoid', ['Do not shower, wash dishes, use corded phones, lean on windows, or stand in open garage doors during a thunderstorm.', 'Unplug sensitive electronics before storms arrive if you can do so safely. Do not unplug devices while lightning is already close.']],
      ['Safer places and activities', ['Interior rooms away from windows are better. Wireless devices on battery power are generally safer than corded devices.', 'Bring pets inside early. Dogs, cats, and livestock can be frightened by thunder and may run if doors or gates are open.']],
      ['When it is safe again', ['Use the common 30-minute rule: wait at least 30 minutes after the last thunder before resuming outdoor activities.', 'If thunder is audible, lightning is close enough to be a concern.']]
    ],
    faqs: [
      ['Can lightning come through plumbing?', 'Yes. Avoid showers, baths, and washing dishes during thunderstorms.'],
      ['Is Wi-Fi safe during lightning?', 'Using a wireless device on battery power is generally safer than using corded electronics connected to outlets.'],
      ['Can I stand on a covered porch during lightning?', 'No. Porches are still exposed. Move fully indoors.']
    ],
    related: ['/lightning-safety-guide/', '/tornado-and-lightning/', '/weather-trivia/lightning/', '/weather-radio-buying-guide/']
  },
  {
    slug: 'heat-index-danger-levels',
    category: 'Heat',
    title: 'Heat Index Danger Levels: Why Humidity Makes Heat More Dangerous',
    description: 'How heat index works, why humid heat stresses the body, warning signs of heat illness, and practical steps to stay safer during heat waves.',
    quick: 'Heat index estimates how hot it feels when humidity is included. Humid air slows sweat evaporation, which makes it harder for your body to cool itself.',
    sections: [
      ['Temperature vs heat index', ['Air temperature tells you how hot the air is. Heat index adds humidity to estimate body stress. A day that is 92 degrees with high humidity can feel much more dangerous than the number suggests.', 'Heat index is usually calculated for shade. Direct sun can make conditions feel even hotter.']],
      ['Why humidity matters', ['Sweat cools the body when it evaporates. When the air is humid, evaporation slows down and heat builds more easily.', 'This is why warm nights are dangerous during heat waves. The body gets less recovery time, especially without air conditioning.']],
      ['Warning signs', ['Heat exhaustion can involve heavy sweating, weakness, dizziness, nausea, headache, and cool clammy skin. Heat stroke is an emergency and can involve confusion, fainting, very high body temperature, or hot skin.', 'When in doubt, cool the person quickly and seek medical help for severe symptoms.']],
      ['Safer habits', ['Drink water, reduce outdoor work during peak heat, use shade and cooling centers, check on vulnerable people, and never leave people or pets in vehicles.', 'Fans help with comfort, but in extreme heat they may not be enough without cooler air or hydration.']]
    ],
    faqs: [
      ['Is heat index measured in the sun?', 'Heat index is generally for shade. Full sun can make conditions feel significantly hotter.'],
      ['Who is most vulnerable during heat waves?', 'Older adults, infants, outdoor workers, athletes, people without cooling, and people with certain medical conditions face higher risk.'],
      ['Can heat be dangerous at night?', 'Yes. Warm nights prevent the body and buildings from cooling down, increasing stress over several days.']
    ],
    related: ['/heat-wave-safety/', '/wind-chill-vs-heat-index/', '/urban-heat-island/', '/weather-app-comparison-2026/']
  },
  {
    slug: 'winter-storm-watch-vs-warning',
    category: 'Winter Weather',
    title: 'Winter Storm Watch vs Warning: Snow, Ice, Wind, and Travel Risk',
    description: 'What winter storm watches and warnings mean, how they differ from advisories, and why ice and wind can be more disruptive than snowfall totals alone.',
    quick: 'A winter storm watch means significant winter weather is possible. A warning means significant winter weather is expected or occurring. Use the watch to prepare and the warning to avoid travel if possible.',
    sections: [
      ['The alert ladder', ['Winter weather advisories, watches, and warnings describe increasing confidence or impact. Local criteria vary because a disruptive snow amount in one region may be routine in another.', 'Read the details. The headline may be snow, ice, blowing snow, sleet, or a mix.']],
      ['Why totals are not everything', ['Four inches of dry snow on a quiet Sunday is different from two inches of snow and ice during rush hour. Wind, timing, temperature, road treatment, and power line icing all matter.', 'Ice can create severe travel and power problems even when accumulation sounds small.']],
      ['What to do during a watch', ['Check supplies, charge devices, prepare backup heat safely, refill prescriptions if needed, and adjust travel plans before roads worsen.', 'If you rely on electricity for medical equipment, review backup options before the storm.']],
      ['What to do during a warning', ['Avoid unnecessary travel. If travel is unavoidable, carry warm clothing, water, food, phone power, scraper, shovel, and emergency supplies.', 'Keep generators outside and far from windows or doors. Carbon monoxide is a major winter storm danger.']]
    ],
    faqs: [
      ['Is a winter storm warning worse than a watch?', 'Yes. A warning means significant winter weather is expected or already happening.'],
      ['Can ice be worse than snow?', 'Yes. Ice can make travel nearly impossible and add weight to trees and power lines.'],
      ['Do winter warning criteria vary by location?', 'Yes. Local offices set criteria based on regional climate and expected impacts.']
    ],
    related: ['/snowfall-forecast-explained/', '/snowstorm-vs-blizzard-vs-whiteout/', '/ice-storm-safety/', '/wind-chill-vs-heat-index/']
  },
  {
    slug: 'blizzard-whiteout-driving-safety',
    category: 'Winter Weather',
    title: 'Blizzard and Whiteout Driving Safety: When Roads Disappear',
    description: 'How blizzards and whiteouts reduce visibility, why pileups happen, and what to do if you are caught on the road during sudden blowing snow.',
    quick: 'A whiteout can erase road edges, stopped vehicles, and lane markers in seconds. The safest plan is to avoid travel before conditions collapse.',
    sections: [
      ['Why visibility crashes', ['Blizzards combine snow or blowing snow with strong wind and low visibility. Whiteouts can also happen in intense snow squalls that arrive suddenly.', 'Drivers may lose the horizon, road edges, traffic signals, and distance cues. That makes speed feel slower than it is.']],
      ['Pileup risk', ['When visibility drops suddenly, vehicles entering the same zone at highway speed may not see stopped traffic until it is too late.', 'Bridges, open fields, lake-effect bands, and wind gaps can create abrupt changes in visibility.']],
      ['If you are caught', ['Slow gradually, increase following distance, turn on headlights, avoid sudden braking, and leave the roadway only if you can do so safely.', 'If you become stranded, stay with the vehicle unless shelter is very close. Keep the exhaust clear if running the engine for heat.']],
      ['Before you travel', ['Check road conditions, radar, warnings, and wind forecasts. Carry winter supplies and tell someone your route.', 'The best winter driving decision is often delaying the trip until plows, daylight, and lower winds improve conditions.']]
    ],
    faqs: [
      ['Is a snow squall the same as a blizzard?', 'No. A snow squall is usually shorter and more localized, but it can create sudden dangerous whiteouts.'],
      ['Should I use hazard lights in a whiteout?', 'Use local driving guidance. Headlights are essential; hazard light use while moving varies by jurisdiction and situation.'],
      ['What if I get stranded in snow?', 'Stay with the vehicle, call for help, conserve fuel, and keep the exhaust pipe clear before running the engine.']
    ],
    related: ['/snowstorm-vs-blizzard-vs-whiteout/', '/winter-storm-watch-vs-warning/', '/snowfall-forecast-explained/', '/wind-chill-vs-heat-index/']
  },
  {
    slug: 'hail-damage-car-roof-guide',
    category: 'Hail',
    title: 'Hail Damage Guide: Cars, Roofs, Windows, and Insurance Notes',
    description: 'What hail can damage, how hail size relates to impacts, what to check after a storm, and how to document damage safely.',
    quick: 'After a hailstorm, check vehicles, shingles, gutters, vents, skylights, siding, and windows from safe locations. Document damage with photos before cleanup when possible.',
    sections: [
      ['What hail damages', ['Hail can dent vehicles, crack windshields, bruise shingles, damage vents, break skylights, shred plants, and chip siding or paint.', 'Damage depends on hail size, density, wind speed, roof age, material, and how long the hail falls.']],
      ['Safety first', ['Do not climb onto a wet or damaged roof. Look from the ground, windows, attic, or with a qualified inspector if needed.', 'Watch for broken glass, slick surfaces, loose branches, and downed lines after severe storms.']],
      ['Documentation', ['Take wide photos and close photos. Include timestamps when possible, and photograph hailstones with a ruler or common object if it is safe.', 'Keep receipts for temporary repairs such as tarps. Avoid permanent repairs until you understand insurance requirements.']],
      ['Prevention and preparedness', ['If severe hail is forecast, park under sturdy cover when available and move fragile outdoor items inside.', 'Impact-resistant roofing materials and shutters can reduce some risk, but no exterior surface is hail-proof in every storm.']]
    ],
    faqs: [
      ['What size hail damages cars?', 'Hail around quarter size can start causing dents, but damage depends on wind, hail hardness, vehicle surface, and storm duration.'],
      ['Should I climb on my roof after hail?', 'No. Inspect from safe locations or use a qualified professional.'],
      ['Can hail damage show up later?', 'Yes. Roof bruising, leaks, or weakened materials may become more obvious after later rain or aging.']
    ],
    related: ['/hail-size-scale/', '/how-hail-forms/', '/tornado-and-hail/', '/tornado-insurance-claim-checklist/']
  },
  {
    slug: 'air-quality-smoke-weather-guide',
    category: 'Air Quality',
    title: 'Air Quality and Wildfire Smoke Weather Guide',
    description: 'How weather moves wildfire smoke, what AQI means, why smoke can travel far from fires, and practical steps for indoor and outdoor safety.',
    quick: 'Wildfire smoke can travel hundreds or thousands of miles depending on wind patterns, stability, and storm systems. AQI helps translate pollution levels into health guidance.',
    sections: [
      ['Why smoke travels so far', ['Large fires can loft smoke high into the atmosphere. Winds then carry it across states, provinces, or entire regions.', 'Weather patterns determine whether smoke stays aloft, mixes down to the surface, or clears out with a front or storm.']],
      ['AQI basics', ['The Air Quality Index translates pollutant levels into color-coded health categories. Higher AQI means more people may feel effects, and sensitive groups may be affected earlier.', 'Smoke contains fine particles that can irritate lungs and worsen asthma, heart disease, and other health conditions.']],
      ['Indoor steps', ['Close windows and doors, use filtered air if available, avoid adding indoor particles from candles or frying, and create a cleaner room with a suitable air purifier if you can.', 'Check filter ratings and device size. A small purifier may not clean a large open area effectively.']],
      ['Outdoor decisions', ['Reduce heavy outdoor exertion when smoke is high. Schools, sports teams, and outdoor workers should use local AQI guidance.', 'Masks designed for particles can help when fitted well, but they are not a substitute for cleaner indoor air during severe smoke events.']]
    ],
    faqs: [
      ['Can wildfire smoke affect areas with no nearby fire?', 'Yes. Upper-level winds can carry smoke very far from the source fire.'],
      ['Does rain clear smoke?', 'Rain can help, but wind shifts and atmospheric mixing often matter too. Smoke can return if transport patterns continue.'],
      ['Who is most sensitive to smoke?', 'Children, older adults, pregnant people, outdoor workers, and people with asthma, COPD, heart disease, or other health conditions can be more vulnerable.']
    ],
    related: ['/wildfire-weather-and-tornadoes/', '/weather-satellite-guide/', '/weather-app-comparison-2026/', '/heat-wave-safety/']
  },
  {
    slug: 'rip-current-weather-safety',
    category: 'Marine Weather',
    title: 'Rip Current Weather Safety: Why Calm-Looking Beaches Can Be Dangerous',
    description: 'How rip currents form, weather patterns that increase risk, warning signs at the beach, and what to do if you are caught in one.',
    quick: 'Rip currents are fast-moving channels of water flowing away from shore. They can occur even when the beach does not look stormy, especially with swell, sandbars, and onshore wave energy.',
    sections: [
      ['What a rip current does', ['A rip current pulls water away from shore through a narrow channel. It does not pull people underwater, but it can pull swimmers away from the beach and cause exhaustion.', 'Trying to swim straight back against the current is the classic mistake.']],
      ['Weather and wave setup', ['Distant storms, tropical systems offshore, strong onshore winds, and changing sandbars can raise rip current risk even under sunny skies.', 'That is why beach forecasts matter. Local surf conditions can be dangerous even when inland weather is pleasant.']],
      ['Signs at the beach', ['Look for channels of choppy darker water, gaps in breaking waves, foam or debris moving seaward, or posted warnings from lifeguards.', 'Signs are not always obvious. If lifeguards are present, ask about conditions before entering the water.']],
      ['If caught', ['Stay calm, float, call or wave for help, and swim parallel to shore until out of the current. Then angle back toward the beach.', 'If you cannot escape, conserve energy and keep your airway above water while signaling.']]
    ],
    faqs: [
      ['Can rip currents happen on sunny days?', 'Yes. Swell from distant storms can create dangerous currents under clear skies.'],
      ['Should I swim directly back to shore?', 'No. Swim parallel to shore until out of the current, then return at an angle.'],
      ['Are rip currents only an ocean problem?', 'They are most associated with surf beaches, but dangerous currents can also occur near piers, inlets, and large lakes.']
    ],
    related: ['/marine-weather-explained/', '/marine-weather-glossary/', '/hurricane-season-preparedness/', '/weather-radio-buying-guide/']
  },
  {
    slug: 'weather-fronts-explained',
    category: 'Weather Science',
    title: 'Weather Fronts Explained: Cold, Warm, Stationary, and Occluded Fronts',
    description: 'What weather fronts are, why they create clouds and storms, and how to read cold, warm, stationary, and occluded fronts on a weather map.',
    quick: 'A front is a boundary between air masses. Fronts matter because they lift air, focus moisture, shift winds, and often trigger clouds, rain, snow, thunderstorms, or temperature changes.',
    sections: [
      ['Cold fronts', ['A cold front marks advancing colder air. It often pushes under warmer air, forcing lift that can create showers, thunderstorms, gusty wind shifts, and falling temperatures.', 'Fast-moving cold fronts can produce narrow lines of storms, especially when moisture and instability are present.']],
      ['Warm fronts', ['A warm front marks warmer air advancing over cooler air near the surface. Because the warm air glides upward more gradually, clouds and precipitation can spread out over a large area.', 'Warm fronts can bring steady rain, snow, sleet, freezing rain, fog, or low clouds depending on temperatures.']],
      ['Stationary and occluded fronts', ['A stationary front stalls between air masses and can focus repeated rounds of rain or storms. Flooding risk can rise if storms train along the same boundary.', 'An occluded front forms in mature low-pressure systems when a cold front catches a warm front, often wrapping precipitation around the storm.']],
      ['Using front maps', ['Fronts are guides, not walls. Weather can occur ahead of, along, or behind a front depending on moisture, upper-level energy, and local terrain.', 'Combine front maps with radar, satellite, watches, warnings, and local forecasts for better context.']]
    ],
    faqs: [
      ['Do fronts always cause storms?', 'No. They need enough moisture, lift, instability, and support. Some fronts pass with clouds or only a wind shift.'],
      ['Why can stationary fronts cause flooding?', 'They can focus repeated rain or thunderstorms over the same area.'],
      ['What do triangles and semicircles mean on weather maps?', 'Triangles usually mark cold fronts, semicircles mark warm fronts, and alternating symbols can mark stationary fronts.']
    ],
    related: ['/weather-map-symbols/', '/reading-a-weather-map/', '/forecast-uncertainty-explained/', '/what-is-a-supercell/']
  },
  {
    slug: 'barometric-pressure-weather-guide',
    category: 'Weather Science',
    title: 'Barometric Pressure Weather Guide: What Rising and Falling Pressure Means',
    description: 'How barometric pressure relates to storms, wind, clouds, clear weather, headaches, altimeters, and home weather stations.',
    quick: 'Barometric pressure is the weight of the air above you. Falling pressure often signals approaching unsettled weather, while rising pressure often follows improving or more stable conditions.',
    sections: [
      ['What pressure measures', ['Air has weight. Barometric pressure measures that weight at a location. Weather maps use pressure patterns to identify highs, lows, fronts, and wind patterns.', 'Pressure changes matter as much as the number itself. A rapid fall can signal a strengthening storm system.']],
      ['Low pressure and high pressure', ['Low pressure is often associated with rising air, clouds, precipitation, and storm systems. High pressure is often associated with sinking air, clearer skies, and calmer weather, though there are exceptions.', 'The pressure difference between areas drives wind. A tight pressure gradient often means stronger winds.']],
      ['Home weather stations', ['A home barometer can show local pressure trends, but it should be calibrated for elevation if you want sea-level pressure comparisons.', 'Pair pressure trends with clouds, wind, humidity, radar, and official forecasts rather than using pressure alone.']],
      ['Human and practical effects', ['Some people report headaches or joint pain during pressure changes, though experiences vary. Aviation and marine users watch pressure closely for altimeter settings and storm signals.', 'For everyday planning, pressure is most useful as one clue in a larger forecast picture.']]
    ],
    faqs: [
      ['Does falling pressure always mean rain?', 'No. It often signals unsettled weather, but moisture and lift still matter.'],
      ['Why does pressure change with altitude?', 'Higher elevations have less air above them, so station pressure is lower. Weather reports often adjust pressure to sea level for comparison.'],
      ['Can pressure predict tornadoes?', 'Not by itself. Tornado risk depends on storm structure, instability, wind shear, moisture, lift, and other factors.']
    ],
    related: ['/home-weather-station-buying-guide/', '/weather-station-installation/', '/weather-map-symbols/', '/how-do-meteorologists-predict-tornadoes/']
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function titleFromPath(href) {
  return href.replace(/^\/|\/$/g, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function schema(page) {
  const url = `${site}/${page.slug}/`;
  return [
    '<script type="application/ld+json">',
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.description,
      author: { '@type': 'Organization', name: 'Tornado Hub' },
      publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site },
      datePublished: today,
      dateModified: today,
      mainEntityOfPage: url
    }),
    '</script>',
    '<script type="application/ld+json" data-seo="page">',
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, isPartOf: { '@id': `${site}/#website` }, publisher: { '@id': `${site}/#organization` }, inLanguage: 'en' },
        { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
          { '@type': 'ListItem', position: 2, name: page.title, item: url }
        ] }
      ]
    }),
    '</script>',
    '<script type="application/ld+json">',
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }))
    }),
    '</script>'
  ].join('\n');
}

function renderPage(page) {
  const sections = page.sections.map(([heading, paragraphs]) => `
    <h2>${escapeHtml(heading)}</h2>
${paragraphs.map((paragraph) => `    <p>${escapeHtml(paragraph)}</p>`).join('\n')}
  `).join('\n');
  const faqs = page.faqs.map(([question, answer]) => `
    <h3>${escapeHtml(question)}</h3>
    <p>${escapeHtml(answer)}</p>
  `).join('\n');
  const related = page.related.map((href) => `      <li><a href="${href}">${escapeHtml(titleFromPath(href))}</a></li>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}" />
<meta name="twitter:description" content="${escapeHtml(page.description)}" />
<meta name="twitter:title" content="${escapeHtml(page.title)}" />
<meta name="twitter:card" content="summary" />
<meta property="og:url" content="${site}/${page.slug}/" />
<meta property="og:type" content="article" />
<meta property="og:description" content="${escapeHtml(page.description)}" />
<meta property="og:title" content="${escapeHtml(page.title)}" />
<meta property="og:site_name" content="Tornado Hub" />
<link rel="canonical" href="${site}/${page.slug}/" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8C%AA%EF%B8%8F%3C/text%3E%3C/svg%3E" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
${schema(page)}
<style>
:root { --bg:#fbfaf7; --bg-alt:#f4f1ea; --surface:#fff; --text:#14161c; --text-secondary:#4a5061; --text-muted:#8b8f9c; --border:#e5e1d8; --border-strong:#d4cfc3; --accent:#a02818; --accent-hover:#7d1f13; --link:#1e3a5f; --serif:"Fraunces",Georgia,serif; --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { font-family:var(--sans); background:var(--bg); color:var(--text); line-height:1.65; -webkit-font-smoothing:antialiased; }
a { color:var(--link); text-decoration:none; }
a:hover { color:var(--accent); text-decoration:underline; }
.nav { background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
.nav-inner { max-width:1200px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
.nav-brand { font-family:var(--serif); font-weight:700; font-size:20px; color:var(--text); text-decoration:none; }
.nav-links { display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
.nav-links a { color:var(--text-secondary); padding:8px 14px; font-size:14px; font-weight:500; border-radius:6px; text-decoration:none; }
.nav-links a:hover { background:var(--bg-alt); color:var(--text); text-decoration:none; }
.nav-links a.cta { background:var(--accent); color:white; font-weight:600; }
.breadcrumb { max-width:820px; margin:0 auto; padding:16px 24px 0; font-size:13px; color:var(--text-muted); }
.article { max-width:720px; margin:0 auto; padding:24px 24px 56px; }
.article-header { padding-bottom:32px; border-bottom:1px solid var(--border); margin-bottom:32px; }
.eyebrow { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:12px; }
h1 { font-family:var(--serif); font-size:clamp(30px,4vw,44px); font-weight:700; line-height:1.15; margin-bottom:16px; letter-spacing:-.02em; }
.lede { font-size:19px; color:var(--text-secondary); line-height:1.55; }
h2 { font-family:var(--serif); font-size:26px; margin:44px 0 14px; letter-spacing:-.01em; }
h3 { font-family:var(--serif); font-size:20px; margin:28px 0 10px; }
p { margin-bottom:16px; font-size:17px; }
.quick-answer { background:var(--surface); border-left:4px solid var(--accent); padding:18px 20px; margin:28px 0; box-shadow:0 2px 10px rgba(0,0,0,.04); }
.faq,.related { margin-top:44px; padding-top:28px; border-top:1px solid var(--border); }
.related ul { list-style:none; margin-top:12px; }
.related li { margin-bottom:8px; }
.inline-ad { text-align:center; margin:32px 0; min-height:90px; }
.footer { background:#14161c; color:#94a3b8; padding:40px 24px; border-top:4px solid var(--accent); }
.footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:20px; font-size:13px; }
.footer a { color:white; }
@media (max-width:600px) { .nav-links a { padding:6px 10px; font-size:13px; } .footer-inner { flex-direction:column; } }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-brand">Tornado Hub</a>
    <div class="nav-links">
      <a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/quiz/">Quizzes</a><a href="/weather-trivia/">Weather Trivia</a><a href="/tornadoes/">Tornado Index</a><a href="/learn/">Learn</a><a href="/safety/">Safety</a><a href="/simulator/" class="cta">Launch Simulator</a>
    </div>
  </div>
</nav>
<div class="breadcrumb"><a href="/">Home</a> - <a href="/articles/">Articles</a> - ${escapeHtml(page.title)}</div>
<article class="article">
  <header class="article-header">
    <div class="eyebrow">${escapeHtml(page.category)}</div>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="lede">${escapeHtml(page.description)}</p>
  </header>
  <div class="quick-answer"><strong>Quick answer:</strong> ${escapeHtml(page.quick)}</div>
  <div class="inline-ad">
    <script type="text/javascript">atOptions={'key':'1fe957d85bb2cf92027de309038cd17b','format':'iframe','height':250,'width':300,'params':{}};</script>
    <script type="text/javascript" src="https://www.highperformanceformat.com/1fe957d85bb2cf92027de309038cd17b/invoke.js"></script>
  </div>
${sections}
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
${faqs}
  </section>
  <section class="related">
    <h2>Related Guides</h2>
    <ul>
${related}
    </ul>
  </section>
</article>
<footer class="footer">
  <div class="footer-inner">
    <span>Tornado Hub. Educational resource, not a live warning system.</span>
    <span><a href="/">Home</a> - <a href="/articles/">Articles</a> - <a href="/safety/">Safety</a> - <a href="/simulator/">Simulator</a></span>
  </div>
</footer>
<script src="/assets/article-tracker.js" defer></script>
<script src="/assets/ads-config.js" defer></script>
<script src="/assets/ads.js" defer></script>
<script src="/assets/house-ads.js" defer></script>
</body>
</html>
`;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'work'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function textBetween(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function categoryFor(file, html) {
  const eyebrow = textBetween(html, /class=["'][^"']*(?:eyebrow|page-eyebrow|article-cat|section-eyebrow)[^"']*["'][^>]*>([^<]+)/i);
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
  const urls = items.map((item) => `  <url>\n    <loc>${site}${item.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.path === '/' ? 'daily' : 'monthly'}</changefreq>\n    <priority>${item.path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  return items.length;
}

function updateArticlesIndex() {
  const file = path.join(root, 'articles', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const section = `<section class="cat-section" data-generated="weather-expansion">
  <h2 class="cat-heading">Weather and hurricane guides <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Fresh guides branching into hurricanes, typhoons, floods, lightning, winter storms, heat, marine weather, and weather-map basics.</p>
  <div class="link-grid">
${pages.map((page) => `    <a class="link-card" href="/${page.slug}/">${escapeHtml(page.title)} <small>${escapeHtml(page.category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="weather-expansion">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section" data-generated="preparedness-playbooks">/, section + '<section class="cat-section" data-generated="preparedness-playbooks">');
  fs.writeFileSync(file, html);
}

for (const page of pages) {
  const dir = path.join(root, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(page));
}

updateArticlesIndex();
const total = rebuildContentIndexAndSitemap();
console.log(`Added ${pages.length} weather articles and rebuilt ${total} indexed URLs.`);

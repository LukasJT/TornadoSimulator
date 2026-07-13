import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

const pages = [
  {
    slug: 'tornado-watch-prep-list',
    category: 'Preparedness',
    title: 'Tornado Watch Prep List: What to Do Before a Warning',
    description: 'A practical tornado watch checklist for families, schools, and workplaces: alerts, shelter rooms, shoes, helmets, pets, phones, and power outage prep.',
    quick: 'A tornado watch means conditions can support tornadoes. Use the watch window to set alerts, clear your shelter space, charge phones, move pets indoors, and get ready to act fast if a warning is issued.',
    sections: [
      ['What a watch should trigger', ['A watch is not the moment to panic, but it is the moment to prepare. Check that every phone can receive weather alerts, turn on a weather radio if you have one, and make sure someone is watching the radar or local updates.', 'The best use of watch time is removing friction. Put shoes near the shelter area, bring pets inside, move helmets or hard hats nearby, and make sure the safest room is not blocked by boxes, laundry, or furniture.']],
      ['The five-minute setup', ['Pick the shelter room before storms arrive. In most homes that means a basement, storm shelter, safe room, or a small interior room on the lowest floor away from windows.', 'Bring a flashlight, charger, battery pack, medication, leash or pet carrier, and a way to hear updates. If you have kids, give each person a simple job so the move to shelter feels familiar instead of chaotic.']],
      ['For apartments and mobile homes', ['Apartment residents should identify the lowest interior hallway, bathroom, stairwell, or designated shelter area. Ask the property manager where residents are expected to go during a warning.', 'Mobile homes are not reliable tornado shelters. During a watch, decide where you will go if a warning is issued: a neighbor basement, community shelter, sturdy public building, or other preselected safe place.']],
      ['When to escalate', ['If a tornado warning is issued for your location, stop preparing and shelter immediately. If storms are approaching quickly, do not wait for outdoor sirens or visible clouds.', 'If you are under a watch at night, set multiple alert sources before sleeping. A loud phone alert, weather radio, and trusted app reduce the chance of missing a warning.']]
    ],
    faqs: [
      ['Should I shelter during a tornado watch?', 'Usually no, unless a storm is already near you. A watch is the time to prepare so you can shelter immediately if a warning arrives.'],
      ['How long can a tornado watch last?', 'Many watches last several hours because they cover a broad storm risk period. Check the expiration time and keep monitoring updates.'],
      ['What is the most important thing to do during a watch?', 'Make sure you have alerts that can wake you and a shelter plan you can follow in less than a minute.']
    ],
    related: ['/watch-vs-warning/', '/tornado-warning-vs-watch/', '/tornado-preparation-checklist/', '/tornado-safety/']
  },
  {
    slug: 'tornado-warning-action-plan',
    category: 'Safety',
    title: 'Tornado Warning Action Plan: The First 60 Seconds',
    description: 'What to do immediately when a tornado warning is issued, including shelter choices, family roles, pets, phones, and what not to waste time doing.',
    quick: 'When a tornado warning includes your location, move to shelter first. Confirming the storm, watching video, or checking multiple apps can wait until everyone is in the safest available place.',
    sections: [
      ['Move first, verify second', ['A warning means a tornado is occurring or possible soon. The first action is physical: get to the basement, storm shelter, safe room, or smallest interior room on the lowest floor.', 'Do not stand at a window, step outside, or drive around to look. Tornadoes can be rain-wrapped, fast-moving, or hidden by darkness, and radar images may already be several minutes old.']],
      ['Assign simple roles', ['A warning action plan works best when roles are obvious. One person gathers children, one grabs pets if they are nearby, one brings the weather radio or phone, and everyone meets in the shelter area.', 'Keep the plan small. During a warning, people remember short instructions better than long checklists.']],
      ['Protect heads and bodies', ['Once sheltered, get low and protect your head and neck. Helmets, cushions, blankets, mattresses, or heavy coats can reduce injury from debris.', 'Shoes matter after a tornado because broken glass, nails, insulation, and splintered wood can cover floors and yards. Keep sturdy footwear near the shelter area during storm days.']],
      ['After the immediate threat', ['Wait for the warning to expire or for trusted local information saying the storm has passed. Some storms produce more than one tornado, and a second circulation can follow behind the first.', 'If damage occurred, watch for gas smells, downed power lines, unstable walls, and sharp debris. Use texts instead of calls when networks are busy.']]
    ],
    faqs: [
      ['Should I wait for sirens before sheltering?', 'No. Sirens are outdoor warning tools and may not sound indoors. Use the warning text, phone alert, weather radio, or trusted local source.'],
      ['What if I am driving when the warning hits?', 'If a sturdy building is nearby, get inside. If not, avoid overpasses, assess your options quickly, and do not drive into the storm path.'],
      ['Should I open windows?', 'No. Opening windows wastes time and can increase exposure to glass and debris. Shelter immediately.']
    ],
    related: ['/tornado-warning-polygon-explained/', '/tornado-car-safety-myths/', '/tornado-shelter-without-basement/', '/after-a-tornado/']
  },
  {
    slug: 'outdoor-sirens-tornado-meaning',
    category: 'Warnings',
    title: 'What Outdoor Tornado Sirens Mean and What They Do Not Mean',
    description: 'A clear guide to outdoor warning sirens: why they exist, why you may not hear them indoors, and why phone alerts and weather radios matter.',
    quick: 'Outdoor sirens are designed to warn people outside. They are not a complete indoor alert system, and a siren does not always mean the tornado is directly over your neighborhood.',
    sections: [
      ['Sirens are outdoor tools', ['Many communities install sirens to reach people at parks, fields, downtown sidewalks, and other outdoor areas. Walls, wind, rain, traffic, air conditioning, and distance can make them hard to hear indoors.', 'That is why a phone alert, weather radio, and trusted weather app are better primary alert sources at home. Sirens are useful, but they should be a backup.']],
      ['Why sirens may sound broadly', ['Some places activate sirens for an entire city or county even when the warning polygon covers only part of the area. Others activate sirens based on smaller zones.', 'This can make sirens feel confusing. If you hear one, go indoors, check a trusted source, and shelter if the warning includes your location.']],
      ['No all-clear signal', ['Many siren systems do not provide an all-clear tone. A second siren can mean a new warning, an extension, or another activation cycle.', 'Use warning expiration times, radar updates, and local emergency information to decide when the threat has passed.']],
      ['Build a better alert stack', ['A good alert stack has layers: Wireless Emergency Alerts on your phone, a NOAA weather radio, a reliable weather app, local broadcast updates, and sirens when you are outside.', 'At night, redundancy matters most. Set alerts loud enough to wake you and keep devices charged during severe weather days.']]
    ],
    faqs: [
      ['Does a siren always mean a tornado is on the ground?', 'No. It can mean a tornado warning, dangerous rotation, or another local severe weather policy depending on the community.'],
      ['Why did my phone alert but no siren sounded?', 'Your location may be inside a warning polygon while the siren zone was not activated, or the siren may be too far away to hear indoors.'],
      ['Can I rely on sirens while sleeping?', 'No. Use phone alerts and a weather radio for overnight warnings.']
    ],
    related: ['/tornado-siren/', '/wireless-emergency-alert-tornado/', '/tornado-warning-sound/', '/tornado-warning-language-decoded/']
  },
  {
    slug: 'best-room-during-tornado',
    category: 'Shelter',
    title: 'Best Room During a Tornado: How to Rank Your Shelter Options',
    description: 'How to choose the safest room during a tornado when you do not have a basement: interior rooms, bathrooms, closets, hallways, apartments, and offices.',
    quick: 'The best tornado room is low, interior, small, windowless, and structurally surrounded. Basements and safe rooms are best, but an interior bathroom, closet, or hallway can be the best available option in many buildings.',
    sections: [
      ['The room ranking rule', ['Start with the lowest floor. Then move as far inside the building as possible. Then choose the smallest room or hallway with the fewest windows and the most walls between you and outside.', 'A basement, storm shelter, or engineered safe room usually ranks highest. If those are not available, an interior bathroom or closet often beats a large open living room.']],
      ['Why small rooms help', ['Small rooms have shorter spans and more surrounding walls, which can offer better protection from wind and debris than wide open spaces.', 'Bathrooms sometimes perform well because plumbing walls and compact layouts add structure, but this is not guaranteed. The main idea is interior, low, and away from glass.']],
      ['Rooms to avoid', ['Avoid rooms with big windows, garage doors, exterior walls, large roof spans, or heavy objects that could fall. Garages, sunrooms, cafeterias, gyms, warehouses, and big-box store sales floors can be poor shelter choices.', 'In apartments, avoid balconies, top floors when a lower option is available, and windowed rooms facing the storm.']],
      ['Make the room ready', ['Keep the shelter room usable. Do not let it become a storage closet that nobody can enter quickly.', 'Place shoes, flashlights, a battery pack, basic first aid, and helmets or thick padding nearby. The room should be ready before the warning, not after it.']]
    ],
    faqs: [
      ['Is a bathtub safe during a tornado?', 'A bathtub can be a good place if it is in an interior bathroom on the lowest floor and away from windows. Cover your head and body.'],
      ['Is a closet better than a hallway?', 'It depends on location. Choose the option with fewer windows, more interior walls, and less overhead risk.'],
      ['Is under the stairs a good tornado shelter?', 'It can be a strong option if it is interior and on the lowest floor, but avoid it if nearby windows or exterior walls expose you to debris.']
    ],
    related: ['/tornado-shelter-without-basement/', '/tornado-safety-basement/', '/tornado-safe-room-cost-benefit/', '/tornado-safety-apartment/']
  },
  {
    slug: 'mobile-home-night-tornado-plan',
    category: 'Mobile Homes',
    title: 'Mobile Home Night Tornado Plan: What to Decide Before Bed',
    description: 'A nighttime tornado plan for mobile home residents, including alert layers, relocation choices, pets, medications, and when to leave early.',
    quick: 'Mobile homes are not safe tornado shelters. On nights with serious tornado risk, decide before bed where you will go, how you will wake up, and what trigger will make you leave.',
    sections: [
      ['Why night planning matters', ['Night tornadoes are dangerous because people may be asleep, roads may be dark, and storms can be harder to see. Mobile homes add another layer of risk because they can fail in winds far below violent tornado strength.', 'The goal is not to make a mobile home safe. The goal is to avoid being inside it when a nearby tornado warning arrives.']],
      ['Choose a relocation trigger', ['Do not wait until the storm is on top of you. If forecasters highlight a significant overnight tornado threat, consider staying with family, using a community shelter, or going to a sturdy building before storms arrive.', 'A warning trigger should be simple: if a tornado warning includes your area or a nearby upstream area, leave only if you can reach shelter safely and quickly. If the storm is already close, driving can be more dangerous.']],
      ['Build alert redundancy', ['Use more than one alert. Keep Wireless Emergency Alerts on, set a loud weather app alert, and use a NOAA weather radio with fresh batteries.', 'Put the phone where you can hear it, not across the room on silent. Charge devices before sleeping.']],
      ['Pack for a fast move', ['Keep shoes, keys, wallet, medications, pet carriers, and a flashlight in one place. If you need a car seat or mobility aid, have it ready before storms arrive.', 'Practice the route to your shelter option. At night, a familiar route reduces hesitation.']]
    ],
    faqs: [
      ['Is a mobile home bathroom safe in a tornado?', 'No room in a mobile home should be treated as a reliable tornado shelter. A sturdy building or storm shelter is safer.'],
      ['Should I drive away from a tornado warning at night?', 'Only if the storm is not yet near and your shelter route is short and safe. Do not drive into the storm path.'],
      ['What if my park has no shelter?', 'Identify a nearby sturdy building, community shelter, neighbor basement, or other option before severe weather days.']
    ],
    related: ['/mobile-home-tornado-safety/', '/tornado-safety-mobile-home-community/', '/tornado-safety-rv-park/', '/tornado-night-safety-plan/']
  },
  {
    slug: 'apartment-interior-room-tornado',
    category: 'Apartments',
    title: 'Apartment Tornado Shelter Plan: Interior Rooms, Hallways, and Stairs',
    description: 'How apartment residents can choose safer tornado shelter options, especially on upper floors or in buildings without basements.',
    quick: 'Apartment residents should move to the lowest accessible level and choose an interior, windowless space such as a hallway, bathroom, stairwell, or designated shelter area.',
    sections: [
      ['Know the building before storms', ['Apartment tornado plans work best when you ask questions early. Find out whether your building has a basement, interior stairwell, laundry room, office, reinforced room, or designated shelter space.', 'If the only option is inside your unit, identify the most interior bathroom, closet, or hallway away from windows.']],
      ['Upper-floor decisions', ['Upper floors are more exposed to wind and roof failure. If you can safely move to a lower interior level before the storm arrives, do it.', 'Do not use elevators during severe weather if power could fail. Stairs are usually more reliable, and interior stairwells may offer better protection than windowed rooms.']],
      ['Neighbors and access', ['Some residents need help moving quickly. A good apartment plan includes neighbors, property managers, and shared expectations for warnings.', 'If doors lock between floors or common areas, ask management how shelter access works during tornado warnings.']],
      ['What to bring', ['Bring shoes, phone, charger, keys, medication, glasses, pets if possible, and something to protect your head. Keep the kit light because speed matters.', 'After the storm, watch for broken glass in hallways, damaged stairwells, and power outages.']]
    ],
    faqs: [
      ['Is an apartment hallway safe during a tornado?', 'An interior hallway on a low floor can be a good option if it is away from windows and exterior doors.'],
      ['Should I shelter in my apartment bathtub?', 'It can be the best in-unit option if the bathroom is interior and windowless, especially on a lower floor.'],
      ['Should apartment residents go to the parking garage?', 'Only if management designates it as a shelter and it is structurally appropriate. Open parking areas can expose people to wind and debris.']
    ],
    related: ['/tornado-safety-apartment/', '/tornado-safety-high-rise-building/', '/best-room-during-tornado/', '/tornado-shelter-without-basement/']
  },
  {
    slug: 'office-tornado-drill-template',
    category: 'Workplace',
    title: 'Office Tornado Drill Template for Managers and Teams',
    description: 'A simple office tornado drill plan with shelter zones, alert roles, visitor handling, accountability, and post-drill improvements.',
    quick: 'A workplace tornado drill should answer four questions: who announces the warning, where each team goes, how visitors are handled, and how managers confirm people are accounted for.',
    sections: [
      ['Map shelter zones', ['Divide the workplace into shelter zones based on distance and capacity. Use interior rooms, lower-level hallways, restrooms, stairwells, or other spaces away from glass and large roof spans.', 'Avoid lobbies, conference rooms with windows, warehouses, cafeterias, and open atriums unless there is no safer option.']],
      ['Assign warning roles', ['One person should monitor alerts on severe weather days, but the system should not depend on one person being present. Cross-train backups.', 'When a warning arrives, instructions should be short: move now, use the closest marked shelter area, bring visitors, and protect your head.']],
      ['Practice visitor handling', ['Reception, customer service, and public-facing teams need a plan for visitors who may not know the building. Staff should guide them calmly to the nearest shelter zone.', 'Post small shelter signs where they help navigation, especially near hallways and stairwells.']],
      ['Review after the drill', ['After the drill, ask what slowed people down. Were doors locked, hallways blocked, shelter rooms too crowded, or alerts unclear?', 'Fix those issues before the next severe weather day. A drill is only useful if it changes the building plan.']]
    ],
    faqs: [
      ['How often should an office run a tornado drill?', 'At least annually in tornado-prone regions, and before peak local severe weather season if possible.'],
      ['Should employees leave work during a tornado warning?', 'No. They should shelter in the building unless they are already outside and can reach a safer sturdy structure immediately.'],
      ['Are conference rooms good tornado shelters?', 'Only if they are interior, windowless, and not under a large unsupported roof span. Many conference rooms are poor options because of glass.']
    ],
    related: ['/tornado-safety-at-work/', '/business-tornado-continuity/', '/tornado-drills-workplace/', '/tornado-safety-by-location/']
  },
  {
    slug: 'school-bus-tornado-safety',
    category: 'Schools',
    title: 'School Bus Tornado Safety: Drivers, Routes, and Shelter Decisions',
    description: 'What schools and bus drivers should consider when severe weather threatens during routes, field trips, arrivals, and dismissals.',
    quick: 'A school bus is not a tornado shelter. The safest plan is to avoid having buses on threatened routes and to move students into a sturdy building before storms arrive.',
    sections: [
      ['Avoid the route if possible', ['The best school bus tornado plan happens before students board. If a tornado warning or high-confidence threat overlaps dismissal, delay departure and keep students in the school shelter area.', 'Routes through open country, tree-lined roads, and flood-prone areas can become dangerous quickly during tornadic storms.']],
      ['Driver decision points', ['Drivers need clear instructions for warnings, not vague advice. If a sturdy building is nearby and there is time, get students inside. If no building is available, follow district emergency procedures and avoid overpasses.', 'Communication between dispatch, drivers, and school administrators should be tested before severe weather season.']],
      ['Field trips and events', ['Field trip leaders should know shelter options at the destination, along the route, and at fuel or rest stops. Outdoor trips need a cancellation threshold when tornado risk is elevated.', 'A bus parked near a stadium, park, or fairground should not be treated as shelter during a warning.']],
      ['Parent communication', ['Parents need to know that delayed dismissal can be a safety decision. A short message before storms arrive can prevent pressure to release buses into a warning.', 'After a warning, communicate when routes resume and where students are waiting.']]
    ],
    faqs: [
      ['Is a school bus safe in a tornado?', 'No. Buses are vulnerable to strong winds and debris. A sturdy building is safer.'],
      ['Should a bus shelter under an overpass?', 'No. Overpasses can create dangerous wind effects and expose people to debris and traffic.'],
      ['Should schools delay dismissal for tornado risk?', 'Yes, when warnings or dangerous storms threaten routes. Keeping students in a sturdy building can be safer than sending buses out.']
    ],
    related: ['/tornado-safety-at-school/', '/tornado-safety-highway/', '/tornado-car-safety-myths/', '/tornado-safety-by-location/']
  },
  {
    slug: 'hotel-tornado-safety',
    category: 'Travel',
    title: 'Hotel Tornado Safety: What to Do When You Are Away From Home',
    description: 'How travelers can find safer tornado shelter areas in hotels, motels, resorts, and roadside lodging before severe weather arrives.',
    quick: 'In a hotel, ask for the designated shelter area before storms arrive. If none is provided, move to the lowest interior hallway, stairwell, meeting room, restroom, or service corridor away from windows.',
    sections: [
      ['Ask before the warning', ['When checking in during severe weather season, ask the front desk where guests should go during a tornado warning. A good answer is specific, not improvised.', 'If staff are unsure, identify your own options: interior stairwells, windowless hallways, restrooms, laundry rooms, or lower-level service corridors.']],
      ['Motels and exterior doors', ['Motels with exterior room doors can be more exposed than interior-corridor hotels. If your room opens directly outside, you may need to move to the office, lobby interior, or another sturdy interior space before the storm arrives.', 'Avoid sheltering in a room with large windows, sliding glass doors, or exterior walls when a safer common area is available.']],
      ['High-rise hotels', ['Upper floors face more wind exposure. If there is time, move down to a lower interior level using stairs rather than elevators.', 'Do not crowd into glass lobbies or skybridges. Interior spaces away from windows are better.']],
      ['Travel kit basics', ['Keep shoes, phone, room key, wallet, medication, and a flashlight together. If the power fails, you do not want to search a dark hotel room.', 'After the storm, watch for broken glass in hallways, damaged ceiling panels, and blocked exits.']]
    ],
    faqs: [
      ['Should I shelter in a hotel bathroom?', 'It may be the best room-level option if it is interior and windowless, but a designated lower shelter area is better if available.'],
      ['Can I use the elevator during a tornado warning?', 'Avoid elevators if possible because power can fail. Use interior stairs when you can move safely.'],
      ['Are hotel lobbies safe?', 'Often no. Many lobbies have large windows and open spans. Look for interior lower-level spaces instead.']
    ],
    related: ['/tornado-safety-hotel/', '/tornado-safety-by-location/', '/tornado-safety-high-rise-building/', '/tornado-shelter-without-basement/']
  },
  {
    slug: 'big-box-store-tornado-safety',
    category: 'Public Places',
    title: 'Big-Box Store Tornado Safety: Where to Go in a Large Building',
    description: 'How shoppers and staff can think about tornado shelter choices in big-box stores, malls, warehouses, gyms, and other wide-span buildings.',
    quick: 'In a big-box store, avoid the open sales floor, glass front, and high shelves if a tornado warning is issued. Move to designated shelter areas, interior stock rooms, restrooms, offices, or reinforced corridors if staff direct you there.',
    sections: [
      ['Why wide-span buildings are tricky', ['Large stores and warehouses often have big roof spans, high ceilings, tall shelving, and wide glass entrances. Those features can make shelter choices less obvious.', 'The safest option is usually a designated shelter area chosen by the building operator. If staff give directions, follow them quickly.']],
      ['Places to avoid', ['Avoid the front of the store, garden centers, entry vestibules, windowed restaurants, checkout lanes near glass, and aisles with unstable tall displays.', 'Do not run to your car during a warning. Vehicles are more exposed than most sturdy buildings.']],
      ['Better options inside', ['Interior restrooms, break rooms, offices, stock rooms, service corridors, and lower-level spaces can be better than the sales floor if they are away from exterior walls and glass.', 'Crouch low and protect your head. In a store, debris can include ceiling material, signs, merchandise, glass, and metal fixtures.']],
      ['Staff planning', ['Managers should preselect shelter areas, train staff, and practice moving customers. A calm, direct announcement can prevent people from drifting toward windows to look outside.', 'Shelter signs and staff radios help when storms create noise and confusion.']]
    ],
    faqs: [
      ['Is a big-box store safe in a tornado?', 'It can be safer than being outside or in a car, but the open sales floor is not ideal. Move to designated interior shelter areas.'],
      ['Should I leave the store and drive home?', 'No, not during a warning. Shelter in the sturdy building unless directed by emergency officials before storms arrive.'],
      ['Are store bathrooms good tornado shelters?', 'Interior restrooms away from exterior walls can be among the better available options.']
    ],
    related: ['/tornado-safety-by-location/', '/tornado-safety-at-work/', '/tornado-car-safety-myths/', '/best-room-during-tornado/']
  },
  {
    slug: 'outdoor-event-tornado-plan',
    category: 'Events',
    title: 'Outdoor Event Tornado Plan for Sports, Fairs, and Festivals',
    description: 'How organizers and attendees can plan for tornado warnings at outdoor events, including shelters, cancellation triggers, announcements, and crowd movement.',
    quick: 'Outdoor events need a shelter plan before gates open. If a tornado warning threatens the venue, people need sturdy buildings, clear announcements, and enough time to move before the storm arrives.',
    sections: [
      ['Shelter capacity comes first', ['A tornado plan is not complete unless it names real shelter locations and estimates how many people can fit. Tents, stages, metal bleachers, and temporary structures are not tornado shelters.', 'Schools, arenas, concrete buildings, interior corridors, and basements may be options depending on the venue. Parking lots and open fields are not.']],
      ['Set weather triggers', ['Organizers should define actions for watches, severe thunderstorm warnings, tornado warnings, lightning, and observed rotation nearby. Waiting until the crowd sees the storm is too late.', 'A watch can trigger staffing and announcements. A warning nearby can trigger shelter movement or event suspension.']],
      ['Communicate clearly', ['Crowds move better when instructions are simple and repeated. Tell people where to go, which exits to use, and what areas to avoid.', 'Use PA systems, screens, social posts, staff, security, and text alerts where possible. Do not rely on one announcement method.']],
      ['Attendee decisions', ['If you attend an outdoor event on a high-risk day, notice shelter options when you arrive. Know where you parked, where sturdy buildings are, and how you would leave before crowds surge.', 'If officials suspend the event, move early and calmly. Do not shelter under temporary tents or near stages.']]
    ],
    faqs: [
      ['Are tents safe during a tornado warning?', 'No. Tents and temporary structures are not tornado shelters. Move to a sturdy building.'],
      ['Should an outdoor event cancel for a tornado watch?', 'Not always, but a watch should trigger monitoring, readiness, and clear shelter planning. Higher risk setups may justify postponement.'],
      ['Is a stadium safe in a tornado?', 'Only designated interior shelter areas should be used. Open seating, concourses near glass, and exposed ramps can be dangerous.']
    ],
    related: ['/tornado-outdoors/', '/tornado-safety-camping/', '/tornado-safety-by-location/', '/weather-radio-buying-guide/']
  },
  {
    slug: 'tornado-trauma-aftercare',
    category: 'Recovery',
    title: 'Tornado Trauma Aftercare: Stress, Sleep, Kids, and Recovery',
    description: 'A practical guide to emotional recovery after tornadoes: common stress reactions, helping kids, sleep problems, media exposure, and when to ask for help.',
    quick: 'After a tornado, stress reactions are normal. Sleep trouble, jumpiness, sadness, anger, replaying the event, and weather anxiety can happen even to people who were not physically injured.',
    sections: [
      ['Normal reactions after abnormal events', ['Tornadoes are sudden, loud, and chaotic. People may feel shaky for days or weeks afterward, especially if they sheltered through damage, heard debris hitting the building, lost possessions, or worried about loved ones.', 'A reaction can be real even if someone else had worse damage. Recovery is not a contest.']],
      ['Helping kids process it', ['Children may ask the same questions repeatedly, act younger than usual, resist sleeping alone, or become anxious when skies darken. Calm, repeated explanations help.', 'Keep routines where possible. Let kids help with small recovery tasks, but do not overload them with adult worries, graphic videos, or constant damage coverage.']],
      ['Weather anxiety and media loops', ['After a tornado, every watch or thunderstorm can feel threatening. Use trusted forecasts, but avoid endless radar checking if it increases panic without changing your plan.', 'Limit repeated disaster videos. They can keep the nervous system activated long after the immediate danger has passed.']],
      ['When to seek help', ['Ask for support if stress reactions are getting worse, disrupting sleep or work, causing panic, or making someone feel unsafe long after the event.', 'Primary care doctors, school counselors, therapists, faith leaders, community groups, and disaster recovery organizations can all be starting points.']]
    ],
    faqs: [
      ['Is it normal to be scared of storms after a tornado?', 'Yes. Weather anxiety is common after a frightening storm experience, especially when warnings or sirens return.'],
      ['How can parents help children after a tornado?', 'Use simple truthful explanations, restore routines, limit graphic media, and let children ask questions repeatedly without shame.'],
      ['When should someone get professional help?', 'If fear, sleep trouble, panic, sadness, or intrusive memories persist or interfere with daily life, professional support can help.']
    ],
    related: ['/after-a-tornado/', '/tornado-recovery-guide/', '/tornado-ptsd-mental-health/', '/tornado-family-communication-plan/']
  },
  {
    slug: 'pet-tornado-shelter-plan',
    category: 'Pets',
    title: 'Pet Tornado Shelter Plan: Dogs, Cats, Carriers, and After-Storm Safety',
    description: 'How to include pets in your tornado plan with carriers, leashes, shelter-room supplies, microchips, anxiety, and post-storm hazards.',
    quick: 'Pets need a tornado plan before the warning. Keep leashes, carriers, food, medication, and ID ready so animals can move to shelter quickly without delaying people.',
    sections: [
      ['Make pets easy to move', ['Cats and small dogs may hide when storms get loud. Keep carriers accessible, not buried in a garage or attic. Practice calmly placing pets inside before severe weather season.', 'Large dogs should have a leash near the shelter area. If a warning arrives, speed and control matter.']],
      ['Shelter room supplies', ['A small pet kit can include food, water, collapsible bowls, waste bags, medication, vaccination records, a towel, and a familiar comfort item.', 'Do not let the kit become so large that it slows you down. The first priority is getting people and pets into shelter.']],
      ['Identification matters', ['After tornado damage, fences, doors, and windows may be gone. Pets can escape into unfamiliar, debris-filled areas.', 'Use collars with tags and keep microchip information current. Recent photos help if you need to post lost pet notices.']],
      ['After-storm hazards', ['Broken glass, nails, insulation, sharp metal, contaminated water, and downed lines can injure pets after the storm. Keep animals leashed or contained until the area is checked.', 'Stress can change pet behavior. Even normally calm animals may bolt, hide, or snap when frightened.']]
    ],
    faqs: [
      ['Should pets go into the tornado shelter room?', 'Yes, if you can bring them without delaying people. Keep carriers and leashes ready so it is fast.'],
      ['What if my cat hides during storms?', 'Bring the cat indoors early during a watch and close off hiding places that are far from the shelter room.'],
      ['Should pets wear collars during storms?', 'Yes, collars with ID tags and current microchip details help if a pet escapes after damage.']
    ],
    related: ['/tornado-safety-for-pets/', '/tornado-family-communication-plan/', '/tornado-watch-prep-list/', '/after-a-tornado/']
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

function toCardTitle(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function relatedList(links) {
  return links.map((href) => {
    const label = toCardTitle(href.replace(/^\/|\/$/g, ''));
    return `      <li><a href="${href}">${escapeHtml(label)}</a></li>`;
  }).join('\n');
}

function schema(page) {
  const url = `${site}/${page.slug}/`;
  return [
    `<script type="application/ld+json">`,
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
    `</script>`,
    `<script type="application/ld+json" data-seo="page">`,
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.title,
          description: page.description,
          isPartOf: { '@id': `${site}/#website` },
          publisher: { '@id': `${site}/#organization` },
          inLanguage: 'en'
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
            { '@type': 'ListItem', position: 2, name: page.title, item: url }
          ]
        }
      ]
    }),
    `</script>`,
    `<script type="application/ld+json">`,
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    }),
    `</script>`
  ].join('\n');
}

function renderPage(page) {
  const body = page.sections.map(([heading, paragraphs]) => `
    <h2>${escapeHtml(heading)}</h2>
${paragraphs.map((paragraph) => `    <p>${escapeHtml(paragraph)}</p>`).join('\n')}
  `).join('\n');
  const faq = page.faqs.map(([question, answer]) => `
    <h3>${escapeHtml(question)}</h3>
    <p>${escapeHtml(answer)}</p>
  `).join('\n');
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
.nav-brand { font-family:var(--serif); font-weight:700; font-size:20px; color:var(--text); display:flex; align-items:center; gap:8px; text-decoration:none; }
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
.faq { margin-top:44px; padding-top:28px; border-top:1px solid var(--border); }
.related { margin-top:48px; padding-top:28px; border-top:1px solid var(--border); }
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
    <a href="/" class="nav-brand"><span>Tornado Hub</span></a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="/search/">Search</a>
      <a href="/quiz/">Quizzes</a>
      <a href="/tornadle/">Tornadle</a>
      <a href="/tornado-namer/">Namer</a>
      <a href="/weather-trivia/">Weather Trivia</a>
      <a href="/supercell-simulator/">Supercell Sim</a>
      <a href="/tornadoes/">Tornado Index</a>
      <a href="/learn/">Learn</a>
      <a href="/safety/">Safety</a>
      <a href="/simulator/" class="cta">Launch Simulator</a>
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
${body}
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
${faq}
  </section>
  <section class="related">
    <h2>Related Guides</h2>
    <ul>
${relatedList(page.related)}
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

function writePages() {
  for (const page of pages) {
    const dir = path.join(root, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderPage(page));
  }
}

function updateArticlesIndex() {
  const file = path.join(root, 'articles', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const section = `<section class="cat-section" data-generated="preparedness-playbooks">
  <h2 class="cat-heading">Preparedness playbooks <span class="cat-count">${pages.length} articles</span></h2>
  <p class="cat-sub">Scenario-based tornado safety guides for watches, warnings, homes, public places, travel, schools, events, pets, and recovery.</p>
  <div class="link-grid">
${pages.map((page) => `    <a class="link-card" href="/${page.slug}/">${escapeHtml(page.title)} <small>${escapeHtml(page.category)}</small></a>`).join('\n')}
  </div>
</section>

`;
  html = html.replace(/<section class="cat-section" data-generated="preparedness-playbooks">[\s\S]*?<\/section>\s*/m, '');
  html = html.replace(/<section class="cat-section">\s*<h2 class="cat-heading">Historical events/, section + '<section class="cat-section">\n  <h2 class="cat-heading">Historical events');
  fs.writeFileSync(file, html);
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

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'work') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function rebuildContentIndexAndSitemap() {
  const files = [path.join(root, 'index.html'), ...walk(root).filter((file) => file !== path.join(root, 'index.html'))];
  const items = files.map((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const relDir = path.relative(root, path.dirname(file)).replace(/\\/g, '/');
    const pathName = relDir === '' ? '/' : `/${relDir}/`;
    const title = textBetween(html, /<title>([\s\S]*?)<\/title>/i) || textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || 'Tornado Hub';
    const description = textBetween(html, /<meta name=["']description["'] content=["']([\s\S]*?)["']\s*\/?>/i);
    return {
      title,
      path: pathName,
      description,
      category: categoryFor(file, html),
      keywords: `${title} ${description} ${relDir.replace(/-/g, ' ')}`
    };
  }).sort((a, b) => a.path.localeCompare(b.path));

  fs.writeFileSync(path.join(root, 'assets', 'content-index.js'), `window.TORNADO_CONTENT_INDEX = ${JSON.stringify(items, null, 2)};\n`);

  const urls = items.map((item) => `  <url>\n    <loc>${site}${item.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.path === '/' ? 'daily' : 'monthly'}</changefreq>\n    <priority>${item.path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  return items.length;
}

writePages();
updateArticlesIndex();
const total = rebuildContentIndexAndSitemap();
console.log(`Added ${pages.length} articles and rebuilt ${total} indexed URLs.`);

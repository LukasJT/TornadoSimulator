
// ─── CONSTANTS & MODELS ─────────────────────────────────────────────────────

const EF_SCALE = [
  { rating: "EF0", min: 65, max: 85, color: "#4fc3f7", label: "Light" },
  { rating: "EF1", min: 86, max: 110, color: "#81c784", label: "Moderate" },
  { rating: "EF2", min: 111, max: 135, color: "#fff176", label: "Significant" },
  { rating: "EF3", min: 136, max: 165, color: "#ffb74d", label: "Severe" },
  { rating: "EF4", min: 166, max: 200, color: "#ff8a65", label: "Devastating" },
  { rating: "EF5", min: 201, max: 320, color: "#ef5350", label: "Incredible" },
];

const getEFRating = (wind) => EF_SCALE.find((e) => wind >= e.min && wind <= e.max) || (wind > 320 ? EF_SCALE[5] : EF_SCALE[0]);

// Fragility curves: probability of destruction at given wind speed (mph)
// Based on TTU wind engineering research & HAZUS-MH methodology
const STRUCTURE_FRAGILITY = {
  mobile_home:     { v50: 0.15, v100: 0.70, v150: 0.98, v200: 1.00, v250: 1.00, value: 45000 },
  wood_frame:      { v50: 0.01, v100: 0.10, v150: 0.55, v200: 0.90, v250: 0.99, value: 180000 },
  brick_masonry:   { v50: 0.005, v100: 0.05, v150: 0.35, v200: 0.75, v250: 0.95, value: 250000 },
  reinforced_conc: { v50: 0.001, v100: 0.01, v150: 0.08, v200: 0.30, v250: 0.65, value: 500000 },
};

const interpolateFragility = (type, windSpeed) => {
  const f = STRUCTURE_FRAGILITY[type];
  const points = [
    [50, f.v50], [100, f.v100], [150, f.v150], [200, f.v200], [250, f.v250]
  ];
  if (windSpeed <= 50) return f.v50 * (windSpeed / 50);
  if (windSpeed >= 250) return f.v250;
  for (let i = 0; i < points.length - 1; i++) {
    if (windSpeed >= points[i][0] && windSpeed <= points[i + 1][0]) {
      const t = (windSpeed - points[i][0]) / (points[i + 1][0] - points[i][0]);
      return points[i][1] + t * (points[i + 1][1] - points[i][1]);
    }
  }
  return f.v250;
};

// Fatality model based on Simmons & Sutter (2005), Ashley (2007)
// Base fatality rate per person exposed, by shelter type
const FATALITY_RATES = {
  no_shelter:      { ef0: 0.0001, ef1: 0.001, ef2: 0.005, ef3: 0.02, ef4: 0.08, ef5: 0.25 },
  interior_room:   { ef0: 0.00001, ef1: 0.0001, ef2: 0.001, ef3: 0.005, ef4: 0.025, ef5: 0.10 },
  basement:        { ef0: 0.000001, ef1: 0.00001, ef2: 0.0001, ef3: 0.001, ef4: 0.008, ef5: 0.04 },
  storm_shelter:   { ef0: 0, ef1: 0, ef2: 0.00001, ef3: 0.0001, ef4: 0.001, ef5: 0.005 },
};

const CROP_LOSS_PER_ACRE = {
  corn:     { value: 950, susceptibility: 0.85 },
  wheat:    { value: 520, susceptibility: 0.70 },
  soybeans: { value: 600, susceptibility: 0.80 },
  cotton:   { value: 780, susceptibility: 0.75 },
  none:     { value: 0, susceptibility: 0 },
};

const GROWTH_STAGE_MULT = { planting: 0.3, mid_season: 0.7, near_harvest: 1.0 };

const TERRAIN_WIND_MODIFIER = {
  flat_plains: 1.0,
  rolling_hills: 0.92,
  urban: 0.85,
  forested: 0.88,
};

const INFRA_COSTS = {
  power_lines: 35000,   // per mile destroyed
  cell_towers: 250000,  // each
  bridges: 2000000,     // each
  water_towers: 800000, // each
  gas_lines: 50000,     // per mile
};

// ─── US/CANADA SIMPLIFIED MAP DATA ──────────────────────────────────────────
// Major cities with lat/lng for reference on the map
const CITIES = {
  us: [
    { name: "New York", lat: 40.71, lng: -74.01 },
    { name: "Chicago", lat: 41.88, lng: -87.63 },
    { name: "Dallas", lat: 32.78, lng: -96.80 },
    { name: "Oklahoma City", lat: 35.47, lng: -97.52 },
    { name: "Joplin", lat: 37.08, lng: -94.51 },
    { name: "Moore", lat: 35.34, lng: -97.49 },
    { name: "Tuscaloosa", lat: 33.21, lng: -87.57 },
    { name: "St. Louis", lat: 38.63, lng: -90.20 },
    { name: "Kansas City", lat: 39.10, lng: -94.58 },
    { name: "Memphis", lat: 35.15, lng: -90.05 },
    { name: "Minneapolis", lat: 44.98, lng: -93.27 },
    { name: "Denver", lat: 39.74, lng: -104.99 },
    { name: "Atlanta", lat: 33.75, lng: -84.39 },
    { name: "Houston", lat: 29.76, lng: -95.37 },
    { name: "Miami", lat: 25.76, lng: -80.19 },
    { name: "Los Angeles", lat: 34.05, lng: -118.24 },
    { name: "Seattle", lat: 47.61, lng: -122.33 },
  ],
  canada: [
    { name: "Toronto", lat: 43.65, lng: -79.38 },
    { name: "Montreal", lat: 45.50, lng: -73.57 },
    { name: "Vancouver", lat: 49.28, lng: -123.12 },
    { name: "Calgary", lat: 51.05, lng: -114.07 },
    { name: "Edmonton", lat: 53.55, lng: -113.49 },
    { name: "Ottawa", lat: 45.42, lng: -75.70 },
    { name: "Winnipeg", lat: 49.90, lng: -97.14 },
    { name: "Regina", lat: 50.45, lng: -104.62 },
    { name: "Saskatoon", lat: 52.13, lng: -106.67 },
  ],
};

// Tornado Alley approximate polygon (central US)
const TORNADO_ALLEY = [
  { lat: 48, lng: -104 }, { lat: 48, lng: -94 }, { lat: 42, lng: -88 },
  { lat: 35, lng: -88 }, { lat: 28, lng: -95 }, { lat: 28, lng: -100 },
  { lat: 35, lng: -104 }, { lat: 42, lng: -104 },
];

// Canadian tornado-prone regions (southern prairies + Ontario)
const CANADA_TORNADO_ZONE = [
  { lat: 49, lng: -110 }, { lat: 55, lng: -110 }, { lat: 55, lng: -95 },
  { lat: 49, lng: -95 }, { lat: 49, lng: -85 }, { lat: 45, lng: -75 },
  { lat: 42, lng: -80 }, { lat: 43, lng: -85 },
];

// ─── CANADIAN CENSUS DIVISION DATA (Statistics Canada, 2021 Census) ─────────
// Source: Statistics Canada, 2021 Census of Population, Table 98-10-0002-02
// "Population and dwelling counts: Canada, provinces and territories, and census divisions"
// Centroids from Statistics Canada Geographic Attribute File (GAF), 2021
// Fields: n=name, lat/lng=centroid, pop=population, a=area(sq mi), d=density(per sq mi), h=housing/sq mi, dw=dwellings
const CANADA_CENSUS_DIVISIONS = [{"n":"Division No. 1, NL","lat":47.55,"lng":-52.75,"pop":205955,"a":5715.1,"d":36.0,"h":16.5,"dw":94480},{"n":"Division No. 2, NL","lat":47.14,"lng":-55.15,"pop":19980,"a":2988.4,"d":6.7,"h":3.4,"dw":10175},{"n":"Division No. 3, NL","lat":47.6,"lng":-56.05,"pop":21285,"a":3158.3,"d":6.7,"h":3.5,"dw":10900},{"n":"Division No. 4, NL","lat":48.42,"lng":-56.0,"pop":12835,"a":2050.2,"d":6.3,"h":3.5,"dw":7230},{"n":"Division No. 5, NL","lat":48.7,"lng":-56.65,"pop":19270,"a":3803.1,"d":5.1,"h":2.7,"dw":10085},{"n":"Division No. 6, NL","lat":48.95,"lng":-57.9,"pop":27985,"a":5938.2,"d":4.7,"h":2.4,"dw":14235},{"n":"Division No. 7, NL","lat":48.6,"lng":-58.8,"pop":16325,"a":3494.2,"d":4.7,"h":2.4,"dw":8370},{"n":"Division No. 8, NL","lat":49.2,"lng":-55.6,"pop":16720,"a":5108.1,"d":3.3,"h":1.6,"dw":8415},{"n":"Division No. 9, NL","lat":50.0,"lng":-56.8,"pop":26645,"a":6185.4,"d":4.3,"h":2.1,"dw":13130},{"n":"Division No. 10, NL","lat":53.5,"lng":-60.0,"pop":26660,"a":99582.7,"d":0.3,"h":0.1,"dw":12205},{"n":"Division No. 11, NL","lat":51.5,"lng":-56.5,"pop":17270,"a":11436.3,"d":1.5,"h":0.7,"dw":7800},{"n":"Kings, PE","lat":46.37,"lng":-62.48,"pop":19340,"a":664.5,"d":29.1,"h":14.2,"dw":9430},{"n":"Queens, PE","lat":46.24,"lng":-63.13,"pop":92420,"a":722.0,"d":128.0,"h":59.6,"dw":43060},{"n":"Prince, PE","lat":46.65,"lng":-63.85,"pop":42470,"a":785.3,"d":54.1,"h":25.7,"dw":20200},{"n":"Annapolis, NS","lat":44.8,"lng":-65.2,"pop":20970,"a":1215.1,"d":17.3,"h":8.8,"dw":10750},{"n":"Antigonish, NS","lat":45.62,"lng":-61.98,"pop":19750,"a":562.2,"d":35.1,"h":16.3,"dw":9180},{"n":"Cape Breton, NS","lat":46.15,"lng":-60.15,"pop":94285,"a":939.8,"d":100.3,"h":51.3,"dw":48180},{"n":"Colchester, NS","lat":45.37,"lng":-63.25,"pop":52820,"a":1401.6,"d":37.7,"h":17.6,"dw":24650},{"n":"Cumberland, NS","lat":45.6,"lng":-64.3,"pop":28920,"a":1642.9,"d":17.6,"h":8.9,"dw":14700},{"n":"Digby, NS","lat":44.4,"lng":-65.85,"pop":17240,"a":973.0,"d":17.7,"h":9.6,"dw":9380},{"n":"Guysborough, NS","lat":45.25,"lng":-61.8,"pop":7360,"a":1606.2,"d":4.6,"h":2.7,"dw":4340},{"n":"Halifax, NS","lat":44.65,"lng":-63.57,"pop":439819,"a":2119.7,"d":207.5,"h":93.0,"dw":197200},{"n":"Hants, NS","lat":44.95,"lng":-63.85,"pop":43735,"a":1100.0,"d":39.8,"h":17.1,"dw":18820},{"n":"Inverness, NS","lat":46.2,"lng":-61.2,"pop":16305,"a":1459.9,"d":11.2,"h":6.3,"dw":9250},{"n":"Kings, NS","lat":45.05,"lng":-64.6,"pop":61510,"a":819.7,"d":75.0,"h":33.6,"dw":27520},{"n":"Lunenburg, NS","lat":44.4,"lng":-64.4,"pop":47985,"a":1199.2,"d":40.0,"h":21.0,"dw":25160},{"n":"Pictou, NS","lat":45.55,"lng":-62.55,"pop":43070,"a":1097.3,"d":39.3,"h":19.2,"dw":21050},{"n":"Queens, NS","lat":44.05,"lng":-64.75,"pop":10390,"a":928.2,"d":11.2,"h":6.4,"dw":5960},{"n":"Richmond, NS","lat":45.6,"lng":-60.95,"pop":8860,"a":479.2,"d":18.5,"h":11.0,"dw":5250},{"n":"Shelburne, NS","lat":43.75,"lng":-65.3,"pop":13660,"a":936.3,"d":14.6,"h":8.1,"dw":7540},{"n":"Victoria, NS","lat":46.35,"lng":-60.7,"pop":6515,"a":1107.0,"d":5.9,"h":3.6,"dw":3940},{"n":"Yarmouth, NS","lat":43.8,"lng":-66.05,"pop":24220,"a":820.5,"d":29.5,"h":15.1,"dw":12380},{"n":"Albert, NB","lat":45.85,"lng":-64.85,"pop":28460,"a":664.5,"d":42.8,"h":20.1,"dw":13380},{"n":"Carleton, NB","lat":46.4,"lng":-67.55,"pop":27735,"a":1291.1,"d":21.5,"h":10.2,"dw":13200},{"n":"Charlotte, NB","lat":45.1,"lng":-66.95,"pop":27830,"a":1278.8,"d":21.8,"h":11.6,"dw":14780},{"n":"Gloucester, NB","lat":47.6,"lng":-65.35,"pop":75450,"a":1770.7,"d":42.6,"h":19.9,"dw":35290},{"n":"Kent, NB","lat":46.65,"lng":-65.05,"pop":30140,"a":1554.1,"d":19.4,"h":10.1,"dw":15620},{"n":"Kings, NB","lat":45.7,"lng":-65.85,"pop":71865,"a":1332.8,"d":53.9,"h":24.2,"dw":32200},{"n":"Madawaska, NB","lat":47.4,"lng":-68.4,"pop":32580,"a":1315.4,"d":24.8,"h":12.3,"dw":16150},{"n":"Northumberland, NB","lat":47.0,"lng":-65.6,"pop":49535,"a":3845.6,"d":12.9,"h":6.6,"dw":25200},{"n":"Queens, NB","lat":45.9,"lng":-66.15,"pop":11580,"a":1115.8,"d":10.4,"h":5.0,"dw":5540},{"n":"Restigouche, NB","lat":47.9,"lng":-66.5,"pop":30545,"a":2966.0,"d":10.3,"h":5.1,"dw":15200},{"n":"Saint John, NB","lat":45.3,"lng":-66.05,"pop":72345,"a":561.4,"d":128.9,"h":63.2,"dw":35480},{"n":"Sunbury, NB","lat":45.85,"lng":-66.4,"pop":27735,"a":970.3,"d":28.6,"h":12.5,"dw":12100},{"n":"Victoria, NB","lat":46.95,"lng":-67.55,"pop":18625,"a":1403.5,"d":13.3,"h":6.7,"dw":9420},{"n":"Westmorland, NB","lat":46.15,"lng":-64.75,"pop":157580,"a":1542.9,"d":102.1,"h":48.1,"dw":74260},{"n":"York, NB","lat":46.05,"lng":-67.1,"pop":100755,"a":1706.6,"d":59.0,"h":27.0,"dw":46080},{"n":"Communaut\u00e9-Urbaine-de-Montr\u00e9al, QC","lat":45.5,"lng":-73.57,"pop":2028045,"a":192.7,"d":10526.3,"h":4830.1,"dw":930590},{"n":"Laval, QC","lat":45.57,"lng":-73.75,"pop":437413,"a":95.4,"d":4586.6,"h":1842.7,"dw":175730},{"n":"Longueuil, QC","lat":45.52,"lng":-73.4,"pop":433085,"a":193.8,"d":2234.4,"h":974.3,"dw":188850},{"n":"Th\u00e9r\u00e8se-De Blainville, QC","lat":45.65,"lng":-73.85,"pop":172705,"a":81.1,"d":2130.0,"h":845.1,"dw":68520},{"n":"Les Moulins, QC","lat":45.7,"lng":-73.55,"pop":176485,"a":103.1,"d":1712.0,"h":649.6,"dw":66970},{"n":"L'Assomption, QC","lat":45.85,"lng":-73.4,"pop":138180,"a":159.8,"d":864.5,"h":352.0,"dw":56270},{"n":"Joliette, QC","lat":46.02,"lng":-73.43,"pop":67985,"a":486.9,"d":139.6,"h":63.4,"dw":30870},{"n":"Matawinie, QC","lat":46.6,"lng":-73.8,"pop":55270,"a":4027.4,"d":13.7,"h":9.0,"dw":36130},{"n":"D'Autray, QC","lat":46.25,"lng":-73.1,"pop":44560,"a":514.7,"d":86.6,"h":39.7,"dw":20420},{"n":"Les Maskoutains, QC","lat":45.6,"lng":-72.95,"pop":91315,"a":505.8,"d":180.5,"h":77.9,"dw":39400},{"n":"Acton, QC","lat":45.65,"lng":-72.55,"pop":16540,"a":215.8,"d":76.6,"h":35.6,"dw":7680},{"n":"Drummond, QC","lat":45.88,"lng":-72.48,"pop":110270,"a":578.4,"d":190.7,"h":84.8,"dw":49040},{"n":"Arthabaska, QC","lat":46.1,"lng":-72.0,"pop":73750,"a":729.7,"d":101.1,"h":45.4,"dw":33150},{"n":"Sherbrooke, QC","lat":45.4,"lng":-71.9,"pop":227398,"a":570.3,"d":398.8,"h":188.9,"dw":107710},{"n":"Coaticook, QC","lat":45.15,"lng":-71.8,"pop":19555,"a":488.4,"d":40.0,"h":18.2,"dw":8870},{"n":"Memphr\u00e9magog, QC","lat":45.25,"lng":-72.15,"pop":51810,"a":636.7,"d":81.4,"h":43.1,"dw":27450},{"n":"Le Granit, QC","lat":45.55,"lng":-71.35,"pop":22870,"a":1089.2,"d":21.0,"h":10.5,"dw":11440},{"n":"Le Haut-Saint-Fran\u00e7ois, QC","lat":45.4,"lng":-71.5,"pop":22790,"a":890.0,"d":25.6,"h":12.4,"dw":11080},{"n":"Le Val-Saint-Fran\u00e7ois, QC","lat":45.5,"lng":-71.9,"pop":32470,"a":517.0,"d":62.8,"h":27.8,"dw":14370},{"n":"Brome-Missisquoi, QC","lat":45.15,"lng":-72.55,"pop":62775,"a":644.4,"d":97.4,"h":48.7,"dw":31380},{"n":"La Haute-Yamaska, QC","lat":45.38,"lng":-72.75,"pop":97600,"a":241.7,"d":403.8,"h":180.8,"dw":43700},{"n":"Rouville, QC","lat":45.4,"lng":-73.0,"pop":39860,"a":178.8,"d":223.0,"h":94.0,"dw":16810},{"n":"Le Haut-Richelieu, QC","lat":45.2,"lng":-73.25,"pop":123855,"a":354.1,"d":349.8,"h":149.0,"dw":52760},{"n":"Les Jardins-de-Napierville, QC","lat":45.15,"lng":-73.55,"pop":29580,"a":225.9,"d":131.0,"h":53.9,"dw":12170},{"n":"Le Haut-Saint-Laurent, QC","lat":45.1,"lng":-73.9,"pop":24465,"a":447.1,"d":54.7,"h":24.2,"dw":10840},{"n":"Beauharnois-Salaberry, QC","lat":45.3,"lng":-73.9,"pop":68195,"a":182.6,"d":373.4,"h":164.5,"dw":30040},{"n":"Vaudreuil-Soulanges, QC","lat":45.4,"lng":-74.05,"pop":169530,"a":330.1,"d":513.5,"h":194.4,"dw":64160},{"n":"Deux-Montagnes, QC","lat":45.55,"lng":-74.0,"pop":108115,"a":102.7,"d":1052.7,"h":410.2,"dw":42130},{"n":"Mirabel, QC","lat":45.65,"lng":-74.05,"pop":64610,"a":187.3,"d":345.0,"h":129.0,"dw":24150},{"n":"La Rivi\u00e8re-du-Nord, QC","lat":45.85,"lng":-74.0,"pop":120790,"a":169.9,"d":711.0,"h":296.3,"dw":50340},{"n":"Argenteuil, QC","lat":45.6,"lng":-74.4,"pop":33395,"a":488.8,"d":68.3,"h":34.5,"dw":16850},{"n":"Les Pays-d'en-Haut, QC","lat":46.05,"lng":-74.2,"pop":47780,"a":303.9,"d":157.2,"h":94.8,"dw":28810},{"n":"Les Laurentides, QC","lat":46.2,"lng":-74.6,"pop":49695,"a":982.2,"d":50.6,"h":30.2,"dw":29620},{"n":"Antoine-Labelle, QC","lat":46.65,"lng":-75.15,"pop":36235,"a":6030.1,"d":6.0,"h":3.7,"dw":22050},{"n":"Papineau, QC","lat":45.55,"lng":-75.1,"pop":24615,"a":1132.1,"d":21.7,"h":11.1,"dw":12590},{"n":"Gatineau, QC","lat":45.5,"lng":-75.8,"pop":346995,"a":900.8,"d":385.2,"h":172.7,"dw":155570},{"n":"Les Collines-de-l'Outaouais, QC","lat":45.55,"lng":-75.7,"pop":55370,"a":819.3,"d":67.6,"h":26.1,"dw":21400},{"n":"Pontiac, QC","lat":45.9,"lng":-76.7,"pop":14710,"a":4918.2,"d":3.0,"h":1.8,"dw":8620},{"n":"La Vall\u00e9e-de-la-Gatineau, QC","lat":46.6,"lng":-76.0,"pop":22975,"a":5453.3,"d":4.2,"h":2.4,"dw":12980},{"n":"Qu\u00e9bec, QC","lat":46.85,"lng":-71.25,"pop":601811,"a":1293.1,"d":465.4,"h":224.7,"dw":290535},{"n":"L\u00e9vis, QC","lat":46.8,"lng":-71.15,"pop":149735,"a":192.3,"d":778.7,"h":334.3,"dw":64280},{"n":"La Jacques-Cartier, QC","lat":47.05,"lng":-71.5,"pop":42140,"a":583.8,"d":72.2,"h":29.1,"dw":16970},{"n":"L'\u00cele-d'Orl\u00e9ans, QC","lat":46.95,"lng":-71.0,"pop":7580,"a":74.1,"d":102.3,"h":50.2,"dw":3720},{"n":"La C\u00f4te-de-Beaupr\u00e9, QC","lat":47.1,"lng":-70.9,"pop":29720,"a":529.3,"d":56.1,"h":26.0,"dw":13760},{"n":"Charlevoix, QC","lat":47.4,"lng":-70.6,"pop":12745,"a":970.3,"d":13.1,"h":6.8,"dw":6580},{"n":"Charlevoix-Est, QC","lat":47.65,"lng":-70.3,"pop":15985,"a":1116.2,"d":14.3,"h":7.6,"dw":8440},{"n":"Portneuf, QC","lat":46.9,"lng":-72.0,"pop":55110,"a":1500.4,"d":36.7,"h":16.3,"dw":24420},{"n":"Montmagny, QC","lat":46.9,"lng":-70.45,"pop":23020,"a":805.8,"d":28.6,"h":13.9,"dw":11230},{"n":"L'Islet, QC","lat":47.0,"lng":-70.0,"pop":17080,"a":876.1,"d":19.5,"h":10.3,"dw":9060},{"n":"Bellechasse, QC","lat":46.7,"lng":-70.8,"pop":38300,"a":675.7,"d":56.7,"h":24.2,"dw":16330},{"n":"Lotbini\u00e8re, QC","lat":46.55,"lng":-71.75,"pop":32815,"a":636.3,"d":51.6,"h":22.2,"dw":14120},{"n":"L'\u00c9rable, QC","lat":46.35,"lng":-71.95,"pop":23610,"a":683.0,"d":34.6,"h":16.2,"dw":11070},{"n":"Les Appalaches, QC","lat":46.15,"lng":-71.3,"pop":43065,"a":780.7,"d":55.2,"h":27.3,"dw":21310},{"n":"Beauce-Sartigan, QC","lat":46.05,"lng":-70.75,"pop":53985,"a":753.3,"d":71.7,"h":31.0,"dw":23350},{"n":"La Nouvelle-Beauce, QC","lat":46.45,"lng":-71.15,"pop":38555,"a":357.5,"d":107.8,"h":43.9,"dw":15690},{"n":"Robert-Cliche, QC","lat":46.2,"lng":-70.9,"pop":20230,"a":343.6,"d":58.9,"h":26.4,"dw":9070},{"n":"Les Etchemins, QC","lat":46.4,"lng":-70.55,"pop":17145,"a":705.0,"d":24.3,"h":11.7,"dw":8280},{"n":"Montcalm, QC","lat":46.1,"lng":-73.75,"pop":57970,"a":598.8,"d":96.8,"h":39.3,"dw":23530},{"n":"Les Chenaux, QC","lat":46.55,"lng":-72.4,"pop":18825,"a":248.6,"d":75.7,"h":34.4,"dw":8560},{"n":"M\u00e9kinac, QC","lat":46.85,"lng":-72.7,"pop":13310,"a":2029.4,"d":6.6,"h":3.6,"dw":7340},{"n":"Trois-Rivi\u00e8res, QC","lat":46.35,"lng":-72.55,"pop":163335,"a":1228.6,"d":132.9,"h":64.6,"dw":79360},{"n":"B\u00e9cancour, QC","lat":46.35,"lng":-72.3,"pop":21730,"a":455.2,"d":47.7,"h":22.4,"dw":10210},{"n":"Nicolet-Yamaska, QC","lat":46.1,"lng":-72.7,"pop":24395,"a":406.6,"d":60.0,"h":28.4,"dw":11560},{"n":"Francheville, QC","lat":46.5,"lng":-72.7,"pop":163335,"a":442.5,"d":369.1,"h":179.4,"dw":79360},{"n":"Le Centre-de-la-Mauricie, QC","lat":46.55,"lng":-72.7,"pop":55180,"a":830.1,"d":66.5,"h":31.8,"dw":26370},{"n":"Le Haut-Saint-Maurice, QC","lat":47.3,"lng":-73.4,"pop":13005,"a":10151.0,"d":1.3,"h":0.7,"dw":7070},{"n":"Le Domaine-du-Roy, QC","lat":48.55,"lng":-72.25,"pop":31290,"a":5698.1,"d":5.5,"h":2.8,"dw":15760},{"n":"Le Fjord-du-Saguenay, QC","lat":48.3,"lng":-71.4,"pop":23735,"a":1706.2,"d":13.9,"h":6.9,"dw":11750},{"n":"Saguenay (Chicoutimi), QC","lat":48.45,"lng":-71.05,"pop":161210,"a":1246.3,"d":129.3,"h":63.2,"dw":78710},{"n":"Lac-Saint-Jean-Est, QC","lat":48.5,"lng":-71.75,"pop":54320,"a":981.9,"d":55.3,"h":25.6,"dw":25120},{"n":"Maria-Chapdelaine, QC","lat":49.0,"lng":-72.5,"pop":24190,"a":14841.8,"d":1.6,"h":0.8,"dw":12030},{"n":"Rivi\u00e8re-du-Loup, QC","lat":47.8,"lng":-69.55,"pop":34510,"a":435.5,"d":79.2,"h":37.4,"dw":16280},{"n":"T\u00e9miscouata, QC","lat":47.55,"lng":-68.85,"pop":19405,"a":1510.0,"d":12.9,"h":6.7,"dw":10050},{"n":"Les Basques, QC","lat":48.1,"lng":-69.15,"pop":8850,"a":435.5,"d":20.3,"h":11.6,"dw":5060},{"n":"Rimouski-Neigette, QC","lat":48.4,"lng":-68.55,"pop":56730,"a":2256.4,"d":25.1,"h":12.7,"dw":28690},{"n":"La Mitis, QC","lat":48.6,"lng":-68.05,"pop":18965,"a":886.1,"d":21.4,"h":11.3,"dw":10000},{"n":"La Matap\u00e9dia, QC","lat":48.6,"lng":-67.2,"pop":17865,"a":2069.5,"d":8.6,"h":4.3,"dw":8870},{"n":"Matane, QC","lat":48.85,"lng":-67.5,"pop":21310,"a":1280.7,"d":16.6,"h":8.9,"dw":11360},{"n":"Kamouraska, QC","lat":47.5,"lng":-69.85,"pop":20975,"a":876.1,"d":23.9,"h":12.3,"dw":10780},{"n":"La Haute-C\u00f4te-Nord, QC","lat":48.85,"lng":-69.5,"pop":9785,"a":4351.4,"d":2.2,"h":1.2,"dw":5360},{"n":"Manicouagan, QC","lat":49.2,"lng":-68.15,"pop":28115,"a":14188.5,"d":2.0,"h":1.0,"dw":14230},{"n":"Sept-Rivi\u00e8res, QC","lat":50.2,"lng":-66.4,"pop":34830,"a":9439.8,"d":3.7,"h":1.8,"dw":17020},{"n":"Minganie, QC","lat":50.3,"lng":-64.0,"pop":5800,"a":14039.4,"d":0.4,"h":0.2,"dw":3060},{"n":"Le Golfe-du-Saint-Laurent, QC","lat":50.1,"lng":-60.8,"pop":4070,"a":16592.0,"d":0.2,"h":0.1,"dw":2330},{"n":"Abitibi-Ouest, QC","lat":48.7,"lng":-79.3,"pop":20430,"a":1315.8,"d":15.5,"h":7.4,"dw":9720},{"n":"Abitibi, QC","lat":48.6,"lng":-77.8,"pop":25010,"a":2532.8,"d":9.9,"h":4.7,"dw":11860},{"n":"Rouyn-Noranda, QC","lat":48.25,"lng":-79.0,"pop":44335,"a":2485.7,"d":17.8,"h":8.7,"dw":21550},{"n":"Vall\u00e9e-de-l'Or, QC","lat":48.1,"lng":-77.8,"pop":46810,"a":8489.6,"d":5.5,"h":2.6,"dw":21880},{"n":"T\u00e9miscamingue, QC","lat":47.5,"lng":-79.4,"pop":15150,"a":7413.9,"d":2.0,"h":1.2,"dw":8530},{"n":"La Tuque, QC","lat":47.45,"lng":-72.8,"pop":11010,"a":10896.2,"d":1.0,"h":0.5,"dw":5700},{"n":"Jam\u00e9sie, QC","lat":49.8,"lng":-76.5,"pop":13770,"a":114797.0,"d":0.1,"h":0.1,"dw":6990},{"n":"Kativik, QC","lat":58.0,"lng":-73.0,"pop":13605,"a":171162.9,"d":0.1,"h":0.0,"dw":3320},{"n":"Eeyou Istchee, QC","lat":52.0,"lng":-78.0,"pop":18365,"a":1741.3,"d":10.5,"h":2.3,"dw":4000},{"n":"Stormont, Dundas & Glengarry, ON","lat":45.0,"lng":-74.8,"pop":114637,"a":1275.7,"d":89.9,"h":40.4,"dw":51540},{"n":"Prescott and Russell, ON","lat":45.4,"lng":-74.8,"pop":93782,"a":773.4,"d":121.3,"h":48.7,"dw":37680},{"n":"Ottawa, ON","lat":45.42,"lng":-75.7,"pop":1017449,"a":1079.5,"d":942.5,"h":399.1,"dw":430820},{"n":"Leeds and Grenville, ON","lat":44.6,"lng":-75.9,"pop":103050,"a":1306.6,"d":78.9,"h":37.2,"dw":48620},{"n":"Lanark, ON","lat":45.0,"lng":-76.5,"pop":72325,"a":1161.4,"d":62.3,"h":28.8,"dw":33420},{"n":"Frontenac, ON","lat":44.55,"lng":-76.8,"pop":161020,"a":1466.4,"d":109.8,"h":50.1,"dw":73470},{"n":"Lennox and Addington, ON","lat":44.55,"lng":-77.15,"pop":44475,"a":1096.9,"d":40.5,"h":18.2,"dw":19930},{"n":"Hastings, ON","lat":44.4,"lng":-77.5,"pop":174450,"a":2355.2,"d":74.1,"h":32.8,"dw":77260},{"n":"Prince Edward, ON","lat":44.0,"lng":-77.1,"pop":25704,"a":405.4,"d":63.4,"h":36.0,"dw":14600},{"n":"Northumberland, ON","lat":44.05,"lng":-78.0,"pop":89365,"a":735.5,"d":121.5,"h":54.5,"dw":40100},{"n":"Peterborough, ON","lat":44.3,"lng":-78.3,"pop":150635,"a":1485.3,"d":101.4,"h":46.2,"dw":68600},{"n":"Kawartha Lakes, ON","lat":44.55,"lng":-78.9,"pop":78990,"a":1190.4,"d":66.4,"h":36.1,"dw":42980},{"n":"Durham, ON","lat":44.05,"lng":-78.85,"pop":696992,"a":979.5,"d":711.5,"h":258.6,"dw":253350},{"n":"York, ON","lat":43.95,"lng":-79.45,"pop":1173334,"a":680.3,"d":1724.7,"h":574.4,"dw":390780},{"n":"Toronto, ON","lat":43.65,"lng":-79.38,"pop":2794356,"a":243.6,"d":11469.7,"h":4765.0,"dw":1160895},{"n":"Peel, ON","lat":43.7,"lng":-79.85,"pop":1451022,"a":481.5,"d":3013.7,"h":996.8,"dw":479920},{"n":"Dufferin, ON","lat":44.1,"lng":-80.15,"pop":66258,"a":573.7,"d":115.5,"h":42.4,"dw":24320},{"n":"Simcoe, ON","lat":44.4,"lng":-79.9,"pop":490936,"a":1876.1,"d":261.7,"h":104.2,"dw":195510},{"n":"Muskoka, ON","lat":45.1,"lng":-79.3,"pop":67070,"a":1497.7,"d":44.8,"h":28.9,"dw":43250},{"n":"Haliburton, ON","lat":45.1,"lng":-78.5,"pop":20571,"a":1571.8,"d":13.1,"h":10.0,"dw":15650},{"n":"Renfrew, ON","lat":45.6,"lng":-77.0,"pop":108328,"a":2872.6,"d":37.7,"h":17.0,"dw":48830},{"n":"Nipissing, ON","lat":46.3,"lng":-79.45,"pop":84736,"a":4133.6,"d":20.5,"h":10.2,"dw":42200},{"n":"Parry Sound, ON","lat":45.7,"lng":-80.0,"pop":46206,"a":3587.3,"d":12.9,"h":8.5,"dw":30670},{"n":"Manitoulin, ON","lat":45.75,"lng":-82.0,"pop":13866,"a":1199.6,"d":11.6,"h":6.8,"dw":8100},{"n":"Sudbury District, ON","lat":46.8,"lng":-81.4,"pop":22000,"a":15545.6,"d":1.4,"h":0.7,"dw":11610},{"n":"Greater Sudbury, ON","lat":46.49,"lng":-81.0,"pop":166004,"a":1250.2,"d":132.8,"h":61.1,"dw":76420},{"n":"Timiskaming, ON","lat":47.5,"lng":-80.0,"pop":32028,"a":4816.6,"d":6.6,"h":3.4,"dw":16400},{"n":"Cochrane, ON","lat":50.0,"lng":-82.0,"pop":77175,"a":54549.6,"d":1.4,"h":0.7,"dw":38430},{"n":"Algoma, ON","lat":47.0,"lng":-84.0,"pop":104588,"a":18846.8,"d":5.5,"h":2.8,"dw":53100},{"n":"Thunder Bay, ON","lat":48.8,"lng":-89.25,"pop":146048,"a":40045.7,"d":3.6,"h":1.8,"dw":72990},{"n":"Rainy River, ON","lat":48.7,"lng":-93.5,"pop":19634,"a":5979.6,"d":3.3,"h":1.8,"dw":10740},{"n":"Kenora, ON","lat":50.5,"lng":-90.5,"pop":64725,"a":157225.8,"d":0.4,"h":0.2,"dw":31590},{"n":"Halton, ON","lat":43.45,"lng":-79.85,"pop":596637,"a":372.2,"d":1603.0,"h":576.5,"dw":214560},{"n":"Hamilton, ON","lat":43.25,"lng":-79.87,"pop":569353,"a":431.3,"d":1320.2,"h":551.1,"dw":237680},{"n":"Niagara, ON","lat":43.05,"lng":-79.25,"pop":477941,"a":715.8,"d":667.7,"h":283.9,"dw":203200},{"n":"Haldimand-Norfolk, ON","lat":42.9,"lng":-80.2,"pop":116042,"a":1122.4,"d":103.4,"h":44.4,"dw":49810},{"n":"Brant, ON","lat":43.15,"lng":-80.3,"pop":143528,"a":325.5,"d":441.0,"h":181.3,"dw":59020},{"n":"Waterloo, ON","lat":43.45,"lng":-80.5,"pop":587165,"a":528.6,"d":1110.8,"h":443.9,"dw":234625},{"n":"Wellington, ON","lat":43.75,"lng":-80.45,"pop":237889,"a":1027.0,"d":231.6,"h":87.1,"dw":89420},{"n":"Perth, ON","lat":43.65,"lng":-81.0,"pop":83053,"a":856.4,"d":97.0,"h":41.3,"dw":35400},{"n":"Oxford, ON","lat":43.1,"lng":-80.8,"pop":121781,"a":787.6,"d":154.6,"h":64.6,"dw":50880},{"n":"Elgin, ON","lat":42.75,"lng":-81.0,"pop":94905,"a":726.3,"d":130.7,"h":56.1,"dw":40720},{"n":"Middlesex, ON","lat":42.98,"lng":-81.25,"pop":509060,"a":1280.7,"d":397.5,"h":170.5,"dw":218420},{"n":"Lambton, ON","lat":42.9,"lng":-82.0,"pop":130920,"a":1159.1,"d":113.0,"h":50.6,"dw":58610},{"n":"Huron, ON","lat":43.65,"lng":-81.5,"pop":61366,"a":1312.7,"d":46.7,"h":21.0,"dw":27590},{"n":"Bruce, ON","lat":44.4,"lng":-81.3,"pop":72977,"a":1578.4,"d":46.2,"h":25.2,"dw":39810},{"n":"Grey, ON","lat":44.3,"lng":-80.7,"pop":99804,"a":1743.3,"d":57.3,"h":27.6,"dw":48170},{"n":"Essex, ON","lat":42.25,"lng":-82.95,"pop":422860,"a":714.7,"d":591.7,"h":251.5,"dw":179740},{"n":"Chatham-Kent, ON","lat":42.4,"lng":-82.2,"pop":108177,"a":949.0,"d":114.0,"h":52.8,"dw":50130},{"n":"Division No. 1, MB","lat":49.1,"lng":-97.1,"pop":40355,"a":1112.7,"d":36.3,"h":15.3,"dw":17020},{"n":"Division No. 2, MB","lat":49.15,"lng":-98.5,"pop":32120,"a":3745.2,"d":8.6,"h":3.9,"dw":14650},{"n":"Division No. 3, MB","lat":49.15,"lng":-99.7,"pop":15335,"a":1894.2,"d":8.1,"h":3.7,"dw":7070},{"n":"Division No. 4, MB","lat":49.15,"lng":-100.8,"pop":11625,"a":1836.3,"d":6.3,"h":2.9,"dw":5340},{"n":"Division No. 5, MB","lat":49.15,"lng":-101.5,"pop":14585,"a":1888.0,"d":7.7,"h":3.7,"dw":6910},{"n":"Division No. 6, MB","lat":49.5,"lng":-100.5,"pop":11870,"a":1449.4,"d":8.2,"h":3.8,"dw":5580},{"n":"Division No. 7, MB","lat":49.9,"lng":-99.5,"pop":14735,"a":1372.6,"d":10.7,"h":4.9,"dw":6780},{"n":"Division No. 8, MB","lat":50.1,"lng":-100.5,"pop":12445,"a":1882.2,"d":6.6,"h":3.1,"dw":5830},{"n":"Division No. 9, MB","lat":50.1,"lng":-101.0,"pop":26700,"a":1070.7,"d":24.9,"h":11.4,"dw":12210},{"n":"Division No. 10, MB","lat":49.8,"lng":-98.0,"pop":10220,"a":1335.9,"d":7.7,"h":3.6,"dw":4760},{"n":"Division No. 11, MB","lat":49.9,"lng":-97.14,"pop":749607,"a":179.2,"d":4184.2,"h":1765.7,"dw":316330},{"n":"Division No. 12, MB","lat":50.2,"lng":-96.8,"pop":29860,"a":2075.3,"d":14.4,"h":6.1,"dw":12570},{"n":"Division No. 13, MB","lat":49.9,"lng":-97.6,"pop":72870,"a":1342.9,"d":54.3,"h":21.3,"dw":28600},{"n":"Division No. 14, MB","lat":50.4,"lng":-97.5,"pop":37785,"a":1474.9,"d":25.6,"h":10.5,"dw":15550},{"n":"Division No. 15, MB","lat":50.8,"lng":-99.3,"pop":25250,"a":3822.4,"d":6.6,"h":3.1,"dw":11880},{"n":"Division No. 16, MB","lat":51.0,"lng":-100.5,"pop":16625,"a":3374.5,"d":4.9,"h":2.3,"dw":7830},{"n":"Division No. 17, MB","lat":50.5,"lng":-101.0,"pop":16120,"a":2494.2,"d":6.5,"h":2.9,"dw":7310},{"n":"Division No. 18, MB","lat":51.5,"lng":-97.0,"pop":41280,"a":8513.5,"d":4.8,"h":1.9,"dw":16520},{"n":"Division No. 19, MB","lat":51.5,"lng":-99.0,"pop":21515,"a":15081.1,"d":1.4,"h":0.6,"dw":9500},{"n":"Division No. 20, MB","lat":52.5,"lng":-101.5,"pop":20765,"a":17934.4,"d":1.2,"h":0.5,"dw":9210},{"n":"Division No. 21, MB","lat":55.0,"lng":-97.5,"pop":34720,"a":42892.1,"d":0.8,"h":0.2,"dw":10420},{"n":"Division No. 22, MB","lat":55.0,"lng":-99.5,"pop":6430,"a":50077.4,"d":0.1,"h":0.1,"dw":2730},{"n":"Division No. 23, MB","lat":57.0,"lng":-94.0,"pop":9910,"a":105517.8,"d":0.1,"h":0.0,"dw":3100},{"n":"Division No. 1, SK","lat":49.3,"lng":-103.0,"pop":16920,"a":6243.3,"d":2.7,"h":1.3,"dw":8350},{"n":"Division No. 2, SK","lat":49.3,"lng":-105.5,"pop":14875,"a":6571.5,"d":2.3,"h":1.1,"dw":7200},{"n":"Division No. 3, SK","lat":49.3,"lng":-107.8,"pop":13670,"a":8034.8,"d":1.7,"h":0.8,"dw":6590},{"n":"Division No. 4, SK","lat":49.3,"lng":-109.5,"pop":22560,"a":8324.4,"d":2.7,"h":1.3,"dw":10630},{"n":"Division No. 5, SK","lat":50.2,"lng":-102.0,"pop":13820,"a":4115.8,"d":3.4,"h":1.6,"dw":6700},{"n":"Division No. 6, SK","lat":50.45,"lng":-104.62,"pop":271015,"a":2575.7,"d":105.2,"h":45.6,"dw":117500},{"n":"Division No. 7, SK","lat":50.5,"lng":-106.3,"pop":32060,"a":4891.9,"d":6.6,"h":2.9,"dw":14160},{"n":"Division No. 8, SK","lat":50.5,"lng":-108.5,"pop":20310,"a":6988.4,"d":2.9,"h":1.4,"dw":9440},{"n":"Division No. 9, SK","lat":51.5,"lng":-102.5,"pop":14510,"a":6139.0,"d":2.4,"h":1.1,"dw":6970},{"n":"Division No. 10, SK","lat":51.3,"lng":-104.5,"pop":18115,"a":4826.3,"d":3.8,"h":1.7,"dw":8370},{"n":"Division No. 11, SK","lat":52.13,"lng":-106.67,"pop":338225,"a":4529.0,"d":74.7,"h":30.8,"dw":139400},{"n":"Division No. 12, SK","lat":51.8,"lng":-109.0,"pop":40490,"a":9965.3,"d":4.1,"h":1.7,"dw":17250},{"n":"Division No. 13, SK","lat":52.0,"lng":-109.5,"pop":17605,"a":6795.4,"d":2.6,"h":1.2,"dw":8090},{"n":"Division No. 14, SK","lat":52.5,"lng":-104.0,"pop":18020,"a":5965.3,"d":3.0,"h":1.4,"dw":8540},{"n":"Division No. 15, SK","lat":53.0,"lng":-105.5,"pop":29775,"a":8633.2,"d":3.4,"h":1.5,"dw":12870},{"n":"Division No. 16, SK","lat":53.0,"lng":-108.0,"pop":34175,"a":10633.2,"d":3.2,"h":1.4,"dw":14980},{"n":"Division No. 17, SK","lat":54.0,"lng":-109.0,"pop":32870,"a":20343.7,"d":1.6,"h":0.7,"dw":13270},{"n":"Division No. 18, SK","lat":55.5,"lng":-107.5,"pop":38515,"a":74965.6,"d":0.5,"h":0.2,"dw":13490},{"n":"Division No. 1, AB","lat":49.5,"lng":-110.5,"pop":73095,"a":9698.9,"d":7.5,"h":3.3,"dw":31620},{"n":"Division No. 2, AB","lat":49.7,"lng":-112.8,"pop":137230,"a":9169.9,"d":15.0,"h":6.2,"dw":57300},{"n":"Division No. 3, AB","lat":49.8,"lng":-114.0,"pop":42595,"a":5606.2,"d":7.6,"h":3.1,"dw":17350},{"n":"Division No. 4, AB","lat":50.5,"lng":-110.5,"pop":44150,"a":12058.0,"d":3.7,"h":1.6,"dw":19040},{"n":"Division No. 5, AB","lat":51.0,"lng":-112.5,"pop":54095,"a":5586.9,"d":9.7,"h":4.1,"dw":22820},{"n":"Division No. 6, AB","lat":51.05,"lng":-114.07,"pop":1481806,"a":1972.2,"d":751.3,"h":289.5,"dw":571030},{"n":"Division No. 7, AB","lat":51.5,"lng":-115.0,"pop":67740,"a":15031.0,"d":4.5,"h":2.0,"dw":29940},{"n":"Division No. 8, AB","lat":52.25,"lng":-113.8,"pop":222010,"a":4633.2,"d":47.9,"h":19.3,"dw":89540},{"n":"Division No. 9, AB","lat":52.0,"lng":-111.0,"pop":26415,"a":6289.6,"d":4.2,"h":1.9,"dw":11780},{"n":"Division No. 10, AB","lat":52.5,"lng":-110.0,"pop":50850,"a":6308.9,"d":8.1,"h":3.5,"dw":22230},{"n":"Division No. 11, AB","lat":53.55,"lng":-113.49,"pop":1418118,"a":3639.8,"d":389.6,"h":154.2,"dw":561080},{"n":"Division No. 12, AB","lat":53.0,"lng":-111.0,"pop":72870,"a":9598.5,"d":7.6,"h":3.1,"dw":30010},{"n":"Division No. 13, AB","lat":52.5,"lng":-115.5,"pop":26105,"a":15710.5,"d":1.7,"h":0.9,"dw":13400},{"n":"Division No. 14, AB","lat":54.0,"lng":-113.0,"pop":24705,"a":6486.5,"d":3.8,"h":1.6,"dw":10490},{"n":"Division No. 15, AB","lat":54.0,"lng":-115.5,"pop":56515,"a":12092.7,"d":4.7,"h":2.0,"dw":23840},{"n":"Division No. 16, AB","lat":57.0,"lng":-111.5,"pop":70050,"a":26430.2,"d":2.7,"h":1.1,"dw":27870},{"n":"Division No. 17, AB","lat":55.5,"lng":-117.0,"pop":137145,"a":23608.2,"d":5.8,"h":2.4,"dw":55880},{"n":"Division No. 18, AB","lat":55.0,"lng":-114.0,"pop":10880,"a":12227.9,"d":0.9,"h":0.4,"dw":4870},{"n":"Division No. 19, AB","lat":59.0,"lng":-120.0,"pop":3735,"a":72543.9,"d":0.1,"h":0.0,"dw":1750},{"n":"East Kootenay, BC","lat":49.8,"lng":-116.0,"pop":63745,"a":10632.9,"d":6.0,"h":3.1,"dw":32930},{"n":"Central Kootenay, BC","lat":49.5,"lng":-117.2,"pop":62465,"a":8544.4,"d":7.3,"h":3.8,"dw":32720},{"n":"Kootenay Boundary, BC","lat":49.1,"lng":-118.1,"pop":32425,"a":3125.5,"d":10.4,"h":5.2,"dw":16240},{"n":"Okanagan-Similkameen, BC","lat":49.4,"lng":-119.5,"pop":87405,"a":4020.9,"d":21.7,"h":11.0,"dw":44310},{"n":"Fraser Valley, BC","lat":49.1,"lng":-121.9,"pop":332683,"a":5158.7,"d":64.5,"h":23.2,"dw":119530},{"n":"Greater Vancouver, BC","lat":49.25,"lng":-123.0,"pop":2642825,"a":1113.1,"d":2374.2,"h":959.1,"dw":1067595},{"n":"Capital (Victoria), BC","lat":48.45,"lng":-123.5,"pop":415451,"a":904.3,"d":459.4,"h":202.8,"dw":183380},{"n":"Cowichan Valley, BC","lat":48.8,"lng":-123.9,"pop":89955,"a":1340.9,"d":67.1,"h":30.3,"dw":40670},{"n":"Nanaimo, BC","lat":49.15,"lng":-124.0,"pop":170908,"a":786.5,"d":217.3,"h":100.7,"dw":79210},{"n":"Alberni-Clayoquot, BC","lat":49.25,"lng":-125.2,"pop":30905,"a":2553.3,"d":12.1,"h":5.7,"dw":14470},{"n":"Strathcona, BC","lat":50.1,"lng":-125.3,"pop":49765,"a":7076.9,"d":7.0,"h":3.4,"dw":23950},{"n":"Comox Valley, BC","lat":49.7,"lng":-125.0,"pop":72171,"a":659.5,"d":109.4,"h":52.0,"dw":34260},{"n":"Powell River, BC","lat":49.85,"lng":-124.5,"pop":21668,"a":1966.0,"d":11.0,"h":5.4,"dw":10620},{"n":"Sunshine Coast, BC","lat":49.55,"lng":-123.7,"pop":33108,"a":1458.7,"d":22.7,"h":11.8,"dw":17170},{"n":"Squamish-Lillooet, BC","lat":50.1,"lng":-122.8,"pop":46370,"a":6316.6,"d":7.3,"h":3.0,"dw":18880},{"n":"Thompson-Nicola, BC","lat":50.8,"lng":-120.3,"pop":144020,"a":17173.4,"d":8.4,"h":3.7,"dw":63610},{"n":"Central Okanagan, BC","lat":49.9,"lng":-119.5,"pop":222162,"a":1121.2,"d":198.1,"h":90.0,"dw":100880},{"n":"North Okanagan, BC","lat":50.5,"lng":-119.1,"pop":90690,"a":2900.8,"d":31.3,"h":13.9,"dw":40260},{"n":"Columbia-Shuswap, BC","lat":51.1,"lng":-118.2,"pop":55570,"a":11642.9,"d":4.8,"h":2.6,"dw":29890},{"n":"Cariboo, BC","lat":52.5,"lng":-122.5,"pop":59150,"a":30938.4,"d":1.9,"h":0.9,"dw":27730},{"n":"Mount Waddington, BC","lat":50.9,"lng":-127.0,"pop":11065,"a":7833.2,"d":1.4,"h":0.7,"dw":5270},{"n":"Central Coast, BC","lat":52.2,"lng":-127.5,"pop":3210,"a":9596.6,"d":0.3,"h":0.2,"dw":1580},{"n":"Kitimat-Stikine, BC","lat":55.0,"lng":-128.5,"pop":36275,"a":38498.2,"d":0.9,"h":0.4,"dw":16210},{"n":"Bulkley-Nechako, BC","lat":54.0,"lng":-125.5,"pop":38310,"a":28324.8,"d":1.4,"h":0.6,"dw":17060},{"n":"Fraser-Fort George, BC","lat":53.9,"lng":-121.8,"pop":101695,"a":19714.0,"d":5.2,"h":2.2,"dw":43450},{"n":"Peace River, BC","lat":56.0,"lng":-121.0,"pop":63235,"a":45518.0,"d":1.4,"h":0.6,"dw":26330},{"n":"Stikine, BC","lat":58.5,"lng":-130.0,"pop":720,"a":50498.3,"d":0.0,"h":0.0,"dw":390},{"n":"Northern Rockies, BC","lat":59.0,"lng":-124.0,"pop":5405,"a":32572.3,"d":0.2,"h":0.1,"dw":2630},{"n":"North Coast, BC","lat":54.2,"lng":-130.3,"pop":17250,"a":8512.8,"d":2.0,"h":0.9,"dw":8060},{"n":"Yukon, YT","lat":63.0,"lng":-136.0,"pop":40232,"a":183287.6,"d":0.2,"h":0.1,"dw":18770},{"n":"Region 1 (Yellowknife), NT","lat":62.5,"lng":-114.4,"pop":20340,"a":62297.6,"d":0.3,"h":0.1,"dw":8650},{"n":"Region 2 (Dehcho), NT","lat":61.5,"lng":-121.0,"pop":3430,"a":31594.0,"d":0.1,"h":0.0,"dw":1550},{"n":"Region 3 (Sahtu), NT","lat":64.5,"lng":-126.0,"pop":2640,"a":46648.8,"d":0.1,"h":0.0,"dw":1180},{"n":"Region 4 (South Slave), NT","lat":60.5,"lng":-112.0,"pop":7980,"a":57038.8,"d":0.1,"h":0.1,"dw":3450},{"n":"Region 5 (North Slave), NT","lat":64.0,"lng":-115.0,"pop":5545,"a":62934.6,"d":0.1,"h":0.0,"dw":2080},{"n":"Region 6 (Inuvik), NT","lat":68.5,"lng":-134.0,"pop":5635,"a":129838.4,"d":0.0,"h":0.0,"dw":2310},{"n":"Qikiqtaaluk, NU","lat":66.0,"lng":-68.0,"pop":20710,"a":382115.9,"d":0.1,"h":0.0,"dw":6210},{"n":"Kivalliq, NU","lat":62.0,"lng":-95.0,"pop":10413,"a":171680.3,"d":0.1,"h":0.0,"dw":3110},{"n":"Kitikmeot, NU","lat":68.0,"lng":-108.0,"pop":6490,"a":172482.2,"d":0.0,"h":0.0,"dw":2150}];

// Find nearest Canadian census division by lat/lng
const findCanadianCensusDivision = (lat, lng) => {
  let nearest = null;
  let minDist = Infinity;
  CANADA_CENSUS_DIVISIONS.forEach(cd => {
    // Weighted distance (lng weight adjusted for latitude)
    const lngWeight = Math.cos(lat * Math.PI / 180);
    const d = Math.sqrt((cd.lat - lat) ** 2 + ((cd.lng - lng) * lngWeight) ** 2);
    if (d < minDist) { minDist = d; nearest = cd; }
  });
  return { cd: nearest, dist: minDist };
};

// ─── WORLD COUNTRY DATA ─────────────────────────────────────────────────────
// Source: UN World Population Prospects 2023, CIA World Factbook areas
// Fields: n=name, iso=ISO code, pop=population, a=area(sq mi), d=avg density/sq mi,
// bbox=[minLat, minLng, maxLat, maxLng] — used for fast point-in-country lookup
const WORLD_COUNTRIES = [
{"n":"Afghanistan","iso":"AF","pop":42239854,"a":251827,"d":168,"bbox":[29.4,60.5,38.5,74.9]},
{"n":"Albania","iso":"AL","pop":2745972,"a":11100,"d":247,"bbox":[39.6,19.3,42.7,21.1]},
{"n":"Algeria","iso":"DZ","pop":45606480,"a":919595,"d":50,"bbox":[19.0,-8.7,37.1,12.0]},
{"n":"Andorra","iso":"AD","pop":80088,"a":181,"d":443,"bbox":[42.4,1.4,42.7,1.8]},
{"n":"Angola","iso":"AO","pop":36684202,"a":481354,"d":76,"bbox":[-18.0,11.7,-4.4,24.1]},
{"n":"Argentina","iso":"AR","pop":45773884,"a":1068302,"d":43,"bbox":[-55.1,-73.6,-21.8,-53.6]},
{"n":"Armenia","iso":"AM","pop":2777970,"a":11484,"d":242,"bbox":[38.8,43.4,41.3,46.6]},
{"n":"Australia","iso":"AU","pop":26638544,"a":2969907,"d":9,"bbox":[-43.6,113.3,-10.7,153.6]},
{"n":"Austria","iso":"AT","pop":8958960,"a":32383,"d":277,"bbox":[46.4,9.5,49.0,17.2]},
{"n":"Azerbaijan","iso":"AZ","pop":10412651,"a":33436,"d":311,"bbox":[38.4,44.8,41.9,50.4]},
{"n":"Bahamas","iso":"BS","pop":412623,"a":5358,"d":77,"bbox":[20.9,-79.5,27.3,-72.7]},
{"n":"Bahrain","iso":"BH","pop":1485509,"a":293,"d":5069,"bbox":[25.6,50.4,26.3,50.8]},
{"n":"Bangladesh","iso":"BD","pop":172954319,"a":57321,"d":3018,"bbox":[20.6,88.0,26.6,92.7]},
{"n":"Barbados","iso":"BB","pop":281995,"a":166,"d":1699,"bbox":[13.0,-59.7,13.3,-59.4]},
{"n":"Belarus","iso":"BY","pop":9498240,"a":80153,"d":118,"bbox":[51.3,23.2,56.2,32.8]},
{"n":"Belgium","iso":"BE","pop":11686140,"a":11787,"d":991,"bbox":[49.5,2.5,51.5,6.4]},
{"n":"Belize","iso":"BZ","pop":410825,"a":8867,"d":46,"bbox":[15.9,-89.2,18.5,-87.8]},
{"n":"Benin","iso":"BJ","pop":13712828,"a":43484,"d":315,"bbox":[6.2,0.8,12.4,3.8]},
{"n":"Bhutan","iso":"BT","pop":787424,"a":14824,"d":53,"bbox":[26.7,88.7,28.4,92.1]},
{"n":"Bolivia","iso":"BO","pop":12388571,"a":424164,"d":29,"bbox":[-22.9,-69.6,-9.7,-57.5]},
{"n":"Bosnia and Herzegovina","iso":"BA","pop":3210847,"a":19767,"d":162,"bbox":[42.6,15.7,45.3,19.6]},
{"n":"Botswana","iso":"BW","pop":2675352,"a":224610,"d":12,"bbox":[-26.9,20.0,-17.8,29.4]},
{"n":"Brazil","iso":"BR","pop":216422446,"a":3287956,"d":66,"bbox":[-33.8,-73.9,5.3,-34.8]},
{"n":"Brunei","iso":"BN","pop":454820,"a":2226,"d":204,"bbox":[4.0,114.1,5.1,115.4]},
{"n":"Bulgaria","iso":"BG","pop":6687717,"a":42811,"d":156,"bbox":[41.2,22.4,44.2,28.6]},
{"n":"Burkina Faso","iso":"BF","pop":23251485,"a":105869,"d":220,"bbox":[9.4,-5.5,15.1,2.4]},
{"n":"Burundi","iso":"BI","pop":13238559,"a":10747,"d":1232,"bbox":[-4.5,29.0,-2.3,30.9]},
{"n":"Cambodia","iso":"KH","pop":16944826,"a":69898,"d":242,"bbox":[10.4,102.3,14.7,107.6]},
{"n":"Cameroon","iso":"CM","pop":28647293,"a":183568,"d":156,"bbox":[1.6,8.5,13.1,16.2]},
{"n":"Cape Verde","iso":"CV","pop":598682,"a":1557,"d":384,"bbox":[14.8,-25.4,17.2,-22.7]},
{"n":"Central African Republic","iso":"CF","pop":5742316,"a":240535,"d":24,"bbox":[2.2,14.4,11.0,27.5]},
{"n":"Chad","iso":"TD","pop":18278568,"a":495755,"d":37,"bbox":[7.4,13.5,23.5,24.0]},
{"n":"Chile","iso":"CL","pop":19629590,"a":291930,"d":67,"bbox":[-56.0,-75.7,-17.5,-66.4]},
{"n":"China","iso":"CN","pop":1425671352,"a":3705407,"d":385,"bbox":[18.2,73.5,53.6,134.8]},
{"n":"Colombia","iso":"CO","pop":52321818,"a":439736,"d":119,"bbox":[-4.2,-79.0,13.4,-66.9]},
{"n":"Comoros","iso":"KM","pop":852075,"a":719,"d":1185,"bbox":[-12.4,43.2,-11.4,44.5]},
{"n":"Congo (Kinshasa)","iso":"CD","pop":102262809,"a":905568,"d":113,"bbox":[-13.5,12.2,5.4,31.3]},
{"n":"Congo (Brazzaville)","iso":"CG","pop":6106869,"a":132047,"d":46,"bbox":[-5.0,11.2,3.7,18.6]},
{"n":"Costa Rica","iso":"CR","pop":5212173,"a":19730,"d":264,"bbox":[8.0,-85.9,11.2,-82.6]},
{"n":"Croatia","iso":"HR","pop":4008617,"a":21851,"d":184,"bbox":[42.4,13.5,46.5,19.4]},
{"n":"Cuba","iso":"CU","pop":11194449,"a":42803,"d":261,"bbox":[19.8,-84.9,23.2,-74.1]},
{"n":"Cyprus","iso":"CY","pop":1260138,"a":3572,"d":353,"bbox":[34.5,32.3,35.7,34.6]},
{"n":"Czech Republic","iso":"CZ","pop":10495295,"a":30450,"d":345,"bbox":[48.6,12.1,51.1,18.9]},
{"n":"Denmark","iso":"DK","pop":5946952,"a":16639,"d":357,"bbox":[54.6,8.1,57.7,15.2]},
{"n":"Djibouti","iso":"DJ","pop":1136455,"a":8958,"d":127,"bbox":[10.9,41.8,12.7,43.4]},
{"n":"Dominican Republic","iso":"DO","pop":11332972,"a":18792,"d":603,"bbox":[17.5,-72.0,19.9,-68.3]},
{"n":"Ecuador","iso":"EC","pop":18190484,"a":109484,"d":166,"bbox":[-5.0,-81.0,1.4,-75.2]},
{"n":"Egypt","iso":"EG","pop":112716598,"a":386662,"d":291,"bbox":[22.0,25.0,31.7,36.9]},
{"n":"El Salvador","iso":"SV","pop":6364943,"a":8124,"d":783,"bbox":[13.2,-90.1,14.5,-87.7]},
{"n":"Equatorial Guinea","iso":"GQ","pop":1714672,"a":10831,"d":158,"bbox":[-1.5,5.6,3.8,11.3]},
{"n":"Eritrea","iso":"ER","pop":3748901,"a":45406,"d":83,"bbox":[12.4,36.4,18.0,43.1]},
{"n":"Estonia","iso":"EE","pop":1322766,"a":17462,"d":76,"bbox":[57.5,21.8,59.7,28.2]},
{"n":"Eswatini","iso":"SZ","pop":1210822,"a":6704,"d":181,"bbox":[-27.3,30.8,-25.7,32.1]},
{"n":"Ethiopia","iso":"ET","pop":126527060,"a":426373,"d":297,"bbox":[3.4,32.9,14.9,48.0]},
{"n":"Fiji","iso":"FJ","pop":924610,"a":7056,"d":131,"bbox":[-19.2,177.0,-16.1,180.2]},
{"n":"Finland","iso":"FI","pop":5545475,"a":130558,"d":42,"bbox":[59.8,20.5,70.1,31.6]},
{"n":"France","iso":"FR","pop":64756584,"a":248573,"d":261,"bbox":[41.3,-5.2,51.1,9.6]},
{"n":"Gabon","iso":"GA","pop":2436566,"a":103347,"d":24,"bbox":[-3.9,8.7,2.3,14.5]},
{"n":"Gambia","iso":"GM","pop":2773168,"a":4363,"d":636,"bbox":[13.1,-16.9,13.9,-13.8]},
{"n":"Georgia","iso":"GE","pop":3728282,"a":26911,"d":139,"bbox":[41.0,40.0,43.6,46.7]},
{"n":"Germany","iso":"DE","pop":83294633,"a":137847,"d":604,"bbox":[47.3,5.9,55.1,15.0]},
{"n":"Ghana","iso":"GH","pop":34121985,"a":92098,"d":371,"bbox":[4.7,-3.3,11.2,1.2]},
{"n":"Greece","iso":"GR","pop":10341278,"a":50949,"d":203,"bbox":[34.8,19.4,41.7,28.3]},
{"n":"Guatemala","iso":"GT","pop":18092026,"a":42042,"d":430,"bbox":[13.7,-92.2,17.8,-88.2]},
{"n":"Guinea","iso":"GN","pop":14190612,"a":94926,"d":149,"bbox":[7.2,-15.1,12.7,-7.6]},
{"n":"Guinea-Bissau","iso":"GW","pop":2150842,"a":13948,"d":154,"bbox":[10.9,-16.7,12.7,-13.6]},
{"n":"Guyana","iso":"GY","pop":813834,"a":83000,"d":10,"bbox":[1.2,-61.4,8.6,-56.5]},
{"n":"Haiti","iso":"HT","pop":11724763,"a":10714,"d":1094,"bbox":[18.0,-74.5,20.1,-71.6]},
{"n":"Honduras","iso":"HN","pop":10593798,"a":43278,"d":245,"bbox":[13.0,-89.4,17.4,-83.1]},
{"n":"Hungary","iso":"HU","pop":10156239,"a":35918,"d":283,"bbox":[45.7,16.1,48.6,22.9]},
{"n":"Iceland","iso":"IS","pop":393396,"a":39769,"d":10,"bbox":[63.3,-24.6,66.6,-13.5]},
{"n":"India","iso":"IN","pop":1428627663,"a":1269219,"d":1126,"bbox":[6.7,68.1,35.7,97.4]},
{"n":"Indonesia","iso":"ID","pop":277534123,"a":735358,"d":377,"bbox":[-11.0,95.0,6.1,141.0]},
{"n":"Iran","iso":"IR","pop":89172767,"a":636372,"d":140,"bbox":[25.1,44.0,39.8,63.3]},
{"n":"Iraq","iso":"IQ","pop":45504560,"a":169235,"d":269,"bbox":[29.1,38.8,37.4,48.6]},
{"n":"Ireland","iso":"IE","pop":5056935,"a":27133,"d":186,"bbox":[51.4,-10.5,55.4,-6.0]},
{"n":"Israel","iso":"IL","pop":9174520,"a":8019,"d":1144,"bbox":[29.5,34.3,33.3,35.9]},
{"n":"Italy","iso":"IT","pop":58870762,"a":116348,"d":506,"bbox":[36.6,6.6,47.1,18.5]},
{"n":"Ivory Coast","iso":"CI","pop":28873034,"a":124504,"d":232,"bbox":[4.4,-8.6,10.7,-2.5]},
{"n":"Jamaica","iso":"JM","pop":2825544,"a":4244,"d":666,"bbox":[17.7,-78.4,18.5,-76.2]},
{"n":"Japan","iso":"JP","pop":123294513,"a":145914,"d":845,"bbox":[24.0,122.9,45.5,145.8]},
{"n":"Jordan","iso":"JO","pop":11337052,"a":34495,"d":329,"bbox":[29.2,34.9,33.4,39.3]},
{"n":"Kazakhstan","iso":"KZ","pop":19606633,"a":1052090,"d":19,"bbox":[40.6,46.5,55.4,87.3]},
{"n":"Kenya","iso":"KE","pop":55100586,"a":224081,"d":246,"bbox":[-4.7,33.9,5.5,41.9]},
{"n":"Kiribati","iso":"KI","pop":133515,"a":313,"d":426,"bbox":[-11.5,169.5,4.7,-150.2]},
{"n":"Kuwait","iso":"KW","pop":4310108,"a":6879,"d":626,"bbox":[28.5,46.6,30.1,48.4]},
{"n":"Kyrgyzstan","iso":"KG","pop":6735347,"a":77201,"d":87,"bbox":[39.2,69.3,43.3,80.3]},
{"n":"Laos","iso":"LA","pop":7633779,"a":91429,"d":83,"bbox":[13.9,100.1,22.5,107.7]},
{"n":"Latvia","iso":"LV","pop":1830212,"a":24938,"d":73,"bbox":[55.7,20.9,58.1,28.2]},
{"n":"Lebanon","iso":"LB","pop":5353930,"a":4036,"d":1327,"bbox":[33.1,35.1,34.7,36.6]},
{"n":"Lesotho","iso":"LS","pop":2298496,"a":11720,"d":196,"bbox":[-30.7,27.0,-28.6,29.5]},
{"n":"Liberia","iso":"LR","pop":5418377,"a":43000,"d":126,"bbox":[4.4,-11.5,8.6,-7.4]},
{"n":"Libya","iso":"LY","pop":6888388,"a":679362,"d":10,"bbox":[19.5,9.3,33.2,25.2]},
{"n":"Liechtenstein","iso":"LI","pop":39584,"a":62,"d":641,"bbox":[47.0,9.5,47.3,9.6]},
{"n":"Lithuania","iso":"LT","pop":2718352,"a":25212,"d":108,"bbox":[53.9,20.9,56.5,26.9]},
{"n":"Luxembourg","iso":"LU","pop":654768,"a":998,"d":656,"bbox":[49.4,5.7,50.2,6.5]},
{"n":"Madagascar","iso":"MG","pop":30325732,"a":226658,"d":134,"bbox":[-25.6,43.2,-11.9,50.5]},
{"n":"Malawi","iso":"MW","pop":20931751,"a":45747,"d":458,"bbox":[-17.1,32.7,-9.4,35.9]},
{"n":"Malaysia","iso":"MY","pop":34308525,"a":127355,"d":269,"bbox":[0.9,99.6,7.4,119.3]},
{"n":"Maldives","iso":"MV","pop":521021,"a":115,"d":4529,"bbox":[-0.7,72.7,7.1,73.7]},
{"n":"Mali","iso":"ML","pop":23293698,"a":478767,"d":49,"bbox":[10.2,-12.2,25.0,4.3]},
{"n":"Malta","iso":"MT","pop":535064,"a":122,"d":4386,"bbox":[35.8,14.2,36.1,14.6]},
{"n":"Mauritania","iso":"MR","pop":4862989,"a":397955,"d":12,"bbox":[14.7,-17.1,27.3,-4.8]},
{"n":"Mauritius","iso":"MU","pop":1300557,"a":790,"d":1646,"bbox":[-20.5,57.3,-20.0,57.8]},
{"n":"Mexico","iso":"MX","pop":128455567,"a":761606,"d":169,"bbox":[14.5,-118.4,32.7,-86.7]},
{"n":"Moldova","iso":"MD","pop":3435931,"a":13068,"d":263,"bbox":[45.5,26.6,48.5,30.2]},
{"n":"Monaco","iso":"MC","pop":36297,"a":0.78,"d":46535,"bbox":[43.7,7.4,43.8,7.5]},
{"n":"Mongolia","iso":"MN","pop":3447157,"a":603909,"d":6,"bbox":[41.5,87.7,52.2,119.9]},
{"n":"Montenegro","iso":"ME","pop":626485,"a":5333,"d":117,"bbox":[41.8,18.4,43.6,20.4]},
{"n":"Morocco","iso":"MA","pop":37840044,"a":172414,"d":219,"bbox":[21.4,-17.1,35.9,-1.0]},
{"n":"Mozambique","iso":"MZ","pop":33897354,"a":308642,"d":110,"bbox":[-26.9,30.2,-10.5,40.8]},
{"n":"Myanmar","iso":"MM","pop":54577997,"a":261228,"d":209,"bbox":[9.5,92.2,28.5,101.2]},
{"n":"Namibia","iso":"NA","pop":2604172,"a":318261,"d":8,"bbox":[-28.9,11.7,-17.0,25.3]},
{"n":"Nepal","iso":"NP","pop":30896590,"a":56827,"d":544,"bbox":[26.4,80.0,30.5,88.2]},
{"n":"Netherlands","iso":"NL","pop":17618299,"a":16033,"d":1099,"bbox":[50.7,3.4,53.6,7.2]},
{"n":"New Zealand","iso":"NZ","pop":5228100,"a":103798,"d":50,"bbox":[-47.3,166.4,-34.4,178.5]},
{"n":"Nicaragua","iso":"NI","pop":7046311,"a":50337,"d":140,"bbox":[10.7,-87.7,15.0,-83.1]},
{"n":"Niger","iso":"NE","pop":27202843,"a":489191,"d":56,"bbox":[11.7,0.2,23.5,16.0]},
{"n":"Nigeria","iso":"NG","pop":223804632,"a":356669,"d":628,"bbox":[4.3,2.7,13.9,14.7]},
{"n":"North Korea","iso":"KP","pop":26160821,"a":46540,"d":562,"bbox":[37.7,124.2,43.0,130.7]},
{"n":"North Macedonia","iso":"MK","pop":2085679,"a":9928,"d":210,"bbox":[40.9,20.5,42.4,23.0]},
{"n":"Norway","iso":"NO","pop":5474360,"a":148729,"d":37,"bbox":[57.9,4.6,71.2,31.1]},
{"n":"Oman","iso":"OM","pop":4644384,"a":119499,"d":39,"bbox":[16.6,52.0,26.4,59.9]},
{"n":"Pakistan","iso":"PK","pop":240485658,"a":307374,"d":783,"bbox":[23.7,60.9,37.1,77.8]},
{"n":"Panama","iso":"PA","pop":4468087,"a":29119,"d":153,"bbox":[7.2,-83.1,9.7,-77.2]},
{"n":"Papua New Guinea","iso":"PG","pop":10329931,"a":178704,"d":58,"bbox":[-11.7,140.9,-1.3,155.9]},
{"n":"Paraguay","iso":"PY","pop":6861524,"a":157048,"d":44,"bbox":[-27.6,-62.6,-19.3,-54.3]},
{"n":"Peru","iso":"PE","pop":34352719,"a":496225,"d":69,"bbox":[-18.3,-81.3,-0.0,-68.7]},
{"n":"Philippines","iso":"PH","pop":117337368,"a":115831,"d":1013,"bbox":[4.6,116.9,21.1,126.6]},
{"n":"Poland","iso":"PL","pop":41026067,"a":120728,"d":340,"bbox":[49.0,14.1,54.8,24.2]},
{"n":"Portugal","iso":"PT","pop":10247605,"a":35603,"d":288,"bbox":[36.9,-9.5,42.2,-6.2]},
{"n":"Qatar","iso":"QA","pop":2716391,"a":4473,"d":607,"bbox":[24.5,50.7,26.2,51.6]},
{"n":"Romania","iso":"RO","pop":19892812,"a":92043,"d":216,"bbox":[43.6,20.3,48.3,29.7]},
{"n":"Russia","iso":"RU","pop":144444359,"a":6601668,"d":22,"bbox":[41.2,19.6,81.9,180]},
{"n":"Rwanda","iso":"RW","pop":14094683,"a":10169,"d":1386,"bbox":[-2.9,28.9,-1.0,30.9]},
{"n":"Saudi Arabia","iso":"SA","pop":36947025,"a":830000,"d":45,"bbox":[16.4,34.5,32.2,55.7]},
{"n":"Senegal","iso":"SN","pop":17763163,"a":75955,"d":234,"bbox":[12.3,-17.6,16.7,-11.4]},
{"n":"Serbia","iso":"RS","pop":7149077,"a":29913,"d":239,"bbox":[42.2,18.8,46.2,23.0]},
{"n":"Sierra Leone","iso":"SL","pop":8791092,"a":27699,"d":317,"bbox":[6.9,-13.3,10.0,-10.3]},
{"n":"Singapore","iso":"SG","pop":6014723,"a":278,"d":21640,"bbox":[1.2,103.6,1.5,104.1]},
{"n":"Slovakia","iso":"SK","pop":5795199,"a":18933,"d":306,"bbox":[47.7,16.8,49.6,22.6]},
{"n":"Slovenia","iso":"SI","pop":2119844,"a":7827,"d":271,"bbox":[45.4,13.4,46.9,16.6]},
{"n":"Somalia","iso":"SO","pop":18143379,"a":246201,"d":74,"bbox":[-1.7,40.9,12.0,51.4]},
{"n":"South Africa","iso":"ZA","pop":60414495,"a":471011,"d":128,"bbox":[-34.9,16.4,-22.1,32.9]},
{"n":"South Korea","iso":"KR","pop":51784060,"a":38622,"d":1341,"bbox":[33.1,124.6,38.6,131.9]},
{"n":"South Sudan","iso":"SS","pop":11088796,"a":248776,"d":45,"bbox":[3.5,24.1,12.3,35.9]},
{"n":"Spain","iso":"ES","pop":47519628,"a":195364,"d":243,"bbox":[35.9,-9.3,43.8,4.3]},
{"n":"Sri Lanka","iso":"LK","pop":21893579,"a":25332,"d":864,"bbox":[5.9,79.6,9.9,81.9]},
{"n":"Sudan","iso":"SD","pop":48109006,"a":718723,"d":67,"bbox":[8.7,21.8,22.2,38.6]},
{"n":"Suriname","iso":"SR","pop":623236,"a":63037,"d":10,"bbox":[1.8,-58.1,6.0,-53.9]},
{"n":"Sweden","iso":"SE","pop":10612086,"a":173860,"d":61,"bbox":[55.3,10.9,69.1,24.2]},
{"n":"Switzerland","iso":"CH","pop":8796669,"a":15940,"d":552,"bbox":[45.8,5.9,47.8,10.5]},
{"n":"Syria","iso":"SY","pop":23227014,"a":71498,"d":325,"bbox":[32.3,35.7,37.3,42.4]},
{"n":"Taiwan","iso":"TW","pop":23923276,"a":13974,"d":1712,"bbox":[21.9,120.0,25.3,122.0]},
{"n":"Tajikistan","iso":"TJ","pop":10143543,"a":55251,"d":184,"bbox":[36.7,67.4,41.1,75.2]},
{"n":"Tanzania","iso":"TZ","pop":67438106,"a":365755,"d":184,"bbox":[-11.7,29.3,-0.9,40.4]},
{"n":"Thailand","iso":"TH","pop":71801279,"a":198117,"d":362,"bbox":[5.6,97.3,20.5,105.6]},
{"n":"Togo","iso":"TG","pop":9053799,"a":21925,"d":413,"bbox":[6.1,-0.1,11.1,1.8]},
{"n":"Trinidad and Tobago","iso":"TT","pop":1534937,"a":1980,"d":775,"bbox":[10.0,-61.9,11.3,-60.5]},
{"n":"Tunisia","iso":"TN","pop":12458223,"a":63170,"d":197,"bbox":[30.2,7.5,37.5,11.6]},
{"n":"Turkey","iso":"TR","pop":85816199,"a":302535,"d":284,"bbox":[35.8,25.7,42.1,44.8]},
{"n":"Turkmenistan","iso":"TM","pop":6516100,"a":188456,"d":35,"bbox":[35.1,52.4,42.8,66.7]},
{"n":"Uganda","iso":"UG","pop":48582334,"a":93065,"d":522,"bbox":[-1.5,29.6,4.2,35.0]},
{"n":"Ukraine","iso":"UA","pop":36744634,"a":233032,"d":158,"bbox":[44.4,22.1,52.4,40.2]},
{"n":"United Arab Emirates","iso":"AE","pop":9516871,"a":32278,"d":295,"bbox":[22.6,51.5,26.1,56.4]},
{"n":"United Kingdom","iso":"GB","pop":67736802,"a":94058,"d":720,"bbox":[49.9,-8.6,60.9,1.8]},
{"n":"Uruguay","iso":"UY","pop":3423108,"a":68037,"d":50,"bbox":[-34.9,-58.4,-30.1,-53.1]},
{"n":"Uzbekistan","iso":"UZ","pop":35163944,"a":172742,"d":204,"bbox":[37.2,55.9,45.6,73.1]},
{"n":"Vanuatu","iso":"VU","pop":334506,"a":4706,"d":71,"bbox":[-20.3,166.5,-13.1,170.2]},
{"n":"Venezuela","iso":"VE","pop":28838499,"a":352144,"d":82,"bbox":[0.6,-73.4,12.2,-59.8]},
{"n":"Vietnam","iso":"VN","pop":98858950,"a":128066,"d":772,"bbox":[8.4,102.1,23.4,109.5]},
{"n":"Yemen","iso":"YE","pop":34449825,"a":203850,"d":169,"bbox":[12.1,42.5,19.0,54.5]},
{"n":"Zambia","iso":"ZM","pop":20569737,"a":290587,"d":71,"bbox":[-18.1,21.9,-8.2,33.7]},
{"n":"Zimbabwe","iso":"ZW","pop":16665409,"a":150872,"d":110,"bbox":[-22.4,25.2,-15.6,33.1]},
{"n":"Puerto Rico","iso":"PR","pop":3260314,"a":3515,"d":927,"bbox":[17.9,-67.9,18.5,-65.6]},
{"n":"Greenland","iso":"GL","pop":56865,"a":836330,"d":0.07,"bbox":[59.0,-73.0,83.0,-11.0]},
{"n":"Antarctica","iso":"AQ","pop":1500,"a":5405430,"d":0.0003,"bbox":[-90,-180,-60,180]}
];

// ─── QUICK-JUMP WORLD CITIES ────────────────────────────────────────────────
// Major world cities for the "Quick City" dropdown in World mode.
// Fields: n=name, lat/lng=city center, r=region (for grouping)
const WORLD_CITIES = [
  // North America
  {n:"New York, USA",lat:40.71,lng:-74.01,r:"N America"},
  {n:"Los Angeles, USA",lat:34.05,lng:-118.24,r:"N America"},
  {n:"Chicago, USA",lat:41.88,lng:-87.63,r:"N America"},
  {n:"Mexico City, Mexico",lat:19.43,lng:-99.13,r:"N America"},
  {n:"Toronto, Canada",lat:43.65,lng:-79.38,r:"N America"},
  {n:"Havana, Cuba",lat:23.11,lng:-82.37,r:"N America"},
  // South America
  {n:"São Paulo, Brazil",lat:-23.55,lng:-46.63,r:"S America"},
  {n:"Buenos Aires, Argentina",lat:-34.60,lng:-58.38,r:"S America"},
  {n:"Bogotá, Colombia",lat:4.71,lng:-74.07,r:"S America"},
  {n:"Lima, Peru",lat:-12.05,lng:-77.04,r:"S America"},
  {n:"Rio de Janeiro, Brazil",lat:-22.91,lng:-43.17,r:"S America"},
  // Europe
  {n:"London, UK",lat:51.51,lng:-0.13,r:"Europe"},
  {n:"Paris, France",lat:48.86,lng:2.35,r:"Europe"},
  {n:"Berlin, Germany",lat:52.52,lng:13.40,r:"Europe"},
  {n:"Rome, Italy",lat:41.90,lng:12.50,r:"Europe"},
  {n:"Madrid, Spain",lat:40.42,lng:-3.70,r:"Europe"},
  {n:"Moscow, Russia",lat:55.75,lng:37.62,r:"Europe"},
  {n:"Istanbul, Turkey",lat:41.01,lng:28.98,r:"Europe"},
  {n:"Amsterdam, Netherlands",lat:52.37,lng:4.90,r:"Europe"},
  // Asia
  {n:"Tokyo, Japan",lat:35.68,lng:139.69,r:"Asia"},
  {n:"Beijing, China",lat:39.90,lng:116.41,r:"Asia"},
  {n:"Shanghai, China",lat:31.23,lng:121.47,r:"Asia"},
  {n:"Delhi, India",lat:28.61,lng:77.21,r:"Asia"},
  {n:"Mumbai, India",lat:19.08,lng:72.88,r:"Asia"},
  {n:"Seoul, South Korea",lat:37.57,lng:126.98,r:"Asia"},
  {n:"Bangkok, Thailand",lat:13.76,lng:100.50,r:"Asia"},
  {n:"Jakarta, Indonesia",lat:-6.21,lng:106.85,r:"Asia"},
  {n:"Manila, Philippines",lat:14.60,lng:120.98,r:"Asia"},
  {n:"Dhaka, Bangladesh",lat:23.71,lng:90.41,r:"Asia"},
  {n:"Karachi, Pakistan",lat:24.86,lng:67.01,r:"Asia"},
  {n:"Tehran, Iran",lat:35.69,lng:51.39,r:"Asia"},
  {n:"Ho Chi Minh City, Vietnam",lat:10.82,lng:106.63,r:"Asia"},
  {n:"Singapore",lat:1.35,lng:103.82,r:"Asia"},
  {n:"Hong Kong",lat:22.32,lng:114.17,r:"Asia"},
  // Middle East
  {n:"Dubai, UAE",lat:25.20,lng:55.27,r:"Mid East"},
  {n:"Riyadh, Saudi Arabia",lat:24.71,lng:46.68,r:"Mid East"},
  {n:"Baghdad, Iraq",lat:33.32,lng:44.42,r:"Mid East"},
  {n:"Jerusalem",lat:31.78,lng:35.22,r:"Mid East"},
  // Africa
  {n:"Cairo, Egypt",lat:30.04,lng:31.24,r:"Africa"},
  {n:"Lagos, Nigeria",lat:6.52,lng:3.38,r:"Africa"},
  {n:"Johannesburg, South Africa",lat:-26.20,lng:28.05,r:"Africa"},
  {n:"Nairobi, Kenya",lat:-1.29,lng:36.82,r:"Africa"},
  {n:"Casablanca, Morocco",lat:33.57,lng:-7.59,r:"Africa"},
  {n:"Addis Ababa, Ethiopia",lat:9.03,lng:38.75,r:"Africa"},
  {n:"Kinshasa, DR Congo",lat:-4.44,lng:15.27,r:"Africa"},
  // Oceania
  {n:"Sydney, Australia",lat:-33.87,lng:151.21,r:"Oceania"},
  {n:"Melbourne, Australia",lat:-37.81,lng:144.96,r:"Oceania"},
  {n:"Auckland, New Zealand",lat:-36.85,lng:174.76,r:"Oceania"},
  // Extreme locations (fun demos)
  {n:"North Pole",lat:89.5,lng:0,r:"Extreme"},
  {n:"Sahara Desert",lat:23.4,lng:12.7,r:"Extreme"},
  {n:"Amazon Rainforest",lat:-3.5,lng:-62,r:"Extreme"},
  {n:"Mount Everest area",lat:27.99,lng:86.93,r:"Extreme"},
];

// ─── REGIONAL CONSTRUCTION PROFILES ─────────────────────────────────────────
// Housing type mix + basement % for each region. Placing a tornado in Bangladesh
// uses very different construction (mud/thatch/informal) than a tornado in Japan
// (concrete/reinforced). These defaults dramatically improve damage realism
// when the user picks a location outside the US/Canada.
//
// Percentages sum to 100 (mobileHome + woodFrame + brick + concrete).
// basementPct is separate (fraction of homes with basements — big protective factor).
// Sources: World Bank housing surveys, UN-Habitat World Cities Report, Hazus regional.
const REGIONAL_CONSTRUCTION = {
  developed_west: {           // US, Canada, W Europe, Aus, NZ
    mobileHomePct: 10, woodFramePct: 55, brickPct: 25, concretePct: 10,
    basementPct: 40, shelterPct: 8, preparedness: 0.7,
  },
  developed_asia: {           // Japan, S Korea, Taiwan, Singapore, HK
    mobileHomePct: 3, woodFramePct: 20, brickPct: 20, concretePct: 57,
    basementPct: 5, shelterPct: 2, preparedness: 0.8,
  },
  developing_asia: {          // Bangladesh, India, Pakistan, Indonesia, Philippines, Myanmar, Vietnam
    mobileHomePct: 40, woodFramePct: 15, brickPct: 35, concretePct: 10,
    basementPct: 0, shelterPct: 1, preparedness: 0.3,
  },
  middle_east: {              // UAE, Saudi, Qatar, Kuwait, Bahrain, Israel, Jordan
    mobileHomePct: 3, woodFramePct: 5, brickPct: 32, concretePct: 60,
    basementPct: 0, shelterPct: 3, preparedness: 0.5,
  },
  sub_saharan_africa: {       // Most of Africa south of Sahara
    mobileHomePct: 55, woodFramePct: 10, brickPct: 25, concretePct: 10,
    basementPct: 0, shelterPct: 0, preparedness: 0.2,
  },
  north_africa: {             // Egypt, Morocco, Algeria, Tunisia, Libya
    mobileHomePct: 15, woodFramePct: 5, brickPct: 45, concretePct: 35,
    basementPct: 0, shelterPct: 1, preparedness: 0.3,
  },
  latin_america: {            // Mexico, Central + S America
    mobileHomePct: 25, woodFramePct: 15, brickPct: 35, concretePct: 25,
    basementPct: 5, shelterPct: 2, preparedness: 0.4,
  },
  eastern_europe: {           // Russia, Ukraine, Belarus, Balkans, ex-USSR
    mobileHomePct: 15, woodFramePct: 25, brickPct: 35, concretePct: 25,
    basementPct: 30, shelterPct: 4, preparedness: 0.5,
  },
  polar: {                    // Antarctica, Greenland
    mobileHomePct: 5, woodFramePct: 60, brickPct: 5, concretePct: 30,
    basementPct: 0, shelterPct: 0, preparedness: 0.2,
  },
};

// Map ISO country code → construction profile
const COUNTRY_PROFILE_MAP = {
  // developed_west
  US:"developed_west", CA:"developed_west", GB:"developed_west", FR:"developed_west",
  DE:"developed_west", IT:"developed_west", ES:"developed_west", NL:"developed_west",
  BE:"developed_west", AT:"developed_west", CH:"developed_west", IE:"developed_west",
  PT:"developed_west", SE:"developed_west", NO:"developed_west", DK:"developed_west",
  FI:"developed_west", IS:"developed_west", AU:"developed_west", NZ:"developed_west",
  LU:"developed_west", MC:"developed_west", AD:"developed_west", LI:"developed_west",
  MT:"developed_west", CY:"developed_west",
  // developed_asia
  JP:"developed_asia", KR:"developed_asia", TW:"developed_asia", SG:"developed_asia",
  // developing_asia
  BD:"developing_asia", IN:"developing_asia", PK:"developing_asia", ID:"developing_asia",
  PH:"developing_asia", MM:"developing_asia", VN:"developing_asia", LA:"developing_asia",
  KH:"developing_asia", NP:"developing_asia", LK:"developing_asia", BT:"developing_asia",
  MV:"developing_asia", TH:"developing_asia", MY:"developing_asia", MN:"developing_asia",
  AF:"developing_asia",
  // middle_east
  AE:"middle_east", SA:"middle_east", QA:"middle_east", KW:"middle_east", BH:"middle_east",
  OM:"middle_east", IL:"middle_east", JO:"middle_east", LB:"middle_east", SY:"middle_east",
  IQ:"middle_east", IR:"middle_east", YE:"middle_east", TR:"middle_east", AZ:"middle_east",
  AM:"middle_east", GE:"middle_east",
  // sub_saharan_africa (all below Sahara)
  NG:"sub_saharan_africa", KE:"sub_saharan_africa", ET:"sub_saharan_africa", ZA:"sub_saharan_africa",
  UG:"sub_saharan_africa", TZ:"sub_saharan_africa", GH:"sub_saharan_africa", CI:"sub_saharan_africa",
  CM:"sub_saharan_africa", SN:"sub_saharan_africa", ML:"sub_saharan_africa", BF:"sub_saharan_africa",
  NE:"sub_saharan_africa", MZ:"sub_saharan_africa", AO:"sub_saharan_africa", CD:"sub_saharan_africa",
  CG:"sub_saharan_africa", ZM:"sub_saharan_africa", ZW:"sub_saharan_africa", MW:"sub_saharan_africa",
  RW:"sub_saharan_africa", BI:"sub_saharan_africa", SO:"sub_saharan_africa", SS:"sub_saharan_africa",
  ER:"sub_saharan_africa", DJ:"sub_saharan_africa", NA:"sub_saharan_africa", BW:"sub_saharan_africa",
  LS:"sub_saharan_africa", SZ:"sub_saharan_africa", MG:"sub_saharan_africa", CV:"sub_saharan_africa",
  GN:"sub_saharan_africa", GW:"sub_saharan_africa", SL:"sub_saharan_africa", LR:"sub_saharan_africa",
  BJ:"sub_saharan_africa", TG:"sub_saharan_africa", GA:"sub_saharan_africa", GQ:"sub_saharan_africa",
  CF:"sub_saharan_africa", TD:"sub_saharan_africa", GM:"sub_saharan_africa", KM:"sub_saharan_africa",
  MU:"sub_saharan_africa", MR:"sub_saharan_africa",
  // north_africa
  EG:"north_africa", MA:"north_africa", DZ:"north_africa", TN:"north_africa", LY:"north_africa",
  SD:"north_africa",
  // latin_america
  MX:"latin_america", BR:"latin_america", AR:"latin_america", CO:"latin_america",
  PE:"latin_america", VE:"latin_america", CL:"latin_america", EC:"latin_america",
  BO:"latin_america", PY:"latin_america", UY:"latin_america", GT:"latin_america",
  CU:"latin_america", DO:"latin_america", HT:"latin_america", HN:"latin_america",
  NI:"latin_america", CR:"latin_america", PA:"latin_america", SV:"latin_america",
  BZ:"latin_america", JM:"latin_america", TT:"latin_america", BS:"latin_america",
  BB:"latin_america", SR:"latin_america", GY:"latin_america", PR:"latin_america",
  // eastern_europe
  RU:"eastern_europe", UA:"eastern_europe", BY:"eastern_europe", PL:"eastern_europe",
  RO:"eastern_europe", BG:"eastern_europe", CZ:"eastern_europe", SK:"eastern_europe",
  HU:"eastern_europe", HR:"eastern_europe", SI:"eastern_europe", RS:"eastern_europe",
  BA:"eastern_europe", ME:"eastern_europe", MK:"eastern_europe", AL:"eastern_europe",
  MD:"eastern_europe", EE:"eastern_europe", LT:"eastern_europe", LV:"eastern_europe",
  GR:"eastern_europe", KZ:"eastern_europe", UZ:"eastern_europe", TJ:"eastern_europe",
  TM:"eastern_europe", KG:"eastern_europe",
  // polar
  GL:"polar", AQ:"polar",
};

function getConstructionProfile(iso) {
  const key = COUNTRY_PROFILE_MAP[iso];
  return key ? REGIONAL_CONSTRUCTION[key] : null;
}

// ─── LOCAL CURRENCY DISPLAY ─────────────────────────────────────────────────
// Approximate USD → local currency rates (2025 averages). Not intended for
// financial precision — used solely to give users an intuitive damage number
// in the currency they think about. Damages internally remain USD.
// Source: mid-2025 average rates from ECB/IMF; rounded for stability.
const CURRENCY_RATES = {
  USD: {code:"USD", sym:"$",   rate:1,      name:"US Dollar"},
  EUR: {code:"EUR", sym:"€",   rate:0.92,   name:"Euro"},
  GBP: {code:"GBP", sym:"£",   rate:0.79,   name:"British Pound"},
  JPY: {code:"JPY", sym:"¥",   rate:150,    name:"Japanese Yen"},
  CNY: {code:"CNY", sym:"¥",   rate:7.2,    name:"Chinese Yuan"},
  INR: {code:"INR", sym:"₹",   rate:83,     name:"Indian Rupee"},
  BDT: {code:"BDT", sym:"৳",   rate:118,    name:"Bangladeshi Taka"},
  IDR: {code:"IDR", sym:"Rp",  rate:15800,  name:"Indonesian Rupiah"},
  PHP: {code:"PHP", sym:"₱",   rate:57,     name:"Philippine Peso"},
  PKR: {code:"PKR", sym:"₨",   rate:280,    name:"Pakistani Rupee"},
  KRW: {code:"KRW", sym:"₩",   rate:1350,   name:"South Korean Won"},
  THB: {code:"THB", sym:"฿",   rate:36,     name:"Thai Baht"},
  VND: {code:"VND", sym:"₫",   rate:25000,  name:"Vietnamese Dong"},
  MYR: {code:"MYR", sym:"RM",  rate:4.7,    name:"Malaysian Ringgit"},
  SGD: {code:"SGD", sym:"S$",  rate:1.35,   name:"Singapore Dollar"},
  HKD: {code:"HKD", sym:"HK$", rate:7.8,    name:"Hong Kong Dollar"},
  TWD: {code:"TWD", sym:"NT$", rate:32,     name:"Taiwan Dollar"},
  AUD: {code:"AUD", sym:"A$",  rate:1.52,   name:"Australian Dollar"},
  NZD: {code:"NZD", sym:"NZ$", rate:1.65,   name:"NZ Dollar"},
  CAD: {code:"CAD", sym:"C$",  rate:1.36,   name:"Canadian Dollar"},
  MXN: {code:"MXN", sym:"$",   rate:18,     name:"Mexican Peso"},
  BRL: {code:"BRL", sym:"R$",  rate:5.1,    name:"Brazilian Real"},
  ARS: {code:"ARS", sym:"$",   rate:950,    name:"Argentine Peso"},
  CLP: {code:"CLP", sym:"$",   rate:930,    name:"Chilean Peso"},
  COP: {code:"COP", sym:"$",   rate:3900,   name:"Colombian Peso"},
  PEN: {code:"PEN", sym:"S/",  rate:3.75,   name:"Peruvian Sol"},
  VES: {code:"VES", sym:"Bs",  rate:37,     name:"Venezuelan Bolívar"},
  CHF: {code:"CHF", sym:"CHF", rate:0.87,   name:"Swiss Franc"},
  SEK: {code:"SEK", sym:"kr",  rate:10.5,   name:"Swedish Krona"},
  NOK: {code:"NOK", sym:"kr",  rate:10.7,   name:"Norwegian Krone"},
  DKK: {code:"DKK", sym:"kr",  rate:6.9,    name:"Danish Krone"},
  PLN: {code:"PLN", sym:"zł",  rate:4.0,    name:"Polish Zloty"},
  CZK: {code:"CZK", sym:"Kč",  rate:23,     name:"Czech Koruna"},
  HUF: {code:"HUF", sym:"Ft",  rate:355,    name:"Hungarian Forint"},
  RON: {code:"RON", sym:"lei", rate:4.6,    name:"Romanian Leu"},
  RUB: {code:"RUB", sym:"₽",   rate:92,     name:"Russian Ruble"},
  UAH: {code:"UAH", sym:"₴",   rate:40,     name:"Ukrainian Hryvnia"},
  TRY: {code:"TRY", sym:"₺",   rate:33,     name:"Turkish Lira"},
  ILS: {code:"ILS", sym:"₪",   rate:3.7,    name:"Israeli Shekel"},
  AED: {code:"AED", sym:"د.إ", rate:3.67,   name:"UAE Dirham"},
  SAR: {code:"SAR", sym:"﷼",   rate:3.75,   name:"Saudi Riyal"},
  QAR: {code:"QAR", sym:"﷼",   rate:3.64,   name:"Qatari Riyal"},
  EGP: {code:"EGP", sym:"E£",  rate:49,     name:"Egyptian Pound"},
  ZAR: {code:"ZAR", sym:"R",   rate:18,     name:"South African Rand"},
  NGN: {code:"NGN", sym:"₦",   rate:1550,   name:"Nigerian Naira"},
  KES: {code:"KES", sym:"KSh", rate:129,    name:"Kenyan Shilling"},
  MAD: {code:"MAD", sym:"د.م.",rate:9.9,    name:"Moroccan Dirham"},
  IRR: {code:"IRR", sym:"﷼",   rate:42000,  name:"Iranian Rial"},
  IQD: {code:"IQD", sym:"ع.د", rate:1310,   name:"Iraqi Dinar"},
  // African CFA francs (pegged to EUR at 655.957)
  XOF: {code:"XOF", sym:"CFA", rate:600,    name:"West African CFA Franc"},
  XAF: {code:"XAF", sym:"FCFA",rate:600,    name:"Central African CFA Franc"},
  ETB: {code:"ETB", sym:"Br",  rate:120,    name:"Ethiopian Birr"},
  GHS: {code:"GHS", sym:"₵",   rate:15.5,   name:"Ghanaian Cedi"},
  UGX: {code:"UGX", sym:"USh", rate:3700,   name:"Ugandan Shilling"},
  TZS: {code:"TZS", sym:"TSh", rate:2650,   name:"Tanzanian Shilling"},
  DZD: {code:"DZD", sym:"د.ج", rate:135,    name:"Algerian Dinar"},
  TND: {code:"TND", sym:"د.ت", rate:3.1,    name:"Tunisian Dinar"},
  LYD: {code:"LYD", sym:"ل.د", rate:4.85,   name:"Libyan Dinar"},
};

// Map country ISO → currency code. For Eurozone/etc, one currency maps to many.
const COUNTRY_CURRENCY = {
  US:"USD", CA:"CAD", MX:"MXN",
  // Eurozone
  FR:"EUR", DE:"EUR", IT:"EUR", ES:"EUR", NL:"EUR", BE:"EUR", AT:"EUR", IE:"EUR",
  PT:"EUR", FI:"EUR", GR:"EUR", LU:"EUR", MT:"EUR", CY:"EUR", SK:"EUR", SI:"EUR",
  EE:"EUR", LV:"EUR", LT:"EUR", HR:"EUR", MC:"EUR", AD:"EUR",
  // UK + Nordics
  GB:"GBP", CH:"CHF", SE:"SEK", NO:"NOK", DK:"DKK", IS:"DKK",
  // Central/E Europe
  PL:"PLN", CZ:"CZK", HU:"HUF", RO:"RON", BG:"EUR", RS:"EUR", BA:"EUR", AL:"EUR",
  MK:"EUR", MD:"EUR",
  RU:"RUB", UA:"UAH", BY:"RUB", KZ:"RUB",
  // Asia
  JP:"JPY", CN:"CNY", KR:"KRW", TW:"TWD", HK:"HKD", SG:"SGD", MY:"MYR", TH:"THB",
  VN:"VND", ID:"IDR", PH:"PHP", IN:"INR", PK:"PKR", BD:"BDT", NP:"INR", BT:"INR",
  LK:"INR", MM:"THB", KH:"THB", LA:"THB", MN:"CNY", AF:"USD",
  // Middle East
  TR:"TRY", IL:"ILS", AE:"AED", SA:"SAR", QA:"QAR", KW:"USD", BH:"USD", OM:"USD",
  JO:"USD", LB:"USD", SY:"USD", IR:"IRR", IQ:"IQD", YE:"USD", AZ:"USD", AM:"USD",
  GE:"USD",
  // Africa
  EG:"EGP", ZA:"ZAR", NG:"NGN", KE:"KES", MA:"MAD", DZ:"DZD", TN:"TND", LY:"LYD",
  ET:"ETB", GH:"GHS", TZ:"TZS", UG:"UGX", MZ:"ZAR", AO:"USD", ZM:"USD", ZW:"ZAR",
  // West African CFA (XOF): Benin, Burkina Faso, Ivory Coast, Guinea-Bissau, Mali, Niger, Senegal, Togo
  BJ:"XOF", BF:"XOF", CI:"XOF", GW:"XOF", ML:"XOF", NE:"XOF", SN:"XOF", TG:"XOF",
  // Central African CFA (XAF): Cameroon, CAR, Chad, Congo (Brazzaville), Equatorial Guinea, Gabon
  CM:"XAF", CF:"XAF", TD:"XAF", CG:"XAF", GQ:"XAF", GA:"XAF",
  MG:"USD", SD:"EGP", SS:"USD", SO:"USD", SL:"USD", LR:"USD", RW:"USD", BI:"USD",
  BW:"ZAR", NA:"ZAR", MW:"USD", LS:"ZAR", SZ:"ZAR", DJ:"USD", ER:"USD", CD:"USD",
  GN:"USD", GM:"USD", KM:"USD", MU:"USD", MR:"USD", CV:"USD",
  // Americas
  BR:"BRL", AR:"ARS", CL:"CLP", CO:"COP", PE:"PEN", VE:"VES", BO:"USD", PY:"USD",
  UY:"USD", EC:"USD", GY:"USD", SR:"USD",
  GT:"USD", HN:"USD", NI:"USD", SV:"USD", CR:"USD", PA:"USD", BZ:"USD",
  CU:"USD", DO:"USD", HT:"USD", JM:"USD", BS:"USD", BB:"USD", TT:"USD", PR:"USD",
  // Oceania
  AU:"AUD", NZ:"NZD", FJ:"AUD", PG:"AUD", VU:"AUD", KI:"AUD",
  // Polar
  GL:"DKK", AQ:"USD",
};

// Convert USD damage → local currency + format nicely
function formatLocalCurrency(usdAmount, iso) {
  if (!iso || iso === "US") return null;
  const currCode = COUNTRY_CURRENCY[iso];
  if (!currCode || currCode === "USD") return null;
  const curr = CURRENCY_RATES[currCode];
  if (!curr) return null;
  const local = usdAmount * curr.rate;
  let display;
  if (local >= 1e12)      display = (local/1e12).toFixed(1) + "T";
  else if (local >= 1e9)  display = (local/1e9).toFixed(1) + "B";
  else if (local >= 1e6)  display = (local/1e6).toFixed(1) + "M";
  else if (local >= 1e3)  display = (local/1e3).toFixed(1) + "K";
  else                    display = Math.round(local).toString();
  return {
    text: `${curr.sym}${display}`,
    code: curr.code,
    name: curr.name,
  };
}

// Find which country a point falls within (fast bounding box check)
// Returns the country object or null (ocean/unknown)
// Uses centroid-distance tiebreaker when multiple bboxes contain the point
// (fixes cases like Delhi where India + Pakistan bboxes both overlap)
const findWorldCountry = (lat, lng) => {
  // Normalize longitude to [-180, 180]
  let nlng = lng;
  while (nlng > 180) nlng -= 360;
  while (nlng < -180) nlng += 360;

  // Collect all candidates whose bbox contains the point
  const candidates = [];
  for (const c of WORLD_COUNTRIES) {
    const [minLat, minLng, maxLat, maxLng] = c.bbox;
    if (lat >= minLat && lat <= maxLat) {
      // Handle Russia's wrap-around case (bbox crosses 180)
      const inLng = minLng <= maxLng
        ? (nlng >= minLng && nlng <= maxLng)
        : (nlng >= minLng || nlng <= maxLng);
      if (inLng) candidates.push(c);
    }
  }
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Multiple candidates — sort by bbox area ascending, prefer smaller candidates
  // when the point sits meaningfully inside them (border cities and enclaves).
  // Falls back to largest candidate for points at all bboxes' edges.
  // The tunable MIN_DEPTH threshold prevents picking a tiny neighbor whose
  // bbox barely clips the point.
  const MIN_DEPTH = 0.15; // must be at least 15% into bbox to pick smaller
  const scored = candidates.map(c => {
    const [minLat, minLng, maxLat, maxLng] = c.bbox;
    const depth = Math.min(
      lat - minLat, maxLat - lat,
      nlng - minLng, maxLng - nlng
    );
    const w = maxLat - minLat;
    const h = maxLng - minLng;
    const size = Math.min(w, h);
    const area = w * h;
    const normDepth = size > 0 ? depth / size : 0;
    return { c, area, normDepth };
  });
  // Try smallest bbox first — if point is well inside (normDepth >= threshold),
  // pick it. Otherwise walk up to next larger candidate.
  scored.sort((a, b) => a.area - b.area);
  for (const s of scored) {
    if (s.normDepth >= MIN_DEPTH) return s.c;
  }
  // No candidate meets the threshold — return the one with highest normDepth
  // regardless of size (best-fit fallback).
  scored.sort((a, b) => b.normDepth - a.normDepth);
  return scored[0].c;
};

// ─── SIMULATION ENGINE ──────────────────────────────────────────────────────

// Look up population data for a point: returns { popDensity, housingDensity }
// For Canada, uses embedded census data. For US, checks the county cache.
// The county cache is populated asynchronously by fetchCountiesAlongPath.
function lookupLocalDensity(lat, lng, usCountyCache) {
  // Check if in Canada (rough boundary)
  const inCanada = (lat >= 49 && lng >= -141 && lng <= -52) ||
    (lat >= 41 && lat < 49 && lng >= -95 && lng <= -52 && lat > 42); // southern ON/QC/Maritimes

  if (inCanada) {
    const { cd, dist } = findCanadianCensusDivision(lat, lng);
    if (cd && dist < 5) {
      return {
        popDensity: Math.round(cd.d),
        housingDensity: Math.round(cd.h),
        name: cd.n,
        country: "canada",
      };
    }
    return { popDensity: 0, housingDensity: 0, name: "Uninhabited", country: "canada" };
  }

  // For US points, check the county cache
  if (usCountyCache) {
    // Find the nearest cached county (within ~0.5 degrees)
    let nearest = null;
    let minDist = Infinity;
    for (const entry of usCountyCache) {
      const d = Math.abs(entry.lat - lat) + Math.abs(entry.lng - lng);
      if (d < minDist) { minDist = d; nearest = entry; }
    }
    if (nearest && minDist < 0.7) {
      return {
        popDensity: nearest.popDensity,
        housingDensity: nearest.housingDensity,
        name: nearest.name,
        country: "us",
      };
    }
  }

  // Fall back to world country data (averaged national density)
  const worldCountry = findWorldCountry(lat, lng);
  if (worldCountry) {
    // Estimate housing density as ~40% of population density (typical avg)
    return {
      popDensity: Math.round(worldCountry.d),
      housingDensity: Math.round(worldCountry.d * 0.4),
      name: worldCountry.n,
      country: "world",
      iso: worldCountry.iso,
      countryPop: worldCountry.pop,
      countryArea: worldCountry.a,
    };
  }

  // Ocean / uninhabited — return null to use params-based defaults
  return null;
}

// Run simulation for a single segment of the path
// timeOffsetHours: how many hours into the tornado's journey this segment occurs
function runSegmentSimulation(params, segmentLengthMi, localDensity, timeOffsetHours) {
  const p = { ...params, pathLength: segmentLengthMi };

  // Advance time of day based on how far along the path this segment is
  if (timeOffsetHours && typeof params.timeOfDay === "number") {
    p.timeOfDay = (params.timeOfDay + timeOffsetHours) % 24;
  }

  // Override with local density if available
  if (localDensity) {
    p.popDensity = localDensity.popDensity;
    p.housingDensity = localDensity.housingDensity;
    // Scale infrastructure proportionally to local density
    const isRemote = localDensity.popDensity < 5;
    p.powerLinesPerMile = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 80), 30);
    p.cellTowers = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 40), 80);
    p.bridges = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 150), 20);
    p.waterTowers = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 400), 10);
    p.gasLinesPerMile = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 150), 20);
    p.vehiclesPerMile = isRemote ? 0 : Math.min(Math.round(localDensity.popDensity / 8), 300);
    p.livestockDensity = localDensity.popDensity < 100 ? Math.min(Math.round((100 - localDensity.popDensity) / 3), 50) : 0;
  }

  return runSimulation(p);
}

// Multi-segment simulation: splits path into segments, looks up local density for each
// Always generates segments for any path > 2 miles, regardless of mode
function runMultiSegmentSimulation(params, pathPoints, pathMode, usCountyCache, useLocationData = true) {
  if (!pathPoints || pathPoints.length < 2) {
    return { result: runSimulation(params), segments: null };
  }

  // For straight mode with only 2 points, interpolate intermediate points
  let samplingPoints = pathPoints;
  if (pathPoints.length === 2) {
    // Interpolate to create ~1 sample per 3 miles (or at least 3 samples)
    const totalDist = pathLengthFromPoints(pathPoints);
    const numSamples = Math.max(3, Math.min(15, Math.ceil(totalDist / 3)));
    samplingPoints = [];
    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      samplingPoints.push([
        pathPoints[0][0] + t * (pathPoints[1][0] - pathPoints[0][0]),
        pathPoints[0][1] + t * (pathPoints[1][1] - pathPoints[0][1]),
      ]);
    }
  }

  // Calculate segments between consecutive points
  const segments = [];
  let totalLength = 0;
  for (let i = 1; i < samplingPoints.length; i++) {
    const segLen = pathLengthFromPoints([samplingPoints[i - 1], samplingPoints[i]]);
    segments.push({
      start: samplingPoints[i - 1],
      end: samplingPoints[i],
      length: segLen,
      midLat: (samplingPoints[i - 1][0] + samplingPoints[i][0]) / 2,
      midLng: (samplingPoints[i - 1][1] + samplingPoints[i][1]) / 2,
    });
    totalLength += segLen;
  }

  // Limit to 15 sample segments for performance
  const MAX_SEGMENTS = 15;
  let sampleSegments = segments;
  if (segments.length > MAX_SEGMENTS) {
    const groupSize = Math.ceil(segments.length / MAX_SEGMENTS);
    sampleSegments = [];
    for (let i = 0; i < segments.length; i += groupSize) {
      const group = segments.slice(i, i + groupSize);
      const totalLen = group.reduce((s, g) => s + g.length, 0);
      const midIdx = Math.floor(group.length / 2);
      sampleSegments.push({
        ...group[midIdx],
        length: totalLen,
      });
    }
  }

  // Run simulation for each segment with local density
  const segmentResults = [];
  const countyNames = [];
  const seenNames = new Set();
  let totalFatalities = 0, totalInjuries = 0, totalEconomic = 0;
  let totalDestroyed = 0, totalDamaged = 0, totalPopInPath = 0;
  let totalStructures = 0;
  let distanceSoFar = 0;

  for (const seg of sampleSegments) {
    const localDensity = useLocationData ? lookupLocalDensity(seg.midLat, seg.midLng, usCountyCache) : null;
    // Calculate time offset: how many hours into the journey this segment's midpoint is
    const midDistance = distanceSoFar + seg.length / 2;
    const timeOffsetHours = params.forwardSpeed > 0 ? midDistance / params.forwardSpeed : 0;
    const segResult = runSegmentSimulation(params, seg.length, localDensity, timeOffsetHours);

    segmentResults.push({
      ...seg,
      result: segResult,
      localDensity,
      timeOffsetHours,
    });

    const regionName = localDensity?.name || (useLocationData ? "Location not resolved" : "Scenario inputs");
    if (!seenNames.has(regionName)) {
      seenNames.add(regionName);
      countyNames.push(regionName);
    }
    totalFatalities += segResult.fatalities;
    totalInjuries += segResult.injuries;
    totalEconomic += segResult.totalEconomicImpact;
    totalDestroyed += segResult.totalDestroyed;
    totalDamaged += segResult.totalDamaged;
    totalPopInPath += segResult.populationInPath;
    totalStructures += segResult.totalStructures;
    distanceSoFar += seg.length;
  }

  // Use the base result for EF rating and non-summable properties
  const baseResult = runSimulation(params);

  const multiResult = {
    ...baseResult,
    fatalities: totalFatalities,
    injuries: totalInjuries,
    totalEconomicImpact: totalEconomic,
    totalDestroyed,
    totalDamaged,
    totalStructures,
    populationInPath: totalPopInPath,
    residentialLoss: segmentResults.reduce((s, sr) => s + sr.result.residentialLoss, 0),
    infraLoss: segmentResults.reduce((s, sr) => s + sr.result.infraLoss, 0),
    vehicleLoss: segmentResults.reduce((s, sr) => s + sr.result.vehicleLoss, 0),
    cropLoss: segmentResults.reduce((s, sr) => s + sr.result.cropLoss, 0),
    livestockLoss: segmentResults.reduce((s, sr) => s + sr.result.livestockLoss, 0),
    emergencyResponseCost: segmentResults.reduce((s, sr) => s + sr.result.emergencyResponseCost, 0),
    businessInterruption: segmentResults.reduce((s, sr) => s + sr.result.businessInterruption, 0),
    floodDamage: segmentResults.reduce((s, sr) => s + sr.result.floodDamage, 0),
    _multiSegment: true,
    _usesLocationData: useLocationData,
    _routeMiles: distanceSoFar,
    _segmentCount: sampleSegments.length,
    _countiesCrossed: countyNames,
    _segments: segmentResults,
  };

  for (const key of ['powerLinesDestroyed', 'cellTowersDestroyed', 'bridgesDestroyed', 'waterTowersDestroyed', 'gasLinesDestroyed', 'vehiclesDestroyed', 'cropAcres', 'livestockLost']) {
    multiResult[key] = segmentResults.reduce((sum, segment) => sum + segment.result[key], 0);
  }
  multiResult.pathAreaSqMi = (distanceSoFar * params.pathWidth / 1760).toFixed(2);
  multiResult.structureDamage = Object.fromEntries(Object.keys(baseResult.structureDamage).map(type => [type,
    Object.fromEntries(['total', 'destroyed', 'damaged'].map(key => [key,
      segmentResults.reduce((sum, segment) => sum + segment.result.structureDamage[type][key], 0)
    ]))
  ]));
  return { result: multiResult, segments: segmentResults };
}

function runSimulation(params) {
  const {
    windSpeed, pressureDeficit, pathLength, pathWidth, forwardSpeed,
    direction, rainfall, hailSize, subVortices, lifespan,
    terrain, timeOfDay, season,
    housingDensity, mobileHomePct, woodFramePct, brickPct, concretePct,
    powerLinesPerMile, cellTowers, bridges, waterTowers, gasLinesPerMile,
    vehiclesPerMile,
    cropType, growthStage, cropAcresPct,
    popDensity, basementPct, shelterPct, warningLeadTime, preparedness,
    livestockDensity,
  } = params;

  const ef = getEFRating(windSpeed);
  const efIndex = EF_SCALE.indexOf(ef);
  const efKey = `ef${efIndex}`;

  // Effective wind with terrain modifier
  const terrainMod = TERRAIN_WIND_MODIFIER[terrain];
  const effectiveWind = windSpeed * terrainMod;

  // Path area in sq miles
  const pathWidthMiles = pathWidth / 1760;
  const pathAreaSqMi = pathLength * pathWidthMiles;

  // Multi-vortex intensity boost (each sub-vortex adds localized peaks)
  const vortexBoost = 1 + (subVortices - 1) * 0.05;
  const peakWind = Math.min(effectiveWind * vortexBoost, 320);

  // Duration of exposure at any point (minutes)
  const exposureDuration = forwardSpeed > 0 ? (pathWidthMiles * 60) / forwardSpeed : lifespan;

  // ─── STRUCTURAL DAMAGE ──────────────────────────────
  const totalStructures = housingDensity * pathAreaSqMi;
  const structureBreakdown = {
    mobile_home: totalStructures * (mobileHomePct / 100),
    wood_frame: totalStructures * (woodFramePct / 100),
    brick_masonry: totalStructures * (brickPct / 100),
    reinforced_conc: totalStructures * (concretePct / 100),
  };

  let totalDestroyed = 0;
  let totalDamaged = 0;
  let residentialLoss = 0;

  const structureDamage = {};
  for (const [type, count] of Object.entries(structureBreakdown)) {
    const destroyProb = interpolateFragility(type, peakWind);
    // Wind field decay: center has peak, edges have ~40% of peak
    // Average destruction across path width ≈ 60% of center probability
    const avgDestroyProb = destroyProb * 0.6;
    const damageProb = Math.min(avgDestroyProb * 2.5, 1.0);

    const destroyed = Math.round(count * avgDestroyProb);
    const damaged = Math.round(count * damageProb) - destroyed;

    structureDamage[type] = { total: Math.round(count), destroyed, damaged };
    totalDestroyed += destroyed;
    totalDamaged += damaged;
    residentialLoss += destroyed * STRUCTURE_FRAGILITY[type].value +
                       damaged * STRUCTURE_FRAGILITY[type].value * 0.35;
  }

  // ─── INFRASTRUCTURE DAMAGE ──────────────────────────
  const infraDestroyRate = interpolateFragility("wood_frame", peakWind) * 0.7;
  const powerLinesDestroyed = pathLength * powerLinesPerMile * infraDestroyRate;
  const cellTowersInPath = Math.ceil(cellTowers * (pathAreaSqMi / 50));
  const cellTowersDestroyed = Math.round(cellTowersInPath * infraDestroyRate);
  const bridgesInPath = Math.ceil(bridges * (pathLength / 30));
  const bridgesDestroyed = Math.round(bridgesInPath * interpolateFragility("reinforced_conc", peakWind) * 0.5);
  const waterTowersInPath = Math.ceil(waterTowers * (pathAreaSqMi / 100));
  const waterTowersDestroyed = Math.round(waterTowersInPath * infraDestroyRate * 0.8);
  const gasLinesDestroyed = pathLength * gasLinesPerMile * infraDestroyRate * 0.5;

  const infraLoss =
    powerLinesDestroyed * INFRA_COSTS.power_lines +
    cellTowersDestroyed * INFRA_COSTS.cell_towers +
    bridgesDestroyed * INFRA_COSTS.bridges +
    waterTowersDestroyed * INFRA_COSTS.water_towers +
    gasLinesDestroyed * INFRA_COSTS.gas_lines;

  // ─── VEHICLE DAMAGE ─────────────────────────────────
  const vehiclesInPath = vehiclesPerMile * pathLength * (pathWidthMiles / 0.1);
  const vehiclesDestroyed = Math.round(vehiclesInPath * interpolateFragility("mobile_home", peakWind) * 0.4);
  const vehicleLoss = vehiclesDestroyed * 25000;

  // ─── CROP & LIVESTOCK DAMAGE ────────────────────────
  const cropInfo = CROP_LOSS_PER_ACRE[cropType];
  const cropAcres = pathAreaSqMi * 640 * (cropAcresPct / 100);
  const windCropDamage = Math.min(peakWind / 200, 1.0) * cropInfo.susceptibility;
  const hailCropDamage = Math.min(hailSize / 4, 1.0) * 0.5;
  const totalCropDamagePct = Math.min(windCropDamage + hailCropDamage, 1.0);
  const cropLoss = cropAcres * cropInfo.value * totalCropDamagePct * GROWTH_STAGE_MULT[growthStage];

  const livestockInPath = livestockDensity * pathAreaSqMi;
  const livestockFatality = Math.min(peakWind / 300, 0.8) * 0.3;
  const livestockLost = Math.round(livestockInPath * livestockFatality);
  const livestockLoss = livestockLost * 1500;

  // ─── CASUALTIES ─────────────────────────────────────
  const populationInPath = popDensity * pathAreaSqMi;

  // Warning effectiveness: each minute of lead time reduces casualties
  // Simmons & Sutter: ~1.8% reduction per minute of lead time
  const warningReduction = Math.max(0, 1 - warningLeadTime * 0.018);

  // Night multiplier: Ashley (2007) — nighttime tornadoes 2.5x more lethal
  // Smooth curve based on hour of day (0-23):
  // Peak lethality 0:00-5:00 (2.5x), lowest 10:00-16:00 (1.0x), transitions at dusk/dawn
  const hour = typeof timeOfDay === "number" ? timeOfDay :
    (timeOfDay === "night" ? 2 : timeOfDay === "evening" ? 20 : timeOfDay === "morning" ? 8 : 14);
  const getNightMult = (h) => {
    // 0-5: deep night 2.5x, 5-8: dawn transition, 8-17: day 1.0x, 17-20: dusk transition, 20-24: night
    if (h >= 0 && h < 5) return 2.5;
    if (h >= 5 && h < 8) return 2.5 - 1.5 * ((h - 5) / 3); // 2.5 → 1.0
    if (h >= 8 && h < 17) return 1.0;
    if (h >= 17 && h < 20) return 1.0 + 1.5 * ((h - 17) / 3); // 1.0 → 2.5
    return 2.5; // 20-24
  };
  const nightMult = getNightMult(hour);

  // Preparedness reduces casualties (siren coverage, education, apps)
  const preparednessMult = 1 - preparedness * 0.4;

  // Shelter distribution
  const noShelterPct = mobileHomePct / 100;
  const inBasement = basementPct / 100;
  const inShelter = shelterPct / 100;
  const inInterior = Math.max(0, 1 - noShelterPct - inBasement - inShelter);

  const baseFatalityRate =
    noShelterPct * (FATALITY_RATES.no_shelter[efKey] || 0) +
    inInterior * (FATALITY_RATES.interior_room[efKey] || 0) +
    inBasement * (FATALITY_RATES.basement[efKey] || 0) +
    inShelter * (FATALITY_RATES.storm_shelter[efKey] || 0);

  const adjustedFatalityRate = baseFatalityRate * warningReduction * nightMult * preparednessMult;
  const fatalities = Math.round(populationInPath * adjustedFatalityRate);
  const injuries = Math.round(fatalities * 15); // ~15:1 injury to fatality ratio

  // Rainfall flooding additional damage
  const floodDamage = rainfall > 3 ? residentialLoss * 0.05 * (rainfall / 3) : 0;

  // ─── TOTAL ECONOMIC IMPACT ──────────────────────────
  const directDamage = residentialLoss + infraLoss + vehicleLoss + cropLoss + livestockLoss + floodDamage;
  const emergencyResponseCost = fatalities * 50000 + injuries * 8000 + totalDestroyed * 2000;
  const businessInterruption = directDamage * 0.15;
  const totalEconomicImpact = directDamage + emergencyResponseCost + businessInterruption;

  return {
    ef, efIndex, effectiveWind: Math.round(effectiveWind), peakWind: Math.round(peakWind),
    pathAreaSqMi: pathAreaSqMi.toFixed(2),
    exposureDuration: exposureDuration.toFixed(1),
    structureDamage, totalDestroyed, totalDamaged, totalStructures: Object.values(structureDamage).reduce((sum, item) => sum + item.total, 0),
    infraLoss, powerLinesDestroyed: Math.round(powerLinesDestroyed),
    cellTowersDestroyed, bridgesDestroyed, waterTowersDestroyed,
    gasLinesDestroyed: Math.round(gasLinesDestroyed),
    vehiclesDestroyed, vehicleLoss,
    cropAcres: Math.round(cropAcres), cropLoss, livestockLost, livestockLoss,
    populationInPath: Math.round(populationInPath),
    fatalities, injuries,
    residentialLoss, floodDamage, emergencyResponseCost, businessInterruption,
    totalEconomicImpact,
    warningReduction, nightMult, preparednessMult,
  };
}

// ─── HISTORICAL COMPARISONS ─────────────────────────────────────────────────

const HISTORICAL = [
  { name: "Joplin, MO 2011", ef: 5, fatalities: 158, injuries: 1150, damage: 2.8e9, pathLength: 22.1, pathWidth: 1760 },
  { name: "Moore, OK 2013", ef: 5, fatalities: 24, injuries: 377, damage: 2.0e9, pathLength: 17, pathWidth: 1900 },
  { name: "Tuscaloosa, AL 2011", ef: 4, fatalities: 64, injuries: 1500, damage: 2.4e9, pathLength: 80.7, pathWidth: 2640 },
  { name: "Greensburg, KS 2007", ef: 5, fatalities: 11, injuries: 63, damage: 250e6, pathLength: 22, pathWidth: 2816 },
  { name: "El Reno, OK 2013", ef: 3, fatalities: 8, injuries: 151, damage: 40e6, pathLength: 16.2, pathWidth: 4505 },
  { name: "Tri-State 1925", ef: 5, fatalities: 695, injuries: 2027, damage: 1.4e9, pathLength: 219, pathWidth: 1760 },
];

// ─── FORMATTING ─────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
};

const numFmt = (n) => Math.round(n).toLocaleString();

// ─── SLIDER COMPONENT ───────────────────────────────────────────────────────


export {
  EF_SCALE,
  getEFRating,
  STRUCTURE_FRAGILITY,
  interpolateFragility,
  FATALITY_RATES,
  CROP_LOSS_PER_ACRE,
  GROWTH_STAGE_MULT,
  TERRAIN_WIND_MODIFIER,
  INFRA_COSTS,
  CITIES,
  TORNADO_ALLEY,
  CANADA_TORNADO_ZONE,
  CANADA_CENSUS_DIVISIONS,
  findCanadianCensusDivision,
  WORLD_COUNTRIES,
  WORLD_CITIES,
  REGIONAL_CONSTRUCTION,
  COUNTRY_PROFILE_MAP,
  getConstructionProfile,
  CURRENCY_RATES,
  COUNTRY_CURRENCY,
  formatLocalCurrency,
  findWorldCountry,
  lookupLocalDensity,
  runSegmentSimulation,
  runMultiSegmentSimulation,
  runSimulation,
  HISTORICAL,
  fmt,
  numFmt
};
import { pathLengthFromPoints } from './geometry.js';


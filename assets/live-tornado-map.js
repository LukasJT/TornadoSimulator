import {connectRadar} from './live-radar.js';

const get = id => document.getElementById(id);
const warningUrls = {
  us: 'https://api.weather.gov/alerts/active?event=Tornado%20Warning',
  ca: 'https://api.weather.gc.ca/collections/weather-alerts/items?' + new URLSearchParams({
    f:'json',limit:500,filter:"properties.alert_type=warning AND properties.alert_name_en LIKE '%tornado%'"
  })
};
const outlookUrls = {
  day1: 'https://www.spc.noaa.gov/products/outlook/day1otlk_torn.nolyr.geojson',
  day2: 'https://www.spc.noaa.gov/products/outlook/day2otlk_torn.nolyr.geojson'
};
const weatherBase = 'https://www.weather.gov/';
const utc = new Intl.DateTimeFormat('en-CA',{hour:'2-digit',minute:'2-digit',timeZone:'UTC',hourCycle:'h23'});
const local = new Intl.DateTimeFormat('en-CA',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
const safe = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const time = value => Number.isFinite(Date.parse(value)) ? local.format(Date.parse(value)) : 'Time unavailable';
const leaflet = window.L;

async function feed(url) {
  const response = await fetch(url,{headers:{Accept:'application/geo+json, application/json'}, signal:AbortSignal.timeout(12_000)});
  if (!response.ok) throw new Error('Feed unavailable');
  const data = await response.json();
  if (!Array.isArray(data.features)) throw new Error('Invalid features');
  return data.features;
}

function normalize(feature, country) {
  const props = feature.properties ?? {};
  const canada = country === 'ca';
  if (canada && (props.alert_type !== 'warning' ||
      !/tornado/i.test(`${props.alert_name_en} ${props.alert_short_name_en}`))) return null;
  if (!canada && (props.event !== 'Tornado Warning' || props.status !== 'Actual' || props.messageType === 'Cancel')) return null;
  return {
    feature, country,
    title: (canada ? props.alert_name_en : props.headline) || 'Tornado warning',
    area: (canada ? props.feature_name_en : props.areaDesc) || 'Area details unavailable',
    issued: canada ? props.publication_datetime : props.sent,
    expires: canada ? props.expiration_datetime : (props.ends || props.expires),
    ended: canada && /ended|expired|cancel/i.test(props.status_en || ''),
    details: canada ? 'https://weather.gc.ca/warnings/index_e.html' : weatherBase
  };
}

function setup() {
  const map = leaflet.map('live-map',{minZoom:3,maxZoom:15,worldCopyJump:true,zoomControl:false}).setView([42,-97],4);
  leaflet.control.zoom({position:'topright'}).addTo(map);
  leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom:15, subdomains:'abcd',
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  const radar = connectRadar(map,leaflet);
  const monitor = get('live-monitor');
  const activeList = get('active-warnings');
  const feedLabel = get('update-label');
  const mapStatus = get('map-status');
  const historyList = get('warning-list');
  const filter = get('country-filter');
  const layers = new Map();
  const statuses = {};
  const history = {us:[],ca:[]};
  const active = {us:[],ca:[]};
  const region = {
    continent: [[42,-97],4], lakes:[[43,-83],6], ontario:[[44.25,-80.25],7],
    plains:[[37.7,-98],6], southeast:[[33,-85],6], northeast:[[42,-75],6]
  };
  let activeRows = [];
  let current = 'live';
  let warningLayer;
  let refreshing = false;

  const regionSelect = get('monitor-region');
  const initialRegion = new URLSearchParams(location.search).get('region');
  if (Object.hasOwn(region,initialRegion)) {
    regionSelect.value = initialRegion;
    map.setView(...region[initialRegion],{animate:false});
  }
  regionSelect.addEventListener('change', event => {
    const selected = event.target.value;
    if (!Object.hasOwn(region,selected)) return;
    map.setView(...region[selected],{animate:false});
    const link = new URL(location.href);
    if (selected === 'continent') link.searchParams.delete('region');
    else link.searchParams.set('region',selected);
    window.history.replaceState(null,'',link);
  });
  function clearLayer(name) { layers.get(name)?.remove(); }
  function show(name) {
    current = name;
    for (const [key, layer] of layers) {
      if (key === name) layer.addTo(map);
      else layer.remove();
    }
    document.querySelectorAll('[data-layer]').forEach(btn => btn.setAttribute('aria-pressed',String(btn.dataset.layer === name)));
    const legend = get('map-legend');
    if (name === 'live') {
      legend.innerHTML = '<span><i class="us-key"></i> U.S. warning</span><span><i class="ca-key"></i> Canada warning</span>';
      mapStatus.textContent = statuses.us && statuses.ca ? 'Warning outlines from NWS and ECCC' :
        'Warning coverage incomplete. Check official alerts.';
    } else {
      legend.innerHTML = '<span><i class="risk-key"></i> Select an SPC area for probability and validity</span>';
      mapStatus.textContent = statuses[name] ? 'SPC ' + (name === 'day1' ? 'Day 1' : 'Day 2') + ' tornado outlook' : 'Outlook refresh failed or unavailable';
    }
  }

  function isActive(item) { return !item.ended && Date.parse(item.expires) > Date.now(); }

  function renderActive() {
    activeRows = [...active.us,...active.ca].filter(isActive).sort((a,b) => Date.parse(b.issued)-Date.parse(a.issued));
    get('active-count').textContent = statuses.us && statuses.ca ? String(activeRows.length) : (activeRows.length ? String(activeRows.length)+'+' : '—');
    if (!activeRows.length) {
      activeList.innerHTML = statuses.us && statuses.ca ?
        '<p class="quiet">Both feeds responded. No active tornado warnings were returned.</p>' :
        '<p class="quiet">Warning status is incomplete. Open the official alerts for your area.</p>';
    } else {
      activeList.innerHTML = activeRows.map((item,index) =>
        `<div class="active-warning"><span class="country-tag">${item.country.toUpperCase()}</span><h3>${safe(item.area)}</h3>
        <p>Expires ${safe(time(item.expires))}</p>${item.feature.geometry ? '<button type="button" data-warning="'+index+'">Locate on map</button>' : ''} <a href="${item.details}">Official alerts</a></div>`).join('');
    }
    clearLayer('live');
    warningLayer = leaflet.featureGroup();
    for (const item of activeRows) {
      if (!item.feature.geometry) continue;
      item.mapLayer = leaflet.geoJSON(item.feature,{style:{
        color:item.country === 'ca' ? '#f3a2ee' : '#ff876e',weight:3,fillOpacity:.13
      }}).bindPopup(`<strong>${safe(item.title)}</strong><br>${safe(item.area)}<br>Expires ${safe(time(item.expires))}`).addTo(warningLayer);
    }
    layers.set('live',warningLayer);
  }

  activeList.addEventListener('click', event => {
    const button = event.target.closest('[data-warning]');
    const item = button && activeRows[Number(button.dataset.warning)];
    if (!item?.mapLayer) return;
    show('live');
    const bounds = item.mapLayer.getBounds();
    if (bounds.isValid()) { map.fitBounds(bounds,{padding:[24,24],maxZoom:9}); item.mapLayer.openPopup(); }
  });

  function renderHistory() {
    const entries = [...history.us,...history.ca].filter(item => filter.value === 'all' || item.country === filter.value)
      .filter(item => Date.parse(item.issued) >= Date.now()-72*36e5)
      .sort((a,b) => Date.parse(b.issued)-Date.parse(a.issued));
    const complete = filter.value === 'us' ? statuses.usHistory : filter.value === 'ca' ? statuses.ca : statuses.usHistory && statuses.ca;
    get('history-count').textContent = String(entries.length);
    historyList.innerHTML = (complete ? '' : '<p class="empty">One or more history feeds are unavailable. Results may be incomplete.</p>') +
      (entries.length ? entries.slice(0,100).map(item => `<article class="warning-item"><time>${safe(time(item.issued))}</time><div><h3>${safe(item.area)}</h3><p>${item.country === 'ca' ? 'Canada' : 'United States'}</p></div></article>`).join('') :
      (complete ? '<p class="empty">No recent warnings returned for this selection.</p>' : ''));
  }

  function renderOutlook(name, features) {
    clearLayer(name);
    const layer = leaflet.geoJSON(features,{
      style:feature=>{const p=feature.properties || {}; return {color:p.stroke||'#aad590',fillColor:p.fill||'#76a56b',weight:2,fillOpacity:.36};},
      onEachFeature:(feature, child)=>{
        const p=feature.properties||{};
        child.bindPopup(`<strong>${safe(p.LABEL2 || 'SPC tornado outlook')}</strong><br>${safe(time(p.VALID_ISO))} to ${safe(time(p.EXPIRE_ISO))}`);
      }
    });
    layers.set(name,layer);
  }

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    get('refresh').disabled = true;
    const since = new Date(Date.now()-72*36e5).toISOString();
    const jobs=[['us',warningUrls.us],['ca',warningUrls.ca],
      ['usHistory','https://api.weather.gov/alerts?'+new URLSearchParams({start:since,end:new Date().toISOString(),event:'Tornado Warning',limit:500})],
      ...Object.entries(outlookUrls)];
    await Promise.all(jobs.map(async ([key,url])=>{
      try {
        const features = await feed(url);
        if (key === 'us') active.us = features.map(item=>normalize(item,'us')).filter(Boolean);
        else if (key === 'ca') {
          history.ca = features.map(item=>normalize(item,'ca')).filter(Boolean);
          active.ca = history.ca;
        } else if (key === 'usHistory') history.us = features.map(item=>normalize(item,'us')).filter(Boolean);
        else renderOutlook(key,features);
        statuses[key] = true;
      } catch { statuses[key] = false; }
    }));
    renderActive();
    renderHistory();
    show(current);
    const unavailable = [['us','NWS warnings'],['ca','ECCC warnings'],['usHistory','NWS history'],['day1','SPC Day 1'],['day2','SPC Day 2']]
      .filter(([key])=>!statuses[key]).map(([,label])=>label);
    const activeFeeds = Number(statuses.us) + Number(statuses.ca);
    feedLabel.textContent = activeFeeds
      ? `Checked ${utc.format(new Date())} UTC${unavailable.length?' · Unavailable: '+unavailable.join(', '):''}`
      : 'Official warning feeds unavailable';
    get('refresh').disabled = false;
    refreshing = false;
  }

  document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.layer)));
  get('refresh').addEventListener('click',()=>{refresh(); radar.refresh();});
  filter.addEventListener('change',renderHistory);
  const expand = get('monitor-fullscreen');
  function resize() {
    const expanded = document.fullscreenElement === monitor || monitor.classList.contains('monitor-expanded');
    expand.textContent = expanded ? 'Exit monitor mode' : 'Full screen';
    expand.setAttribute('aria-pressed',String(expanded));
    requestAnimationFrame(()=>map.invalidateSize());
  }
  expand.addEventListener('click',async ()=>{
    if (document.fullscreenElement === monitor) await document.exitFullscreen();
    else if (monitor.classList.contains('monitor-expanded')) monitor.classList.remove('monitor-expanded');
    else {
      try {
        if (!monitor.requestFullscreen) throw new Error('Fullscreen unavailable');
        await monitor.requestFullscreen();
      } catch { monitor.classList.add('monitor-expanded'); }
    }
    resize();
  });
  document.addEventListener('fullscreenchange',resize);
  document.addEventListener('keydown',event=>{
    if(event.key === 'Escape' && monitor.classList.contains('monitor-expanded')){
      monitor.classList.remove('monitor-expanded');
      resize();
    }
  });
  document.addEventListener('visibilitychange',()=>{if (!document.hidden) refresh();});
  refresh();
  setInterval(()=>{if (!document.hidden) refresh();},120_000);
  setInterval(()=>{if (!document.hidden && activeRows.some(item=>!isActive(item))) { renderActive(); show(current); }},30_000);
}

if (leaflet) setup();
else {
  get('update-label').textContent = 'Map library did not load';
  get('map-status').textContent = 'Open the official radar or alert links below.';
}

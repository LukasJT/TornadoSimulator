const WMS = 'https://geo.weather.gc.ca/geomet';
const LAYER = 'RADAR_1KM_RRAI';
const FRAME_LIMIT = 11;
const MINUTE = 60_000;
const radarTime = new Intl.DateTimeFormat('en-CA', {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});

export function recentScans(dimension, maxFrames = FRAME_LIMIT) {
  if (!dimension) return [];
  const times = [];
  for (const entry of dimension.split(',')) {
    const [from, to, period] = entry.trim().split('/');
    const first = Date.parse(from);
    if (!Number.isFinite(first)) continue;
    if (!to) { times.push(first); continue; }
    const last = Date.parse(to);
    const minutes = Number(period?.match(/^PT(\d+)M$/)?.[1]);
    if (!Number.isFinite(last) || last < first || !minutes) continue;
    const step = minutes * MINUTE;
    const alignedEnd = first + Math.floor((last - first) / step) * step;
    for (let i = 0; i < maxFrames && alignedEnd - i * step >= first; i++) times.push(alignedEnd - i * step);
  }
  return [...new Set(times)].sort((a, b) => a - b).slice(-maxFrames);
}

export function connectRadar(map, leaflet) {
  const radarPane = map.createPane('precipitation');
  radarPane.style.zIndex = '350';
  radarPane.style.pointerEvents = 'none';
  const get = id => document.getElementById(id);
  const slider = get('radar-frame');
  const play = get('radar-play');
  const latest = get('radar-latest');
  const toggle = get('radar-toggle');
  const opacity = get('radar-opacity');
  const status = get('radar-status');
  let frames = [];
  let selected;
  let showing;
  let pending;
  let playing = false;
  let followLatest = true;
  let playbackTimer;
  let refreshing;
  let sourceFailed = false;

  function stop() {
    playing = false;
    clearTimeout(playbackTimer);
    play.textContent = 'Play loop';
  }

  function updateControls() {
    slider.max = Math.max(0, frames.length - 1);
    slider.value = Math.max(0, frames.indexOf(selected));
    slider.disabled = frames.length < 2;
    play.disabled = frames.length < 2 || !toggle.checked;
    latest.disabled = !frames.length || !toggle.checked;
    if (selected) slider.setAttribute('aria-valuetext', radarTime.format(selected) + ' local time');
  }

  function nextFrame() {
    if (!playing || document.hidden) return;
    const index = (frames.indexOf(selected) + 1) % frames.length;
    playbackTimer = setTimeout(() => draw(frames[index]), index === 0 ? 1250 : 500);
  }

  function draw(timestamp) {
    clearTimeout(playbackTimer);
    selected = timestamp;
    updateControls();
    pending?.fire('superseded').remove();
    pending = null;
    if (!toggle.checked || !timestamp) return;

    const size = map.getSize();
    if (!size.x || !size.y) return;
    const bounds = map.getBounds();
    const sw = leaflet.CRS.EPSG3857.project(bounds.getSouthWest());
    const ne = leaflet.CRS.EPSG3857.project(bounds.getNorthEast());
    const scale = Math.min(1, 1440 / size.x, 1000 / size.y);
    const query = new URLSearchParams({
      SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetMap', LAYERS: LAYER, STYLES: 'RADARURPPRECIPR14-LINEAR',
      CRS: 'EPSG:3857', BBOX: [sw.x, sw.y, ne.x, ne.y].map(value => Math.round(value)).join(','),
      WIDTH: Math.max(1, Math.round(size.x * scale)), HEIGHT: Math.max(1, Math.round(size.y * scale)),
      FORMAT: 'image/png', TRANSPARENT: 'TRUE', TIME: new Date(timestamp).toISOString().replace('.000', '')
    });
    const frame = leaflet.imageOverlay(WMS + '?' + query, bounds, {pane: 'precipitation', opacity: 0, alt: ''});
    const expires = setTimeout(() => fail(), 12_000);
    frame.once('superseded', () => clearTimeout(expires));
    function fail() {
      clearTimeout(expires);
      if (pending !== frame) return;
      pending = null;
      frame.remove();
      stop();
      status.textContent = showing ? 'Could not load the requested scan. Last displayed image retained.' : 'Radar image unavailable. Try Refresh feeds.';
    }
    frame.once('load', () => {
      clearTimeout(expires);
      if (pending !== frame) return;
      showing?.remove();
      showing = frame;
      pending = null;
      frame.setOpacity(Number(opacity.value) / 100);
      const stale = Date.now() - frames.at(-1) > 24 * MINUTE;
      status.textContent = `Scan ${radarTime.format(timestamp)} local · ${new Date(timestamp).toISOString().slice(11,16)} UTC${stale ? ' · Feed delayed' : ''}${sourceFailed ? ' · Refresh failed' : ''}`;
      nextFrame();
    });
    frame.once('error', fail);
    pending = frame.addTo(map);
  }

  async function refresh() {
    if (refreshing || !toggle.checked) return refreshing;
    refreshing = (async () => {
      try {
        const response = await fetch(WMS + '?' + new URLSearchParams({
          SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetCapabilities', LAYERS: LAYER
        }), {cache: 'no-cache', signal: AbortSignal.timeout(12_000)});
        if (!response.ok) throw new Error('Radar metadata unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'application/xml');
        const layer = [...doc.getElementsByTagName('Layer')].find(item =>
          [...item.children].some(child => child.localName === 'Name' && child.textContent === LAYER));
        const dimension = [...(layer?.children ?? [])].find(child => child.localName === 'Dimension' && child.getAttribute('name') === 'time');
        const fresh = recentScans(dimension?.textContent);
        if (!fresh.length) throw new Error('Radar metadata contained no scans');
        sourceFailed = false;
        frames = fresh;
        if ((followLatest && selected !== frames.at(-1)) || !frames.includes(selected) || !showing) draw(frames.at(-1));
        else updateControls();
      } catch {
        sourceFailed = true;
        status.textContent = showing ? 'Radar refresh failed. Last displayed image retained.' : 'Radar feed unavailable. Try Refresh feeds.';
      }
    })();
    try { await refreshing; } finally { refreshing = null; }
  }

  slider.addEventListener('input', () => { stop(); followLatest = false; draw(frames[Number(slider.value)]); });
  latest.addEventListener('click', () => { stop(); followLatest = true; draw(frames.at(-1)); });
  play.addEventListener('click', () => {
    if (playing) { stop(); return; }
    playing = true;
    followLatest = false;
    play.textContent = 'Pause loop';
    draw(frames[0]);
  });
  opacity.addEventListener('input', () => showing?.setOpacity(Number(opacity.value) / 100));
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      status.textContent = 'Loading radar…';
      if (frames.length) draw(selected ?? frames.at(-1));
      refresh();
    } else {
      stop();
      showing?.remove();
      pending?.fire('superseded').remove();
      showing = pending = null;
      status.textContent = 'Radar hidden';
      updateControls();
    }
  });
  map.on('moveend', () => { if (selected) draw(selected); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else refresh();
  });
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 120_000);
  return {refresh};
}

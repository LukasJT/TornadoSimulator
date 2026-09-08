(() => {
  const DATA_URL = '/assets/data/us-tornado-paths-1950-2024.json';
  const form = document.querySelector('#area-search-form');
  if (!form) return;
  const address = document.querySelector('#area-address');
  const locate = document.querySelector('#use-location');
  const status = document.querySelector('#lookup-status');
  const button = document.querySelector('#lookup-button');
  const results = document.querySelector('#area-results');
  const list = document.querySelector('#event-list');
  const summary = document.querySelector('#results-summary');
  const counts = document.querySelector('#radius-counts');
  const sort = document.querySelector('#result-sort');
  const placeholder = document.querySelector('#map-placeholder');
  let datasetPromise, map, marker, rings = [], pathLayer, matches = [], shown = 0, lastPoint = null;

  const setStatus = (message, kind = '') => { status.textContent = message; status.dataset.kind = kind; };
  const loadData = () => datasetPromise ||= fetch(DATA_URL).then(r => { if (!r.ok) throw new Error('The tornado archive could not be loaded.'); return r.json(); });
  const rating = e => e[4] < 0 ? 'Unknown' : `${Number(e[1].slice(0,4)) >= 2007 ? 'EF' : 'F'}${e[4]}`;
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const selectedRadius = () => Number(form.elements.radius.value);

  function distanceToPath(lat, lon, e) {
    const mean = (lat + e[7] + e[9]) / 3 * Math.PI / 180;
    const sx = (e[8] - lon) * 111.32 * Math.cos(mean), sy = (e[7] - lat) * 110.574;
    const ex = (e[10] - lon) * 111.32 * Math.cos(mean), ey = (e[9] - lat) * 110.574;
    const dx = ex - sx, dy = ey - sy, length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, -(sx * dx + sy * dy) / length2)) : 0;
    return Math.hypot(sx + t * dx, sy + t * dy);
  }

  function geocode(query) {
    return new Promise((resolve, reject) => {
      const callback = `__areaGeocode${Date.now()}`;
      const script = document.createElement('script');
      const timer = setTimeout(() => finish(new Error('The address lookup timed out. Try a fuller U.S. address.')), 12000);
      const finish = (error, value) => { clearTimeout(timer); delete window[callback]; script.remove(); error ? reject(error) : resolve(value); };
      window[callback] = data => {
        const match = data?.result?.addressMatches?.[0];
        if (!match) return finish(new Error('No matching U.S. address was found. Include the city and state.'));
        finish(null, { lat: match.coordinates.y, lon: match.coordinates.x, name: match.matchedAddress });
      };
      script.onerror = () => finish(new Error('The Census address service is unavailable. Try again shortly.'));
      script.src = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=jsonp&callback=${callback}`;
      document.head.append(script);
    });
  }

  function ensureMap(lat, lon) {
    if (!window.L) return;
    placeholder.hidden = true;
    if (!map) {
      map = L.map('area-map', { scrollWheelZoom: false }).setView([lat, lon], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      pathLayer = L.layerGroup().addTo(map);
    }
    marker?.remove(); rings.forEach(r => r.remove()); rings = []; pathLayer.clearLayers();
    marker = L.circleMarker([lat, lon], { radius: 7, color: '#fff', weight: 3, fillColor: '#a02818', fillOpacity: 1 }).addTo(map).bindTooltip('Search point');
    [5,10,25,50].forEach(km => rings.push(L.circle([lat, lon], { radius: km * 1000, color: km === selectedRadius() ? '#a02818' : '#596b62', weight: km === selectedRadius() ? 2 : 1, opacity: .7, fillOpacity: km === selectedRadius() ? .055 : 0, dashArray: km === selectedRadius() ? null : '4 6' }).addTo(map)));
    map.invalidateSize();
    map.setView([lat, lon], ({5:12,10:11,25:10,50:9})[selectedRadius()] || 10);
  }

  function renderMapPaths(lat, lon) {
    if (!map || !pathLayer) return;
    pathLayer.clearLayers();
    matches.slice(0, 200).forEach(({ e }) => {
      const end = [e[9], e[10]], start = [e[7], e[8]];
      L.polyline([start, end], { color: '#a02818', weight: 3, opacity: .72 }).addTo(pathLayer).bindTooltip(`${e[1]} · ${rating(e)}`);
    });
  }

  function sortedMatches() {
    const copy = [...matches];
    if (sort.value === 'newest') copy.sort((a,b) => b.e[1].localeCompare(a.e[1]) || a.distance-b.distance);
    else if (sort.value === 'strongest') copy.sort((a,b) => b.e[4]-a.e[4] || a.distance-b.distance);
    else copy.sort((a,b) => a.distance-b.distance || b.e[1].localeCompare(a.e[1]));
    return copy;
  }

  function renderList(reset = true) {
    if (reset) shown = 0;
    const ordered = sortedMatches();
    shown = Math.min(shown + 50, ordered.length);
    if (!ordered.length) {
      list.innerHTML = `<div class="empty"><h3>No recorded paths in this radius</h3><p>That means the SPC archive has no tornado path within ${selectedRadius()} km of the search point for 1950–2024. It does not mean tornado risk is zero. Try a wider radius to explore the regional record.</p></div>`;
      return;
    }
    list.innerHTML = ordered.slice(0, shown).map(({e,distance}) => `<article class="event-row"><div class="event-distance">${distance < 1 ? distance.toFixed(2) : distance.toFixed(1)} km<small>nearest path</small></div><div class="event-date">${escapeHtml(e[1])}<small>${escapeHtml(e[2])} · ${escapeHtml(e[3])}</small></div><div class="event-details">${e[11].toFixed(1)} mile path · ${Math.round(e[12])} yd maximum width<small>${e[5]} injuries · ${e[6]} fatalities · SPC event ${e[0]}</small></div><div><span class="rating">${rating(e)}</span></div></article>`).join('') + (shown < ordered.length ? `<button class="load-more" id="load-more" type="button">Show 50 more</button>` : '');
    document.querySelector('#load-more')?.addEventListener('click', () => renderList(false));
  }

  async function searchAt(lat, lon, name) {
    button.disabled = true; button.textContent = 'Searching 71,000 paths…'; setStatus('Loading the official tornado-path archive…');
    try {
      const data = await loadData();
      matches = data.events.map(e => ({ e, distance: distanceToPath(lat, lon, e) })).filter(x => x.distance <= selectedRadius());
      lastPoint = { lat, lon, name };
      const allDistances = data.events.map(e => distanceToPath(lat, lon, e));
      counts.innerHTML = [5,10,25,50].map(km => `<div class="radius-count"><strong>${allDistances.filter(d => d <= km).length.toLocaleString()}</strong><span>within ${km} km</span></div>`).join('');
      summary.textContent = `${matches.length.toLocaleString()} recorded tornado path${matches.length === 1 ? '' : 's'} within ${selectedRadius()} km of ${name}.`;
      results.hidden = false; renderList(); ensureMap(lat, lon); renderMapPaths(lat, lon);
      setStatus(`Showing the 1950–2024 record near ${name}.`, 'success');
      results.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } catch (error) { setStatus(error.message || 'The lookup could not be completed. Try again.', 'error'); }
    finally { button.disabled = false; button.textContent = 'Search tornado history'; }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault(); const query = address.value.trim();
    if (query.length < 5) { setStatus('Enter a street address with city and state.', 'error'); address.focus(); return; }
    button.disabled = true; button.textContent = 'Finding address…'; setStatus('Matching your address with the U.S. Census geocoder…');
    try { const found = await geocode(query); await searchAt(found.lat, found.lon, found.name); }
    catch (error) { setStatus(error.message, 'error'); button.disabled = false; button.textContent = 'Search tornado history'; }
  });
  form.querySelector('.radius-options').addEventListener('change', () => { if (lastPoint) searchAt(lastPoint.lat, lastPoint.lon, lastPoint.name); });
  sort.addEventListener('change', () => renderList());
  locate.addEventListener('click', () => {
    if (!navigator.geolocation) return setStatus('Location access is not supported in this browser.', 'error');
    locate.disabled = true; setStatus('Waiting for your device location…');
    navigator.geolocation.getCurrentPosition(p => { locate.disabled = false; address.value = 'Current location'; searchAt(p.coords.latitude, p.coords.longitude, 'your current location'); }, e => { locate.disabled = false; setStatus(e.code === 1 ? 'Location access was declined. Enter an address instead.' : 'Your location could not be determined. Enter an address instead.', 'error'); }, { enableHighAccuracy: false, timeout: 12000 });
  });
})();

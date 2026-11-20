import { calculateEnvironment, KNOT_TO_MS } from './supercell-model.js';
import { drawCrossSection, getStage, stages } from './supercell-diagram.js';

const byId = id => document.getElementById(id);
const inputs = {
  cape: ['Surface CAPE', 'J/kg'], cin: ['Convective inhibition', 'J/kg'],
  shear: ['0–6 km bulk shear', 'kt'], srh: ['0–1 km helicity', 'm²/s²'],
  lcl: ['Cloud base', 'm AGL'], td: ['Dewpoint', '°F']
};
const presets = {
  plains: ['Classic Plains', 3500, -40, 55, 300, 900, 68],
  dixie: ['Humid Southeast', 2200, -30, 60, 380, 600, 72],
  highShear: ['High shear and helicity', 4200, -20, 70, 450, 800, 70],
  landspout: ['Weak shear', 1500, -10, 15, 40, 1800, 55],
  highBase: ['High cloud base', 2500, -60, 50, 180, 2400, 45],
  capped: ['Strong inhibition', 3200, -220, 45, 200, 1400, 65],
  cool: ['Cool-season setup', 500, -20, 65, 280, 500, 60],
  quiet: ['Low instability', 200, -100, 12, 30, 2200, 40]
};
const fields = Object.keys(inputs);
const sliders = Object.fromEntries(fields.map(key => [key, byId('s-' + key)]));
const defaults = Object.fromEntries(fields.map(key => [key, Number(sliders[key].value)]));
const fieldsExact = {};
const timeline = byId('storm-minute');
const secondsPerFrame = 1000;
const params = new URLSearchParams(location.search);
const hasVersion = params.get('v') === '1';
const slowerTimeline = hasVersion && params.get('pace') === 'slow';
timeline.max = slowerTimeline ? 80 : 60;
let state = readRun('');
let pinned = hasVersion && fields.every(key => params.has('a-' + key)) ? readRun('a-') : null;
let metricUnits = false;
let timer;
let scheduledFrame;

function readRun(prefix) {
  return Object.fromEntries(fields.map(key => {
    const raw = hasVersion ? params.get(prefix + key) : null;
    const value = raw?.trim() ? Number(raw) : NaN;
    const slider = sliders[key];
    return [key, Number.isFinite(value) && value >= Number(slider.min) && value <= Number(slider.max) ? value : defaults[key]];
  }));
}

function displayValue(key, value) {
  if (!metricUnits) return value;
  if (key === 'shear') return value * KNOT_TO_MS;
  if (key === 'td') return (value - 32) * 5 / 9;
  return value;
}

function inputValue(key, value) {
  if (!metricUnits) return value;
  if (key === 'shear') return value / KNOT_TO_MS;
  if (key === 'td') return value * 9 / 5 + 32;
  return value;
}

function unit(key) {
  if (metricUnits && key === 'shear') return 'm/s';
  if (metricUnits && key === 'td') return '°C';
  return inputs[key][1];
}

function calculate(run) {
  return calculateEnvironment({ ...run, shear: run.shear * KNOT_TO_MS });
}

function drawTimeline() {
  const minute = Number(timeline.value);
  const stage = getStage(minute, slowerTimeline ? 4 / 3 : 1);
  drawCrossSection(byId('storm-diagram'), stage);
  byId('storm-stage').textContent = `Minute ${minute} · ${stages[stage]}. ${[
    'Air rises near the inflow.', 'The updraft deepens as a downdraft develops.',
    'Air rises through the tilted core while a separate downdraft descends.',
    'The storm contracts as rising air weakens.'
  ][stage]}`;
  timeline.setAttribute('aria-valuetext', `${minute} minutes, ${stages[stage]}`);
}

function render() {
  for (const key of fields) {
    const value = Number(displayValue(key, state[key]).toFixed(2));
    sliders[key].value = state[key];
    sliders[key].setAttribute('aria-valuetext', `${value} ${unit(key)}`);
    byId('v-' + key).textContent = value;
    byId('v-' + key).nextElementSibling.textContent = unit(key);
    const exact = fieldsExact[key];
    exact.setAttribute('aria-label', `${inputs[key][0]}, exact value in ${unit(key)}`);
    exact.value = value;
  }
  const results = calculate(state);
  const labels = { stp: 'Fixed-layer STP', ehi: '0–1 km EHI', updraft: 'Ideal updraft (m/s)' };
  const metrics = [['stp', 2], ['ehi', 2], ['updraft', 1]];
  for (const [key, digits] of metrics) byId('m-' + key).textContent = results[key].toFixed(digits);
  byId('initiation-note').textContent = `CIN is ${state.cin} J/kg. A more negative value means a parcel needs more lift. This STP version does not use CIN.`;
  const { factors } = results;
  byId('storm-factors').textContent = `STP factors: CAPE ${factors.cape.toFixed(3)} × cloud base ${factors.cloudBase.toFixed(3)} × helicity ${factors.helicity.toFixed(3)} × shear ${factors.shear.toFixed(3)}. Shear is ${(state.shear * KNOT_TO_MS).toFixed(2)} m/s. The cloud-base factor stays at 1 at or below 1000 m, and at 0 at or above 2000 m. Shear below 12.5 m/s contributes 0 and at or above 30 m/s contributes 1.5.`;
  byId('storm-compare').hidden = !pinned;
  byId('storm-swap').disabled = !pinned;
  if (!pinned) return;
  const reference = calculate(pinned);
  const rows = [
    ...fields.map(key => [`${inputs[key][0]} (${unit(key)})`, displayValue(key, pinned[key]), displayValue(key, state[key]), 2]),
    ...metrics.map(([key, digits]) => [labels[key], reference[key], results[key], digits])
  ];
  const body = byId('storm-compare-rows');
  body.replaceChildren();
  for (const [label, left, right, digits] of rows) {
    const row = body.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    row.append(heading);
    for (const value of [left, right, right - left]) row.insertCell().textContent = Number(value.toFixed(digits)).toString();
  }
}

for (const key of fields) {
  const slider = sliders[key];
  const exact = document.createElement('input');
  exact.type = 'number';
  exact.step = 'any';
  exact.className = 'lab-number';
  byId('v-' + key).parentElement.prepend(exact);
  fieldsExact[key] = exact;
  exact.addEventListener('change', () => {
    if (exact.value !== '') state[key] = Math.min(Number(slider.max), Math.max(Number(slider.min), inputValue(key, Number(exact.value))));
    render();
  });
  slider.addEventListener('input', () => {
    state[key] = Number(slider.value);
    cancelAnimationFrame(scheduledFrame);
    scheduledFrame = requestAnimationFrame(render);
  });
}

for (const [id, [name, ...values]] of Object.entries(presets)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preset-btn';
  button.dataset.preset = id;
  button.textContent = name;
  button.addEventListener('click', () => {
    state = Object.fromEntries(fields.map((key, index) => [key, values[index]]));
    render();
  });
  byId('presets').append(button);
}

byId('storm-units').addEventListener('change', event => {
  metricUnits = event.target.value === 'metric';
  render();
});
function announce(message) { byId('scenario-status').textContent = message; }
byId('storm-pin').addEventListener('click', () => { pinned = { ...state }; render(); announce('Run A pinned. Change any input to compare.'); });
byId('storm-swap').addEventListener('click', () => { [state, pinned] = [pinned, state]; render(); announce('Runs A and B swapped.'); });
byId('storm-reset').addEventListener('click', () => {
  state = { ...defaults };
  pinned = null;
  timeline.value = 30;
  stopPlayback();
  drawTimeline();
  render();
  announce('Default scenario restored.');
});
byId('storm-share').addEventListener('click', async () => {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('v', '1');
  url.searchParams.set('minute', timeline.value);
  if (slowerTimeline) url.searchParams.set('pace', 'slow');
  for (const key of fields) {
    url.searchParams.set(key, state[key]);
    if (pinned) url.searchParams.set('a-' + key, pinned[key]);
  }
  url.hash = 'storm-timeline';
  const link = byId('storm-share-link');
  link.hidden = false;
  link.value = url.href;
  try { await navigator.clipboard.writeText(link.value); announce('Scenario link copied.'); }
  catch { link.focus(); link.select(); announce('Select and copy the scenario link.'); }
});
function stopPlayback() {
  clearInterval(timer);
  timer = undefined;
  byId('storm-play').textContent = 'Play';
}
byId('storm-play').addEventListener('click', () => {
  if (timer) { stopPlayback(); return; }
  if (timeline.value === timeline.max) timeline.value = 0;
  drawTimeline();
  byId('storm-play').textContent = 'Pause';
  timer = setInterval(() => {
    timeline.value = Number(timeline.value) + 1;
    drawTimeline();
    if (timeline.value === timeline.max) stopPlayback();
  }, secondsPerFrame);
});
for (const [id, delta] of [['storm-previous', -1], ['storm-next', 1]]) {
  byId(id).addEventListener('click', () => { stopPlayback(); timeline.value = Number(timeline.value) + delta; drawTimeline(); });
}
timeline.addEventListener('input', () => { stopPlayback(); drawTimeline(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
if (hasVersion && params.has('minute') && /^\d{1,2}$/.test(params.get('minute'))) timeline.value = params.get('minute');
render();
drawTimeline();

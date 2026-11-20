import assert from 'node:assert/strict';
import { calculateEnvironment, KNOT_TO_MS } from '../assets/supercell-model.js';

const baseline = { cape: 1500, lcl: 1000, shear: 20, srh: 150 };
for (const [shear, stp] of [[12.49, 0], [12.5, 0.625], [20, 1], [30, 1.5], [40, 1.5]]) {
  assert.equal(calculateEnvironment({ ...baseline, shear }).stp, stp);
}
assert.equal(calculateEnvironment({ ...baseline, lcl: 2000 }).stp, 0);
assert.equal(calculateEnvironment({ ...baseline, cape: 0 }).updraft, 0);
assert.equal(calculateEnvironment({ ...baseline, cin: -200 }).stp, 1);
const defaultRun = { ...baseline, cape: 2500, shear: 45 * KNOT_TO_MS };
assert.equal(calculateEnvironment(defaultRun).stp.toFixed(2), '1.93');
assert.equal(calculateEnvironment({ ...defaultRun, lcl: 1500 }).stp.toFixed(2), '0.96');
assert.equal(calculateEnvironment({ ...baseline, cape: 2000, srh: 160 }).ehi, 2);
console.log('PASS: fixed-layer STP bounds, unit conversion, independent CIN, updraft and EHI.');

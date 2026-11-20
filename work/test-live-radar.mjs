import assert from 'node:assert/strict';
import {recentScans} from '../assets/live-radar.js';

const base = '2026-11-20T16:00:00Z';
const end = '2026-11-20T18:00:00Z';
const frames = recentScans(`${base}/${end}/PT6M`);
assert.equal(frames.length,11);
assert.equal(frames[0],Date.parse('2026-11-20T17:00:00Z'));
assert.equal(frames.at(-1),Date.parse(end));
assert.deepEqual(recentScans(`${end},${end},${base}`),[Date.parse(base),Date.parse(end)]);
assert.equal(recentScans(`${base}/2026-11-20T16:13:00Z/PT6M`).at(-1),Date.parse('2026-11-20T16:12:00Z'));
assert.deepEqual(recentScans('bad,2026-11-20T16:00:00Z/2026-11-20T16:01:00Z/PT0M'),[]);
console.log('PASS: provider scan intervals, one-hour limit, deduplication and malformed metadata');

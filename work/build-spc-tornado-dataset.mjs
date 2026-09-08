import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const input = process.argv[2] || path.join(import.meta.dirname, 'spc-tornadoes.csv');
const output = process.argv[3] || path.resolve(import.meta.dirname, '..', 'assets', 'data', 'us-tornado-paths-1950-2024.json');
const stream = readline.createInterface({ input: fs.createReadStream(input), crlfDelay: Infinity });
const events = [];
let first = true;

for await (const line of stream) {
  if (first) { first = false; continue; }
  const c = line.split(',');
  if (c.length < 29) continue;
  const slat = Number(c[15]), slon = Number(c[16]);
  let elat = Number(c[17]), elon = Number(c[18]);
  if (!Number.isFinite(slat) || !Number.isFinite(slon) || !slat || !slon) continue;
  if (!elat || !elon) { elat = slat; elon = slon; }
  events.push([
    Number(c[0]), c[4], c[5].slice(0, 5), c[7], Number(c[10]), Number(c[11]), Number(c[12]),
    slat, slon, elat, elon, Number(c[19]), Number(c[20])
  ]);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  source: 'NOAA/NWS Storm Prediction Center severe weather database',
  sourceUrl: 'https://www.spc.noaa.gov/wcm/#data',
  period: '1950–2024',
  generated: '2026-09-08',
  columns: ['id','date','time','state','rating','injuries','fatalities','startLat','startLon','endLat','endLon','lengthMi','widthYd'],
  events
}));
console.log(`Wrote ${events.length.toLocaleString()} tornado paths to ${output}`);

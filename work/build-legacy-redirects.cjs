// Exact replacements observed in Search Console's September 3, 2026 404 report.
// GitHub Pages cannot apply custom HTTP 301 rules. Google treats an immediate
// meta refresh as permanent: https://developers.google.com/search/docs/crawling-indexing/301-redirects
const fs = require('node:fs');
const map = require('./legacy-url-map.json');
for (const [oldPath, target] of Object.entries(map)) {
  if (!/^[a-z0-9/-]+$/.test(oldPath + target) || map[target]) throw Error('Invalid or chained redirect');
  const source = fs.readFileSync(`${target}/index.html`, 'utf8');
  const title = source.match(/<title>([^<]+)<\/title>/i)[1];
  const url = `https://www.tornadosimulator.net/${target}/`;
  const file = `${oldPath}/index.html`;
  if (fs.existsSync(file) && !fs.readFileSync(file,'utf8').includes('data-legacy-redirect')) throw Error(`Would overwrite content: ${file}`);
  fs.mkdirSync(oldPath, {recursive:true});
  fs.writeFileSync(file, `<!doctype html>\n<html lang="en" data-legacy-redirect><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${url}"></head><body><h1>This guide has moved</h1><p><a href="${url}">${title}</a></p></body></html>\n`);
}
console.log(`Built ${Object.keys(map).length} direct legacy redirects.`);

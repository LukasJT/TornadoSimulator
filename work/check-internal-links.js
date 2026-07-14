import fs from 'fs';
import path from 'path';

const root = process.cwd();
const htmlFiles = [];
const ignoredDirs = new Set(['.git', '.agents', '.codex', 'dist', 'node_modules']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.join(dir, entry.name));
    }
  }
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function htmlForPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (clean === '/' || clean === '') return path.join(root, 'index.html');
  const withoutLeading = clean.replace(/^\/+/, '');
  if (path.posix.extname(withoutLeading) && !withoutLeading.endsWith('/')) return path.join(root, withoutLeading);
  if (withoutLeading.endsWith('/')) return path.join(root, withoutLeading, 'index.html');
  return path.join(root, withoutLeading, 'index.html');
}

function resolveInternalHref(href, sourceFile) {
  const trimmed = href.trim();
  if (!trimmed || trimmed === '#') return null;
  if (/^(mailto|tel|sms|javascript|data|blob):/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!/^(www\.)?tornadosimulator\.net$/i.test(url.hostname)) return null;
      return { pathname: url.pathname || '/', hash: url.hash };
    } catch {
      return null;
    }
  }
  if (trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('#')) return { pathname: '/' + path.dirname(rel(sourceFile)).replace(/^\.$/, ''), hash: trimmed };
  if (trimmed.startsWith('/')) {
    const [pathname, hashPart] = trimmed.split('#');
    return { pathname: pathname || '/', hash: hashPart ? `#${hashPart}` : '' };
  }

  const sourceDir = path.posix.dirname(rel(sourceFile));
  const [relativePath, hashPart] = trimmed.split('#');
  const normalized = path.posix.normalize(path.posix.join('/', sourceDir, relativePath));
  return { pathname: normalized.startsWith('/') ? normalized : `/${normalized}`, hash: hashPart ? `#${hashPart}` : '' };
}

function hasAnchor(file, hash) {
  if (!hash) return true;
  const id = decodeURIComponent(hash.slice(1));
  if (!id) return true;
  const html = fs.readFileSync(file, 'utf8');
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\s(?:id|name)=["']${escaped}["']`, 'i').test(html);
}

walk(root);

const problems = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const links = html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi);
  for (const match of links) {
    const href = match[1];
    const target = resolveInternalHref(href, file);
    if (!target) continue;
    const targetFile = htmlForPath(target.pathname);
    if (!fs.existsSync(targetFile)) {
      problems.push({ source: rel(file), href, reason: 'missing-target', expected: rel(targetFile) });
      continue;
    }
    if (!hasAnchor(targetFile, target.hash)) {
      problems.push({ source: rel(file), href, reason: 'missing-anchor', expected: `${rel(targetFile)}${target.hash}` });
    }
  }
}

const summary = {
  htmlFiles: htmlFiles.length,
  problems: problems.length,
  byReason: problems.reduce((acc, item) => {
    acc[item.reason] = (acc[item.reason] || 0) + 1;
    return acc;
  }, {}),
};

if (process.argv.includes('--unique')) {
  const unique = [...problems.reduce((map, item) => {
    const key = item.href;
    const current = map.get(key) || { href: item.href, count: 0, reason: item.reason, expected: item.expected, sources: [] };
    current.count += 1;
    if (current.sources.length < 8) current.sources.push(item.source);
    map.set(key, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.count - a.count || a.href.localeCompare(b.href));
  console.log(JSON.stringify({ summary, unique }, null, 2));
} else {
  console.log(JSON.stringify({ summary, problems }, null, 2));
}
if (problems.length) process.exitCode = 1;

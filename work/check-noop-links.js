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

function lineFor(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

walk(root);

const problems = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const links = html.matchAll(/\shref=(["'])(.*?)\1/gi);
  for (const match of links) {
    const href = match[2].trim();
    if (href === '' || href === '#') {
      problems.push({ source: rel(file), line: lineFor(html, match.index), href });
    }
  }
}

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  problems: problems.length,
  sample: problems.slice(0, 40),
}, null, 2));

if (problems.length) process.exitCode = 1;

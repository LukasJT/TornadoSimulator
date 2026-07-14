import fs from 'fs';
import path from 'path';

const root = process.cwd();
const site = 'https://www.tornadosimulator.net';
const today = '2026-07-13';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function page({ slug, eyebrow, title, description, body, type = 'WebPage' }) {
  const url = `${site}/${slug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:card" content="summary" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:site_name" content="Tornado Hub" />
<link rel="canonical" href="${url}" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': type, name: title, headline: title, description, url, publisher: { '@type': 'Organization', name: 'Tornado Hub', url: site }, datePublished: today, dateModified: today, inLanguage: 'en' })}</script>
<style>
:root{--bg:#fbfaf7;--bg-alt:#f4f1ea;--surface:#fff;--text:#14161c;--text-secondary:#4a5061;--text-muted:#8b8f9c;--border:#e5e1d8;--accent:#a02818;--accent-hover:#7d1f13;--link:#1e3a5f;--serif:"Fraunces",Georgia,serif;--sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--sans);background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}a{color:var(--link);text-decoration:none}a:hover{color:var(--accent);text-decoration:underline}
.nav{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}.nav-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}.nav-brand{font-family:var(--serif);font-weight:700;font-size:20px;color:var(--text);text-decoration:none}.nav-links{display:flex;gap:4px;flex-wrap:wrap}.nav-links a{color:var(--text-secondary);padding:8px 12px;font-size:14px;font-weight:500;border-radius:6px;text-decoration:none}.nav-links a:hover{background:var(--bg-alt);color:var(--text);text-decoration:none}.nav-links .cta{background:var(--accent);color:#fff}
.hero{background:linear-gradient(180deg,var(--bg),var(--bg-alt));border-bottom:1px solid var(--border);padding:68px 24px 52px}.hero-inner{max-width:820px;margin:0 auto}.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}h1{font-family:var(--serif);font-size:clamp(34px,5vw,52px);line-height:1.1;margin-bottom:16px}.lede{font-size:19px;color:var(--text-secondary);max-width:720px}
.main{max-width:820px;margin:0 auto;padding:52px 24px 72px}.main h2{font-family:var(--serif);font-size:27px;margin:42px 0 12px}.main h3{font-family:var(--serif);font-size:20px;margin:28px 0 8px}.main p{font-size:17px;margin-bottom:16px}.main ul{margin:0 0 18px 24px}.main li{font-size:16px;margin-bottom:8px}.notice{background:var(--surface);border-left:4px solid var(--accent);padding:18px 20px;margin:28px 0;box-shadow:0 2px 10px rgba(0,0,0,.04)}.meta{color:var(--text-muted);font-size:14px;margin-top:24px}
.footer{background:#14161c;color:#94a3b8;padding:40px 24px;border-top:4px solid var(--accent)}.footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr repeat(3,1fr);gap:28px}.footer h4{color:#fff;font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}.footer ul{list-style:none}.footer li{margin-bottom:8px;font-size:14px}.footer a{color:#fff}.footer-bottom{max-width:1200px;margin:28px auto 0;padding-top:20px;border-top:1px solid #273244;display:flex;gap:16px;justify-content:space-between;flex-wrap:wrap;font-size:13px}
@media(max-width:760px){.nav-inner{align-items:flex-start;flex-direction:column}.footer-inner{grid-template-columns:1fr}.footer-bottom{display:block}.footer-bottom span{display:block;margin-top:8px}}
</style>
</head>
<body>
<nav class="nav"><div class="nav-inner"><a class="nav-brand" href="/">Tornado Hub</a><div class="nav-links"><a href="/">Home</a><a href="/articles/">Articles</a><a href="/search/">Search</a><a href="/about-us/">About</a><a href="/contact/">Contact</a><a href="/simulator/" class="cta">Simulator</a></div></div></nav>
<header class="hero"><div class="hero-inner"><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></div></header>
<main class="main">${body}<p class="meta">Last updated: July 13, 2026</p></main>
<footer class="footer"><div class="footer-inner"><div><h4>Tornado Hub</h4><p>An educational weather resource with a tornado simulator, safety guides, storm history, weather games, and explainers. Not a real-time warning system.</p></div><div><h4>Explore</h4><ul><li><a href="/simulator/">Simulator</a></li><li><a href="/articles/">All articles</a></li><li><a href="/learn/">Learn</a></li><li><a href="/safety/">Safety</a></li></ul></div><div><h4>Company</h4><ul><li><a href="/about-us/">About Us</a></li><li><a href="/about/">Editorial approach</a></li><li><a href="/contact/">Contact</a></li><li><a href="/search/">Search</a></li></ul></div><div><h4>Legal</h4><ul><li><a href="/privacy-policy/">Privacy Policy</a></li><li><a href="/terms-and-conditions/">Terms and Conditions</a></li><li><a href="/contact/">Corrections</a></li></ul></div></div><div class="footer-bottom"><span>&copy; Tornado Hub. Educational resource.</span><span>For emergencies, follow NOAA Weather Radio, Wireless Emergency Alerts, and local officials.</span></div></footer>
<script src="/assets/article-tracker.js" defer></script>
<script src="/assets/ads-config.js" defer></script>
<script src="/assets/ads.js" defer></script>
<script src="/assets/house-ads.js" defer></script>
</body>
</html>`;
}

const pages = [
  {
    slug: 'privacy-policy',
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    description: 'How Tornado Hub handles analytics, advertising cookies, third-party ad networks, affiliate links, contact messages, and privacy choices.',
    type: 'PrivacyPolicy',
    body: `<p>Tornado Hub is an educational weather website. This policy explains what information may be collected when you use the site, how advertising and analytics technologies may work, and what choices you have.</p>
<div class="notice"><p>We do not sell personal information directly. The site may use third-party advertising, analytics, affiliate, and hosting services that collect data under their own policies.</p></div>
<h2>Information we may collect</h2>
<ul><li>Basic technical data such as browser type, device type, referring pages, approximate location, and pages viewed.</li><li>Voluntary messages you send through contact links or issue reports.</li><li>Local browser data used for non-sensitive features such as article view tracking or saved preferences.</li></ul>
<h2>Advertising cookies and third-party ads</h2>
<p>The site may use third-party ad networks, including Adsterra-related domains such as highperformanceformat.com and effectivecpmnetwork.com. Those vendors may use cookies, scripts, or similar technologies to serve, limit, and measure ads.</p>
<p>Users can use browser settings, privacy extensions, or participating industry opt-out tools to limit personalized advertising and manage cookies. Some ad network choices may be controlled on the vendor's own privacy or opt-out pages.</p>
<p>We avoid ad formats that hijack normal page clicks, force unexpected full-page navigation, or make the site difficult to use. Display banners, native placements, and clearly framed ad slots are preferred.</p>
<h2>Analytics and site measurement</h2>
<p>We may use server logs, privacy-conscious counters, or analytics tools to understand which pages are useful, diagnose technical issues, and improve navigation. Article popularity features may use aggregate or local counts rather than identifying a specific person.</p>
<h2>Affiliate links</h2>
<p>Some pages may include affiliate links. If you click a link and buy something, the site may earn a commission at no extra cost to you. Affiliate links do not change our educational safety advice.</p>
<h2>Children and students</h2>
<p>The site includes student-friendly weather education content, but it is not directed at collecting personal information from children. Students should use classroom and project pages with a parent, guardian, or teacher when appropriate.</p>
<h2>Contact and correction messages</h2>
<p>If you contact us, we may use your message and contact details only to respond, investigate corrections, or maintain the site. Do not send sensitive personal information.</p>
<h2>Your choices</h2>
<ul><li>Use browser settings to block or delete cookies.</li><li>Use privacy extensions or participating industry opt-out tools to limit personalized advertising.</li><li>Review ad vendor privacy choices where available.</li><li>Contact us through the Contact page for correction or privacy questions.</li></ul>`
  },
  {
    slug: 'terms-and-conditions',
    eyebrow: 'Terms',
    title: 'Terms and Conditions',
    description: 'The rules for using Tornado Hub, including educational use, emergency disclaimers, intellectual property, ads, affiliate links, and acceptable use.',
    type: 'TermsOfService',
    body: `<p>By using Tornado Hub, you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>Educational use only</h2>
<p>Tornado Hub provides weather education, simulations, history, safety explainers, games, and general preparedness information. It is not a live warning service, emergency authority, insurance adviser, engineering adviser, or government agency.</p>
<div class="notice"><p>During dangerous weather, follow NOAA Weather Radio, Wireless Emergency Alerts, National Weather Service warnings, local emergency managers, and public safety officials.</p></div>
<h2>Simulator and model limitations</h2>
<p>The simulator and calculators are teaching tools. They use simplified assumptions and should not be used for emergency decisions, building design, insurance valuation, legal claims, or real-world damage prediction.</p>
<h2>Acceptable use</h2>
<ul><li>Do not attempt to disrupt the site, scrape it aggressively, inject malicious code, or interfere with ads or measurement systems.</li><li>Do not misuse contact channels for spam, link exchanges, deceptive guest posts, or unrelated solicitation.</li><li>Do not copy large portions of the site and republish them as your own.</li></ul>
<h2>Advertising and affiliate disclosure</h2>
<p>The site may display advertising and may use affiliate links. Ads and affiliate relationships help fund the site, but they do not replace editorial judgment or official safety guidance.</p>
<h2>Intellectual property</h2>
<p>Unless otherwise stated, page text, site structure, custom tools, and original educational content belong to Tornado Hub or its contributors. You may link to pages and quote short excerpts with attribution.</p>
<h2>External links</h2>
<p>The site links to official weather sources, data providers, advertisers, affiliate partners, and other third-party pages. We are not responsible for third-party content, policies, or availability.</p>
<h2>No warranties</h2>
<p>The site is provided as-is. We try to keep information accurate and useful, but weather science, data, and external links can change. We do not guarantee uninterrupted access or error-free content.</p>
<h2>Changes</h2>
<p>We may update these terms as the site changes. Continued use of the site after an update means you accept the updated terms.</p>`
  },
  {
    slug: 'about-us',
    eyebrow: 'About Us',
    title: 'About Us',
    description: 'About Tornado Hub: an independent educational weather site with a tornado simulator, safety guides, historical case files, quizzes, and weather explainers.',
    type: 'AboutPage',
    body: `<p>Tornado Hub is an independent educational weather site built around a simple goal: make severe weather easier to understand before people need that knowledge in a stressful moment.</p>
<h2>What we publish</h2>
<ul><li>Interactive weather tools and games, including the tornado simulator.</li><li>Plain-English severe weather safety guides.</li><li>Historical case files for tornadoes, hurricanes, floods, winter storms, and major weather disasters.</li><li>Forecast, radar, climate, and weather science explainers for students and curious readers.</li></ul>
<h2>Editorial standards</h2>
<p>We aim to write clear, original, useful pages that explain what a hazard is, why it matters, and what readers should do next. We avoid pretending to be a live warning service, and we point readers back to official alerts for emergency decisions.</p>
<h2>Data and sources</h2>
<p>Pages may reference public weather and population sources such as NOAA, the National Weather Service, the Storm Prediction Center, the U.S. Census Bureau, Statistics Canada, and other official or educational sources. When weather history or safety guidance is uncertain, we try to say so plainly.</p>
<h2>Advertising and funding</h2>
<p>Tornado Hub is free to use. The site may be funded by display advertising and affiliate links. Advertising helps pay for hosting, development, research, and maintenance.</p>
<h2>Independence</h2>
<p>Tornado Hub is not affiliated with NOAA, the National Weather Service, FEMA, Adsterra, or any government agency. Brand names and data-source names belong to their respective owners.</p>`
  },
  {
    slug: 'contact',
    eyebrow: 'Contact',
    title: 'Contact Tornado Hub',
    description: 'Contact Tornado Hub for corrections, source questions, privacy questions, technical issues, or feedback about the simulator and weather guides.',
    type: 'ContactPage',
    body: `<p>Use this page for corrections, source questions, privacy questions, technical issues, and feedback about the simulator or educational guides.</p>
<div class="notice"><p>Tornado Hub is not a live weather warning desk. If you are in danger, follow local emergency officials, NOAA Weather Radio, Wireless Emergency Alerts, or your National Weather Service office.</p></div>
<h2>Best contact route</h2>
<p>For site issues, corrections, broken links, or technical bugs, open an issue on the project repository:</p>
<p><a href="https://github.com/LukasJT/TornadoSimulator/issues" rel="nofollow">github.com/LukasJT/TornadoSimulator/issues</a></p>
<h2>What to include</h2>
<ul><li>The URL of the page you are writing about.</li><li>A short explanation of the correction or issue.</li><li>A source link if you are reporting a factual correction.</li><li>Your browser and device if reporting a technical problem.</li></ul>
<h2>What we do not accept</h2>
<p>We do not accept paid link insertions, deceptive guest posts, irrelevant sponsored content, or requests to disguise ads as editorial content.</p>
<h2>Privacy questions</h2>
<p>For privacy-related questions, include the page URL, browser/device context if relevant, and the specific concern. Do not send sensitive personal information.</p>`
  }
];

for (const item of pages) {
  const dir = path.join(root, item.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(item));
}

function replaceFooterLinks(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (file.endsWith('index.html') && path.basename(path.dirname(file)) === 'TornadoSimulator') {
    html = html.replace(
      /<li><a href="\/about\/">About the site<\/a><\/li>/,
      `<li><a href="/about-us/">About Us</a></li>\n        <li><a href="/contact/">Contact</a></li>`
    );
    html = html.replace(
      /<div class="footer-bottom">[\s\S]*?<\/div>\s*<\/footer>/,
      `<div class="footer-bottom">\n    <span>&copy; Tornado Hub. An educational resource.</span>\n    <span>Not a real-time warning system. In an emergency, follow NOAA Weather Radio and NWS warnings.</span>\n    <span><a href="/privacy-policy/">Privacy Policy</a> &middot; <a href="/terms-and-conditions/">Terms</a> &middot; <a href="/about-us/">About Us</a> &middot; <a href="/contact/">Contact</a></span>\n  </div>\n</footer>`
    );
  } else {
    html = html.replace(
      /&copy; Tornado Hub\. An educational resource\. <a href="\/">Home<\/a> &middot; <a href="\/simulator\/">Simulator<\/a> &middot; <a href="\/articles\/">Articles<\/a> &middot; <a href="\/learn\/">Learn<\/a> &middot; <a href="\/safety\/">Safety<\/a>/,
      `&copy; Tornado Hub. An educational resource. <a href="/">Home</a> &middot; <a href="/simulator/">Simulator</a> &middot; <a href="/articles/">Articles</a> &middot; <a href="/learn/">Learn</a> &middot; <a href="/safety/">Safety</a> &middot; <a href="/privacy-policy/">Privacy</a> &middot; <a href="/terms-and-conditions/">Terms</a> &middot; <a href="/about-us/">About Us</a> &middot; <a href="/contact/">Contact</a>`
    );
  }
  fs.writeFileSync(file, html);
}

replaceFooterLinks(path.join(root, 'index.html'));
replaceFooterLinks(path.join(root, 'about', 'index.html'));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'work'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function textBetween(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function categoryFor(file, html) {
  const eyebrow = textBetween(html, /class=["'][^"']*(?:eyebrow|page-eyebrow|article-cat|section-eyebrow)[^"']*["'][^>]*>([^<]+)/i);
  if (eyebrow) return eyebrow;
  if (file.includes(`${path.sep}quiz${path.sep}`)) return 'Quiz';
  if (file.includes('simulator') || file.includes('game')) return 'Interactive';
  if (file.includes('privacy') || file.includes('terms') || file.includes('contact') || file.includes('about')) return 'Site information';
  if (file.includes('safety') || file.includes('shelter')) return 'Safety';
  return 'Guide';
}

const files = [path.join(root, 'index.html'), ...walk(root).filter((file) => file !== path.join(root, 'index.html'))];
const items = files.map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const relDir = path.relative(root, path.dirname(file)).replace(/\\/g, '/');
  const pathName = relDir === '' ? '/' : `/${relDir}/`;
  const title = textBetween(html, /<title>([\s\S]*?)<\/title>/i) || textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || 'Tornado Hub';
  const description = textBetween(html, /<meta name=["']description["'] content=["']([\s\S]*?)["']\s*\/?>/i);
  return { title, path: pathName, description, category: categoryFor(file, html), keywords: `${title} ${description} ${relDir.replace(/-/g, ' ')}` };
}).sort((a, b) => a.path.localeCompare(b.path));

fs.writeFileSync(path.join(root, 'assets', 'content-index.js'), `window.TORNADO_CONTENT_INDEX = ${JSON.stringify(items, null, 2)};\n`);
const urls = items.map((item) => `  <url>\n    <loc>${site}${item.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.path === '/' ? 'daily' : 'monthly'}</changefreq>\n    <priority>${item.path === '/' ? '1.0' : item.path.includes('privacy') || item.path.includes('terms') || item.path.includes('contact') || item.path.includes('about-us') ? '0.6' : item.path.includes('guides') ? '0.8' : '0.7'}</priority>\n  </url>`).join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`Added ad policy pages and rebuilt ${items.length} indexed URLs.`);

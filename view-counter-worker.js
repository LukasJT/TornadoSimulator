const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.tornadosimulator.net',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

function cleanText(value, fallback, maxLength) {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, maxLength);
}

function cleanPath(value) {
  const path = String(value || '').trim();
  if (!/^\/[a-z0-9][a-z0-9/-]*\/$/i.test(path)) return '';
  if (path.includes('//') || path.startsWith('/assets/')) return '';
  return path;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'POST required' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const path = cleanPath(body.path);
    if (!path) return json({ error: 'Invalid path' }, 400);

    const title = cleanText(body.title, 'Tornado Hub', 140);
    const description = cleanText(body.description, '', 220);
    const category = cleanText(body.category, 'Article', 60);
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO page_views (path, title, description, category, views, updated_at)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(path) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        category = excluded.category,
        views = page_views.views + 1,
        updated_at = excluded.updated_at
    `).bind(path, title, description, category, now).run();

    const current = await env.DB.prepare('SELECT views FROM page_views WHERE path = ?')
      .bind(path)
      .first();

    const popular = await env.DB.prepare(`
      SELECT path, title, description, category, views
      FROM page_views
      WHERE path <> '/'
      ORDER BY views DESC, updated_at DESC
      LIMIT 8
    `).all();

    return json({
      path,
      views: current ? current.views : 1,
      popular: popular.results || []
    });
  }
};

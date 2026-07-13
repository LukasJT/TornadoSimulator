# Real View Counter

The site no longer invents trending article numbers. `assets/article-tracker.js` records local browser history and can send each page view to a real endpoint.

To enable global counts, deploy `view-counter-worker.js` as a Cloudflare Worker with a D1 database binding named `DB`, then set this before `assets/article-tracker.js` loads:

```html
<script>
  window.TORNADO_VIEW_COUNTER_ENDPOINT = 'https://your-worker.your-subdomain.workers.dev/';
</script>
```

Create the D1 table with:

```sql
CREATE TABLE IF NOT EXISTS page_views (
  path TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Article',
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
```

The endpoint returns the current page count plus a `popular` list. The homepage trending section only shows live view totals when that endpoint responds.

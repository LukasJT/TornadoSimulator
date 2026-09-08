# Tornado Hub design system

An editorial weather publication with a warm paper surface, dark forest ink, restrained oxide-red actions, Fraunces headings, and Inter interface text. Photography shows the actual subject; source and photographer credit sit beside each image.

The homepage uses a large photographic opening, an asymmetric editorial selection, a simulator feature, and compact topic directories. Articles use a narrow reading measure, large titles, generous section spacing, and collapsible contents. The shared shell preserves existing static routes and factual material. Navigation reduces the primary choices to Guides, Forecast, Games, Safety, Search, and Simulator; menu disclosure handles narrow screens and remains available without JavaScript.

Implementation lives in assets/site-shell.css and assets/site-shell.js. Run node work/redesign-site.mjs only when intentionally regenerating the homepage and applying the shell to legacy pages; it preserves existing content on all other routes. New static pages must link the shared stylesheet after their legacy styles and use the shared navigation. Keep dedicated simulation layouts independent of editorial overrides.

Do not add generic statistic strips, emoji illustrations, animated entrances, fabricated popularity labels, or process commentary. Advertising is separated from the opening content and from safety interpretation. Preserve photographic attribution, canonical tags, language metadata, and existing article text.

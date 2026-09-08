# Tornado Hub mobile alerts

This first PWA slice provides location-aware monitoring while the app is open. It checks the National Weather Service every 60 seconds for tornado and severe thunderstorm warnings at the device location, plus nearby tornado-warning polygons. Notification IDs are retained locally to avoid duplicates.

Closed-app background delivery requires a push backend. The next slice should add authenticated Web Push subscriptions, encrypted location cells rather than raw coordinates, a scheduled alert-ingestion worker, polygon-to-cell matching, VAPID signing, expiry cleanup, and delivery telemetry that contains no precise location. Native iOS and Android clients can reuse the same alert-matching contract.

The app must remain supplemental to Wireless Emergency Alerts, NOAA Weather Radio and official local warning systems.

#!/usr/bin/env python3
"""Refresh tornadoes/data.json with the latest tornado reports.

Sources:
  - NOAA SPC daily storm reports CSV (last 30 days)
  - Preserves the historical `ef5`, `deadliest`, and `yearly` sections
    that were curated by hand.

This script is designed to run in GitHub Actions with no external
dependencies beyond the Python standard library.
"""

import csv
import io
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = ROOT / "tornadoes" / "data.json"

SPC_URL_TEMPLATE = "https://www.spc.noaa.gov/climo/reports/{yymmdd}_rpts_torn.csv"

def fetch_url(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "TornadoHub/1.0 (+https://www.tornadosimulator.net/)"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")

def parse_spc_csv(csv_text, report_date):
    """Parse SPC storm reports CSV. Returns list of dicts."""
    events = []
    reader = csv.reader(io.StringIO(csv_text))
    header = None
    for row in reader:
        if not row: continue
        if row[0].lower() == "time":
            header = [c.strip().lower() for c in row]
            continue
        if header and len(row) >= len(header):
            rec = dict(zip(header, [c.strip() for c in row]))
            # Time is HHMM UTC. Combine with report_date to make ISO date.
            time_s = rec.get("time", "0000")
            try:
                hh = int(time_s[:2]); mm = int(time_s[2:])
            except (ValueError, IndexError):
                hh, mm = 12, 0
            # If time < 12Z it likely means "next-day report on late-day chase"
            # SPC reports cover a "convective day" from 12Z to 12Z.
            event_date = report_date
            if hh < 12:
                event_date = report_date + timedelta(days=1)
            dt = datetime(event_date.year, event_date.month, event_date.day, hh, mm, tzinfo=timezone.utc)

            # Column names from SPC: Time, F_Scale, Location, County, State, Lat, Lon, Comments
            events.append({
                "date": dt.isoformat(),
                "ef": rec.get("f_scale") or None,
                "location": rec.get("location") or "Unknown",
                "county": rec.get("county") or "",
                "state": rec.get("state") or "",
                "lat": rec.get("lat") or "",
                "lon": rec.get("lon") or "",
                "notes": (rec.get("comments") or "").strip(),
            })
    return events

def get_recent_reports(days=30):
    """Fetch SPC storm reports for the last `days` days."""
    all_events = []
    today = datetime.now(timezone.utc).date()
    for i in range(days):
        d = today - timedelta(days=i)
        yymmdd = d.strftime("%y%m%d")
        url = SPC_URL_TEMPLATE.format(yymmdd=yymmdd)
        try:
            text = fetch_url(url)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                # No reports for that day
                continue
            print(f"HTTP {e.code} for {url}")
            continue
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            continue
        try:
            events = parse_spc_csv(text, d)
            all_events.extend(events)
        except Exception as e:
            print(f"Parse error for {yymmdd}: {e}")
    return all_events

def dedupe_events(events):
    """Deduplicate by date+location+state."""
    seen = set()
    unique = []
    for e in events:
        key = (e["date"][:10], e["location"].lower(), e["state"].lower())
        if key not in seen:
            seen.add(key)
            unique.append(e)
    return unique

def main():
    # Load existing data (preserves the curated historical sections)
    if DATA_FILE.exists():
        current = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    else:
        current = {"recent": [], "ef5": [], "deadliest": [], "yearly": []}

    # Fetch recent reports (last 30 days)
    print("Fetching SPC storm reports (last 30 days)...")
    recent = get_recent_reports(days=30)
    recent = dedupe_events(recent)
    # Sort newest first
    recent.sort(key=lambda e: e["date"], reverse=True)
    # Cap at 100 entries so the JSON stays small
    recent = recent[:100]

    print(f"Got {len(recent)} recent tornado reports")

    # Update data
    current["recent"] = recent
    current["generated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Write back
    DATA_FILE.write_text(json.dumps(current, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {DATA_FILE}")

if __name__ == "__main__":
    main()
</content>
</invoke>
---
title: Strava Integration
description: Learn how to connect Journey Endurance Coaching Platform to Strava and sync your runs, rides, and swims automatically.
---

[Strava](https://strava.com) is the primary source for activity data in Journey Endurance Coaching Platform. Connecting your Strava account allows us to automatically sync your workouts for deep AI analysis.

## Setup Guide

1. Go to **Settings → Apps** on the Dashboard.
2. Click **Connect with Strava**.
3. Authorize Journey Endurance Coaching Platform to access your activities and profile.

::alert{type="info"}
Note: We only request access to your activities and basic profile data. We do not modify any of your Strava data.
::

## What Syncs?

- **Activities**: Distance, duration, heart rate, power, and GPS data.
- **Sync Speed**: Most activities appear in Journey Endurance Coaching Platform within seconds of being uploaded to Strava.

## Troubleshooting

### Activities not appearing

- Confirm the activity is uploaded to Strava (not just recorded on a device)
- Click **Sync** on the Dashboard
- Check **Settings → Apps** — connection should show as active

### Connection failed during OAuth

- Ensure you approve all requested permissions on Strava's authorization screen
- Try disconnecting and reconnecting from **Settings → Apps**

### Duplicate workouts with Garmin

If you also connect Garmin directly, the same ride may sync from both sources. Journey Endurance Coaching Platform deduplicates in most cases — consider using Strava OR Garmin as your primary activity source, not both.

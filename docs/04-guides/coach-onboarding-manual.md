# Journey Endurance Coaching Platform: Head Coach Onboarding Manual

Welcome to the Journey Endurance Coaching Platform platform! This manual is your living guide for onboarding new athletes and leveraging our custom technology stack. As we develop new features, this document will be updated.

---

## 1. The 4-Tier Athlete Journey

Journey Endurance Coaching Platform is built around a 4-tier funnel designed to support athletes at every stage of their journey. When onboarding an athlete, your first step is understanding their tier and the specific tech tools they have access to.

### Tier 1: FREE (Tri Nerds Guild)

**Target:** Beginners, community members, self-guided athletes.
**Tech & Tools Available:**

- **Community Calendar:** Access to team events and RSVP functionality.
- **One-Time AI 12-Week Plan:** Basic, static plan generation.
- **Pre-made Library:** Access to standard resources.
- **Synced/Pushed Workouts:** Basic push of standard workouts to their devices.
  **Coach Action:** Minimal intervention. Encourage Discord/Telegram participation.

### Tier 2: UNCOVER ($200/mo) _Most Popular_

**Target:** Athletes seeking structured team training and baseline physiology tracking.
**Tech & Tools Available:**

- **Team Program & Dashboard:** Access to the overarching team training blocks.
- **Weekly Check-In Form:** Athletes submit a weekly subjective wellness and training update.
- **Group Q&A:** Access to team-wide coach interactions.
- **Physiology Baselines:** Tracking basic physiological metrics.
  **Coach Action:** Review the Weekly Check-In form submissions on the Admin dashboard. Use this data to spot athletes who are struggling or excelling, and answer Group Q&A questions.

### Tier 3: UNLOCK ($350/mo) -

**Target:** Athletes needing highly individualized 1:1 coaching and dynamic adjustments.
**Tech & Tools Available:**

- **Custom 1:1 Coaching:** Fully personalized training blocks.
- **Daily Digital Twin AI & Chat:** Athletes have access to their "Digital Twin" AI assistant for day-to-day training adjustments and subjective wellness tracking.
- **Daily Check-In:** AI-driven daily feedback loops.
- **Glycogen Fuel Tank:** Advanced F2C fueling recommendations and race-day fuel planning.
- **Full Intervals.icu Sync:** Deep objective stress tracking (CTL, ATL, TSB).
- **Direct-to-Garmin Pushes:** Seamlessly push custom workouts to their watches.
  **Coach Action:** You are the human mentor. Monitor the AI's daily adjustments to ensure the athlete isn't overtraining. Leverage the Intervals.icu data on their profile to build custom 1:1 blocks. Engage directly with the athlete's daily subjective feedback.

### Tier 4: UNLEASH (Waitlist / Elite)

**Target:** Elite and professional athletes requiring maximum telemetry.
**Tech & Tools Available:**

- **Elite Telemetry & Live Energy Availability:** Real-time metabolic tracking.
- **Performance Scores & Executive AI Reports:** Highly detailed, multi-dimensional performance analysis.
  **Coach Action:** Act as a high-performance director. Use executive AI reports to make micro-adjustments to taper strategies and race-day execution.

---

## 2. Onboarding a New Athlete

When a new athlete joins the platform, follow this checklist:

1. **Assign the Correct Role:**
   - In the Admin Panel (or via CLI tools), ensure the user's role is correctly mapped to their subscription tier (`FREE`, `UNCOVER`, `UNLOCK`, or `UNLEASH`). This automatically gates their dashboard UI and feature access.
2. **Connect Integrations:**
   - Ensure the athlete has authorized **Intervals.icu** (for load tracking) and **Garmin/Strava** (for workout syncing).
3. **Establish Baselines (Uncover & Above):**
   - Direct the athlete to complete their initial physiology baselines (Heart Rate zones, FTP, etc.) so the AI and you have accurate anchor points.
4. **Introduce the Tech:**
   - For **Unlock** athletes, explicitly introduce them to their AI Co-Pilot. Explain that the AI handles daily micro-adjustments based on their subjective check-ins, while _you_ (the Coach) handle the macro-periodization and deep strategy.

---

## 3. Daily & Weekly Coach Workflows

### The Daily Review (For UNLOCK/UNLEASH)

- **Check the Dashboard:** Look for alerts triggered by the Daily Digital Twin AI. Has an athlete's subjective stress spiked? Did the AI reduce their volume today?
- **Review Telemetry:** Check Intervals.icu Form (TSB). If they are carrying too much fatigue, intervene or let the AI adjust tomorrow's session.

### The Weekly Review (For UNCOVER)

- **Weekly Check-In Dashboard:** Review all submitted weekly check-in forms.
- **Bulk Adjustments:** Make necessary adjustments to the Team Program based on general group fatigue or upcoming A-Races.

---

## 4. Troubleshooting & Manual Overrides

- **Task Execution:** If automated Telegram summaries or reminders fail to send, navigate to `/admin/cron` to view task logs or manually trigger a "Run Now".
- **AI Hallucinations:** If the AI Co-Pilot recommends a bizarre fueling strategy or workout adjustment, you can manually override the scheduled workout in the athlete's calendar and adjust their Glycogen fuel targets from their profile view.

---

_Note: This manual is a living document. As we integrate new open-source stat tracking, advanced F2C fueling logic, or Oura ring biometrics, this guide will be updated to reflect the latest coaching protocols._

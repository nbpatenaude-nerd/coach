# Journey Endurance - Development Handoff Summary

This document summarizes the recent features, architectural decisions, and database changes implemented for the **Coach Watts / Journey Endurance** platform. It is designed to get a new AI agent or developer fully up to speed on the current state of the codebase.

## 1. Landing Page & "Cosmic" UI Enhancements
*   **Cosmic Background (CosmicBackground.client.vue)**: Implemented a custom Three.js WebGL canvas background featuring 18,000 particles in a cylindrical arrangement with nebula clustering. It includes an infinite Z-loop and a "hyperspace stretch" effect tied to scroll velocity.
*   **Layout Fixes (pp/layouts/apply.vue)**: Created a dedicated transparent layout for the application pages so the WebGL background remains visible behind the content (the default home layout had an opaque background).
*   **Navigation & Routing**: Reordered the homepage components, fixed anchor links (e.g., /#programs), and updated CTA buttons to point to the respective tier application forms (/apply/unlock and /apply/unleash).

## 2. Application Forms & CRM Ingestion
*   **Unlock Form (/apply/unlock)**: Built a 4-section application form (Personal, Sport Profile, Experience, Goals) with a cyan glassmorphism theme, native range sliders for commitment levels, and a scrollspy sidebar.
*   **Unleash Form (/apply/unleash)**: Built a 4-section application form (Personal, History, Goals, Motivation) with a purple/indigo glassmorphism theme.
*   **CRM Lead Ingestion (server/api/apply/submit.post.ts)**: 
    *   When an unauthenticated user submits an application, the system automatically checks for an existing user or creates a "shadow" User record based on their email.
    *   It creates a CrmDeal in the "Lead" stage of the Sales Pipeline.
    *   The form answers are concatenated and logged as a CrmTask attached to the deal.

## 3. Custom Booking System (Unified Availability)
We replaced the need for Reclaim/Calendly by building a native multi-calendar booking system for coaches.

*   **Core Concept**: A coach can connect multiple Google accounts (e.g., personal, contractor work email). The system queries the Google Calendar reebusy API for all connected accounts, merges the busy intervals, and calculates available slots based on the coach's configured working hours and meeting types.
*   **Database Models Added (Prisma)**:
    *   CoachCalendarAccount: Stores Google OAuth tokens (ccessToken, efreshToken, expiresAt) for each connected calendar.
    *   MeetingType: Defines bookable sessions (slug, durationMins, ufferMins, leadTimeHours, conferenceUrl).
    *   CoachAvailabilityRule: Defines weekly day/time windows (e.g., Monday 09:00 to 17:00).
    *   Booking: Stores confirmed appointments.
*   **Google Integration (server/utils/googleCalendar.ts)**: Utility wrapper utilizing googleapis v180 to handle OAuth 2.0 flows, automatic token refreshing, and reebusy interval merging.
*   **Admin Dashboard (/admin/booking)**: A secure dashboard for coaches to:
    *   Initiate Google OAuth to connect/disconnect calendars.
    *   Toggle and set weekly availability hours.
    *   Create new meeting types.
    *   View and cancel upcoming bookings.
*   **Public Booking Page (/book/[slug].vue)**: A user-facing, 3-step scheduling flow (Date → Time → Details) that dynamically generates available slots by checking the database rules against the live Google Calendar busy times.
*   **Trigger.dev Integration (	rigger/book-appointment.ts)**: A background task triggered upon booking confirmation that creates a CRM Lead for the prospect and sends out confirmation emails.

## 4. Pending Setup / External Requirements
To fully utilize the new Booking System, the following external configurations are required:
*   **Google Cloud Console**: Ensure the Google OAuth app has the https://www.googleapis.com/auth/calendar.freebusy scope enabled.
*   **Environment Variables**: Ensure GOOGLE_CALENDAR_REDIRECT_URI is accurately set in the production environment (pointing to .../api/admin/booking/calendars/callback).

## 5. Next Steps / Backlog
*   **Cardio/Workout Library**: The user previously mentioned wanting to build out a Cardio/Workout library tool. This was left untouched in the backlog while prioritizing the booking system.
*   **Deploy Verification**: Monitor the production Railway database to ensure the booking migrations (which were manually deployed via a custom SQL script to bypass existing schema drift) are operating smoothly.

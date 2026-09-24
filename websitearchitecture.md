# Website Architecture & Deployment Strategy

## Overview

The Journey Endurance ecosystem is split into two primary experiences:

1. **The Coaching Platform**: The core Nuxt 4 web application where athletes log in, view their dashboards, interact with coaches/assistants, and connect fitness data.
2. **Tri Nerds (Marketing / Content)**: The public-facing blog/podcast/marketing site.

## Domain Structure

To achieve your desired routing, here is how the domains should be structured:

### 1. Coaching Platform

- **Production URL**: `https://app.journeyendurance.ca/`
- **What goes here**: The main Nuxt application hosted on Railway.
- **DNS Setup**: Create a `CNAME` record in your DNS provider for `app` pointing to your Railway deployment domain (e.g., `coach-production-187b.up.railway.app`).

### 2. Main Landing Page

- **Production URL**: `https://journeyendurance.ca/`
- **What goes here**: The primary marketing landing page. This is currently part of the Nuxt app (the `/` route). If you want it hosted on the root domain, you can point the apex domain (`@`) to Railway as well.
- **DNS Setup**: Point `A` records or `ALIAS`/`ANAME` records to Railway's provided IP/domain.

### 3. Tri Nerds Page

- **Preferred URL**: `https://trinerds.journeyendurance.ca/`
- **What goes here**: The Tri Nerds specific content.
- **trinerds.com Redirect**: You own `trinerds.com`. You should set up a **URL Redirect** (301 Permanent Redirect) at the domain registrar level for `trinerds.com` so that any traffic automatically forwards to `https://trinerds.journeyendurance.ca/`.
- **DNS Setup**:
  1. For `trinerds.journeyendurance.ca`: Create a `CNAME` pointing to wherever the Tri Nerds content is hosted (if it's a separate site/CMS) or point it to Railway if it's built into this Nuxt app as a specific page route.
  2. For `trinerds.com`: Use your registrar's "Domain Forwarding" feature to redirect to `https://trinerds.journeyendurance.ca/`.

## Authentication URLs (.env configuration)

When you move to `app.journeyendurance.ca`, your Nuxt Auth configuration must be updated.

### Live Production `.env` (on Railway)

```env
# Nuxt Auth Config
NUXT_AUTH_SECRET="your_secure_random_string"

# IMPORTANT: These must match your live domain!
NUXT_AUTH_ORIGIN="https://app.journeyendurance.ca/api/auth"
NUXT_PUBLIC_SITE_URL="https://app.journeyendurance.ca/"

# Email Service (Resend)
RESEND_API_KEY="re_..."
```

### Local Development `.env` (on your machine)

```env
# Nuxt Auth Config
NUXT_AUTH_SECRET="your_secure_random_string"

# IMPORTANT: These must match localhost!
NUXT_AUTH_ORIGIN="http://localhost:3099/api/auth"
NUXT_PUBLIC_SITE_URL="http://localhost:3099/"
```

_Note: You must also update your Google/Apple/Strava/Intervals OAuth Application settings to accept callbacks from `https://app.journeyendurance.ca/api/auth/callback/...` once you switch to the live domain._

## Infrastructure Stack

- **Hosting**: Railway (Node 24 environment)
- **Database**: PostgreSQL (Railway managed)
- **Framework**: Nuxt 4 (Vue 3)
- **Styling**: Tailwind CSS v4
- **Authentication**: Nuxt Auth / NextAuth.js
- **ORM**: Prisma

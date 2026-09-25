# Authentication

Journey Endurance Coaching Platform uses standard OAuth 2.0 with **PKCE (Proof Key for Code Exchange)** to secure user data.

**Human login (web IdP):** athletes sign in with **Sign in with Apple** (when configured), Google, **email magic link**, or Intervals.icu via Auth.js — see [sign-in-with-apple.md](./sign-in-with-apple.md). Strava is not offered on `/login` (connect it later under Settings → Apps). There is no first-party email/password login on `/login`. The official mobile app uses the OAuth2+PKCE API below after the athlete authenticates on `/oauth/login`.

### Email magic-link (legacy / existing accounts)

For athletes who already have an account but cannot use OAuth (for example a legacy `@telus.net` address), `/login` → **Sign in with Email** opens `/login/email`:

1. Athlete completes optional Cloudflare Turnstile (when `TURNSTILE_SECRET_KEY` / `NUXT_PUBLIC_TURNSTILE_SITE_KEY` are set) and submits their email.
2. `POST /api/auth/email-magic-link/request` with `{ email, returnTo?, turnstileToken? }` — always returns `{ success: true }` (anti-enumeration). If a non-deactivated user exists, the server mints a one-time token and emails the link. Rate-limited by IP and email. Honours `CW_DISABLE_EMAILS=1`.
3. Athlete opens the link → `GET /api/auth/email-magic-link/consume?code=…&returnTo=…` creates a web session cookie and redirects (default `/dashboard`). Expired or reused codes redirect to `/login`.

Support can still mint and send a link via CLI: `pnpm cw:cli users magic-link <email> --send`.

### Intervals.icu sign-in

Auth.js callback URL (must be registered on the Intervals OAuth app for client id `INTERVALS_CLIENT_ID`):

```
https://app.journeyendurance.ca/api/auth/callback/intervals
```

Local:

```
http://localhost:3099/api/auth/callback/intervals
```

`Invalid redirect_uri` means the Intervals developer console does not list that exact URL for the client. Update the Intervals app settings (or create a Journey-specific OAuth client) — no code change required once the URI matches.

## The Authorization Code Flow

1.  **Redirect** the user to the authorization endpoint.
2.  **Receive** the authorization code via callback.
3.  **Exchange** the code for an access token.

### 1. Request Authorization

Direct the user's browser to:

```http
GET /api/oauth/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_REDIRECT_URI
  &scope=profile:read workout:read
  &state=RANDOM_STRING
  &code_challenge=PKCE_CHALLENGE
  &code_challenge_method=S256
```

### 2. Handle Callback

If the user approves, they will be redirected to:

```
YOUR_REDIRECT_URI?code=AUTHORIZATION_CODE&state=RANDOM_STRING
```

### 3. Exchange Token

Make a server-side POST request to exchange the code:

```http
POST /api/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "YOUR_REDIRECT_URI",
  "code_verifier": "PKCE_VERIFIER"
}
```

**Response:**

```json
{
  "access_token": "...token...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...refresh...",
  "scope": "profile:read workout:read"
}
```

`expires_in` always refers to the access token lifetime.

`refresh_token_expires_in` may also be returned when the server is enforcing a refresh token lifetime. If present, it is the number of seconds until the refresh token expires.

Clients should always persist the latest `refresh_token` returned by the token endpoint. Future versions of the API may rotate refresh tokens during a successful refresh response.

### 4. Making Requests

Include the token in the Authorization header:

```http
GET /api/workouts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

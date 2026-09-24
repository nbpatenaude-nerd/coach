# Journey Endurance Coaching Platform OAuth 2.0 Demo Client

This is a minimal demonstration of how to integrate with the Journey Endurance Coaching Platform OAuth 2.0 Identity Provider.

## Setup

1.  **Register your app** in the Journey Endurance Coaching Platform Developer Portal (`/developer`).
2.  Add `http://localhost:3001/callback` to your **Redirect URIs**.
3.  Copy your **Client ID** and **Client Secret**.
4.  Create a `.env` file in this directory:

```env
NUXT_PUBLIC_COACH_WATTS_URL=http://localhost:3099
NUXT_COACH_WATTS_CLIENT_ID=your_client_id
NUXT_COACH_WATTS_CLIENT_SECRET=your_client_secret
NUXT_PUBLIC_REDIRECT_URI=http://localhost:3001/callback
```

## Running the Demo

1. Open a new terminal in this directory:

   ```bash
   cd clients/demo-nuxt
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the demo app:

   ```bash
   pnpm dev
   ```

4. Ensure the main Journey Endurance Coaching Platform app is running on port 3099:

   ```bash
   # In project root
   pnpm dev
   ```

5. Open your browser to `http://localhost:3001` and click "Login with Journey Endurance Coaching Platform".

## How it works

1.  **Authorization:** The user clicks "Login with Journey Endurance Coaching Platform", which redirects them to the Journey Endurance Coaching Platform authorize endpoint.
2.  **Consent:** Journey Endurance Coaching Platform validates the request and asks the user for permission.
3.  **Callback:** After approval, Journey Endurance Coaching Platform redirects back to `/callback` with an authorization code.
4.  **Token Exchange:** The demo app exchanges the code for an access token (and refresh token) via a server-side request.
5.  **Access Data:** The access token is used to fetch the user's profile from `/api/oauth/userinfo`.

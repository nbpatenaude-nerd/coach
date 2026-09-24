# Journey Endurance Coaching Platform Developer API

Welcome to the Journey Endurance Coaching Platform Developer Platform. You can build applications, integrations, and tools that interact with Journey Endurance Coaching Platform user data.

## Getting Started

1.  **Create an App:** Go to the [Developer Portal](/developer) to register your application.
2.  **Get Credentials:** Obtain your `client_id` and `client_secret`.
3.  **Implement OAuth:** Use the OAuth 2.0 flow to authenticate users.

## Core Concepts

- **[Authentication](./authentication.md):** How to authenticate users using OAuth 2.0.
- **[Scopes](./scopes.md):** Permissions your app can request.
- **[Syncing Data](./sync-data.md):** How to upload activity, wellness, and nutrition data.

## Base URL

All API requests should be made to:

```
https://app.coachwatts.com/api/
```

(Or `http://localhost:3099/api/` for local development)

## Rate Limiting

- Standard limit: 100 requests per minute per IP.
- Authenticated requests: 1000 requests per minute per token.

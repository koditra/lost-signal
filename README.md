# Lost Signal

A Hack Club YSWS about building ways to communicate without the internet or cellular networks. Build LoRa messengers, mesh networks, radio tools, offline chat, Bluetooth systems, or anything that can keep people connected when the internet is gone.

## RSVP capacity dashboard

The GitHub Pages site is a static HTML/CSS/JavaScript frontend. It polls a separate NestJS service for RSVP statistics; the browser never scrapes the RSVP site. The service fetches `https://rsvp.hackclub.community/lost-signal/stats`, validates the Lost Signal heading and RSVP description metadata, and serves:

```json
{
  "event": "Lost Signal",
  "rsvps": 51,
  "capacity": 120,
  "updatedAt": "2026-10-26T23:39:00.000Z",
  "stale": false
}
```

The count and timestamp above illustrate the response shape only; the count is retrieved from the source page on each cache refresh and is not stored in the frontend.

### Run the NestJS API locally

Requirements: Node.js 20 or later and npm.

```sh
cd backend
npm install
npm run start:dev
```

The API listens on port `3000` by default. Check it with:

```sh
curl -i http://localhost:3000/api/lost-signal/stats
```

`GET /api/lost-signal/stats` returns JSON with `event`, `rsvps`, `capacity`, `updatedAt`, and `stale`. If the source is unavailable and no successful cached result exists, it returns HTTP 503; it never substitutes a sample count.

### Configure the dashboard and CORS

The public backend origin is configured in [config.js](./config.js):

```js
window.LOST_SIGNAL_API_BASE_URL = "https://app.dermvision.tech";
```

This is the public HTTPS domain mapped to port `8123` on the VM. This file is public frontend configuration; do not put credentials, cookies, or private API keys here. GitHub Pages serves static files and does not inject runtime environment variables.

The API's `CORS_ORIGINS` environment variable is a comma-separated allowlist of exact origins. The defaults permit the GitHub Pages origin `https://koditra.github.io` and local static-site origins `http://localhost:5500` and `http://127.0.0.1:5500`. For a custom dashboard domain, add its origin explicitly, for example:

```sh
CORS_ORIGINS=https://koditra.github.io,https://your-custom-domain.example,http://localhost:5500,http://127.0.0.1:5500
```

An origin consists of scheme, hostname, and optional port, without a path. Configure the environment variable on the backend host; do not allow every origin in production.

### Capacity, refresh, and cache

- `RSVP_CAPACITY` sets the target capacity and defaults to `120`. It must be a positive safe integer. The API response is the source of truth for the display capacity.
- The backend caches successful source responses for five minutes (`RSVP_CACHE_TTL_MS` can override the duration in milliseconds).
- Simultaneous backend refreshes share one upstream request. If an expired cached result exists during an upstream failure, the API serves the last successful count and timestamp with `stale: true`. Cache data is in memory, resets when the process restarts, and is not shared across multiple backend instances.
- The frontend refreshes every five minutes and does not overlap its own requests. If a browser refresh fails after a valid response, it retains the last displayed data and labels it stale.
- `RSVP_TIMEOUT_MS` controls the upstream request timeout and defaults to 10 seconds.

### Deploy

Deploy the `backend/` NestJS project to the VM at `ash@hackclub.app`, with outbound HTTPS access and the app listening on `0.0.0.0:8123` (the VM's custom-domain mapping target). Configure `PORT=8123`, `CORS_ORIGINS=https://koditra.github.io,http://localhost:5500,http://127.0.0.1:5500`, and, optionally, `RSVP_CAPACITY=120` in the VM's app settings.

After SSHing into the VM, run this one-command deployment:

```sh
curl -fsSL https://raw.githubusercontent.com/koditra/lost-signal/main/backend/deploy-vm.sh | bash
```

The script clones or updates `/home/$USER/lost-signal-rsvp-api` by default, installs the backend dependencies, builds it, runs its tests, starts it with PM2 on port `8123`, saves the PM2 process list, and verifies the API locally. Override defaults only before the command if needed, for example:

```sh
export APP_DIR="$HOME/lost-signal-api"
export RSVP_CAPACITY="120"
export CORS_ORIGINS="https://koditra.github.io,http://localhost:5500"
curl -fsSL https://raw.githubusercontent.com/koditra/lost-signal/main/backend/deploy-vm.sh | bash
```

Verify `https://app.dermvision.tech/api/lost-signal/stats` responds with JSON before relying on the dashboard. If PM2 does not start automatically after a VM reboot, run `pm2 startup` and the single `sudo` command it prints, then run `pm2 save` once more.

Deploy the static site to GitHub Pages after setting the production API origin in `config.js`. The backend must be deployed separately; GitHub Pages cannot run NestJS.

### Troubleshooting

- **CORS error:** verify that the browser's exact origin (including scheme and port) is included in the backend's `CORS_ORIGINS`, then restart/redeploy the API.
- **Authentication or redirect response:** the API does not follow redirects or bypass authentication. If the source begins requiring a login, the service returns an error (or stale cached data) and must be given authorized public access by the source owner.
- **Network failure or timeout:** confirm that the backend can reach the source over HTTPS and increase `RSVP_TIMEOUT_MS` only if appropriate. With no prior successful result the endpoint returns 503; with cached data it marks the response stale.
- **Parsing error:** the source must return HTML containing an `h1` of `Lost Signal` and a description like `51 people RSVP'd for Lost Signal`. Unexpected markup is reported as an unavailable upstream result, not a made-up count.

### Tests and build

```sh
node --test tests/rsvp-dashboard.test.mjs
cd backend
npm test
npm run build
```

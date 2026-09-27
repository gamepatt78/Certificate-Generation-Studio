# Document Generator

Create internship offer letters and completion certificates, manage generated records, and verify credentials.

**Stack:** React · Vite · Express · SQLite

## Features

- Separate flows for offer letters and completion certificates
- Live document preview and sequential record IDs
- Searchable dashboard, record downloads, and public credential verification
- Company settings, custom assets, audit history, and database backups

## Quick Start

Use two terminals from the repository root.

**1. Start the API**

```powershell
cd server
npm ci
npm run dev
```

**2. Start the client**

```powershell
cd client
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The API listens on port `5000` by default. During development, Vite proxies API and generated-asset requests to the API server.

## Configuration

All environment variables are optional.

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `PORT` | API | `5000` | API listening port |
| `DATABASE_PATH` | API | `database/database.sqlite` | SQLite database location |
| `CLOUDINARY_CLOUD_NAME` | API | unset | Cloudinary account name for remote document storage |
| `CLOUDINARY_API_KEY` | API | unset | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | API | unset | Cloudinary API secret |
| `VITE_API_BASE_URL` | Client | same origin | Base URL when the API is hosted separately |
| `VITE_API_PROXY_TARGET` | Client | `http://localhost:5000` | Vite development proxy target |

For a separately hosted API, set `VITE_API_BASE_URL` before building the client. Use only the origin, without an `/api` suffix.

## Data and Storage

The API initializes the database on startup. Records receive sequential IDs, and generated files are organized under `generated/offer-letters/` and `generated/certificates/`. Uploaded assets are stored under `uploads/`; database backups are stored under `database/backups/`.

If a built-in template is unavailable, the generator uses a vector layout. A missing explicitly configured custom template returns an error.

## Checks

Run these commands from the repository root:

```powershell
npm run build --prefix client
npm run lint --prefix client
```

There is no automated test script in the package configuration. See [MANUAL_E2E_TEST_REPORT.md](MANUAL_E2E_TEST_REPORT.md) for user-flow testing outcomes and [BUG_REPORT.md](BUG_REPORT.md) for defect details and verification.

## Repository

The assessment starter is `SyedSameer24/Certificate-Generation-Studio`. This checkout's origin is `gamepatt78/Certificate-Generation-Studio`; confirm it is the intended repository before submitting.
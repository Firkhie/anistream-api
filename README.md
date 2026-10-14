<p align="center">
  <a href="https://anistream.catco.uno/">
    <img src="logo.png" alt="AniStream API Logo" width="180" height="180">
  </a>
</p>

<h1 align="center">
  AniStream API
</h1>

<p align="center">
  A high-performance, modular API backend for anime metadata, airing schedules, episode guides, and streaming sources.
</p>

<div align="center">
  <img src="https://img.shields.io/badge/Express-5.1.0-black?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Upstash_Redis-00E599?style=for-the-badge&logo=redis&logoColor=white" alt="Upstash Redis" />
  <img src="https://img.shields.io/badge/Vitest-3.2.4-FCC72B?style=for-the-badge&logo=vitest&logoColor=black" alt="Vitest" />
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<br />

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Design](#-architecture--design)
- [API Reference](#-api-reference)
  - [System & Health](#system--health)
  - [Presets & Discovery](#presets--discovery)
  - [Search & Catalog](#search--catalog)
  - [Anime Details & Cast](#anime-details--cast)
  - [Airing Schedule](#airing-schedule)
  - [Episodes & Streaming](#episodes--streaming)
- [Caching & Rate Limiting (Redis)](#-caching--rate-limiting-redis)
- [Deployment on Vercel](#-deployment-on-vercel)
- [Environment Variables](#-environment-variables)
- [Quick Start](#-quick-start)
- [Testing](#-testing)
- [License & Disclaimer](#-license--disclaimer)

---

## 🌟 Overview

**AniStream API** provides unified endpoints for anime information, episodes, and stream sources. It abstracts upstream data providers (AniList GraphQL, HiAnime, YumaAPI, AniZip) into a consistent schema, backed by intelligent fail-open caching and anti-spam protection.

> [!IMPORTANT]
> Self-hosting AniStream API is recommended for personal or production usage. Make sure to configure rate limiting and CORS properly when exposing endpoints publicly.

---

## ⚡ Key Features

- **🔌 Modular Provider Architecture**: Standardized provider interface (`IStreamingProvider`) with an automated fallback mechanism (`ProviderManager`). If one source fails, alternate providers are queried transparently.
- **⚡ Fail-Open Upstash Redis Caching**: Multi-tier cache-aside pattern (`getOrSetCache`). If Redis encounters downtime or network limits, the API never fails—it gracefully bypasses the cache and serves live data.
- **🛡️ Distributed Anti-Spam & Rate Limiting**: Combines `express-rate-limit` with Upstash Redis for coordinated IP rate limits across serverless instances, accompanied by bot shielding and CORS origin validation.
- **💓 Built-in Health & Redis Probing**: `/health` endpoint checks server uptime and verifies active connectivity to Upstash Redis (`redis.ping()`).
- **🧪 Comprehensive Test Suite**: 100% passing Vitest test suite covering routes, validation errors, provider mappings, health probes, and upstream failure handling.

---

## 📐 Architecture & Design

```text
anistream-api/
├── api/
│   └── index.ts                 # Vercel serverless function entrypoint
├── src/
│   ├── providers/               # Upstream data sources
│   │   ├── anilist/             # AniList GraphQL queries & services
│   │   ├── hianime/             # HiAnime scraper & decryptors
│   │   ├── yumaapi/             # YumaAPI extractor
│   │   ├── provider.interface.ts # Standardized IStreamingProvider interface
│   │   └── provider.manager.ts   # Multi-provider manager with fallback
│   ├── routers/                 # Express route handlers (/anime/...)
│   ├── mappers/                 # Data normalizers and DTO transformers
│   ├── utils/                   # Custom error classes (BadRequestError, etc.)
│   ├── app.ts                   # Express application setup, security, & rate limiting
│   ├── env.ts                   # Validated Zod environment configuration
│   ├── redis.ts                 # Resilient Upstash Redis client & cache helpers
│   └── index.ts                 # Standalone server listener (local/node)
├── test/                        # Vitest route & provider test suites
├── vercel.json                  # Vercel serverless URL rewrites
└── package.json
```

---

## 📡 API Reference

### System & Health

#### `GET /health`
Returns runtime status and validates Redis connectivity.
```json
{
  "status": "ok",
  "timestamp": "2026-10-14T03:00:00.000Z",
  "uptime": 154,
  "redis": "healthy"
}
```
*Note: If Redis is unconfigured, `"redis": "disabled"` is returned. If Redis is down, `"redis": "unreachable"` is returned while the API continues serving responses.*

---

### Presets & Discovery

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/anime/popular` | `page` (default: 1), `perPage` (default: 20) | Top popular anime for the current year & season. |
| `GET` | `/anime/trending` | `page` (default: 1), `perPage` (default: 20) | Currently trending anime ranked by viewer activity. |
| `GET` | `/anime/newest` | `page` (default: 1), `perPage` (default: 20) | Recently updated and releasing anime. |
| `GET` | `/anime/upcoming` | `page` (default: 1), `perPage` (default: 20) | Most anticipated upcoming anime titles. |

### Search & Catalog

#### `GET /anime/search`
Filter anime across multiple dimensions.

**Query Parameters:**
- `search` *(string)*: Anime title search keyword.
- `page` *(number, default: 1)*: Pagination page number.
- `perPage` *(number, default: 20)*: Number of items per page.
- `season` *(WINTER \| SPRING \| SUMMER \| FALL)*: Airing season.
- `seasonYear` *(number)*: Airing release year.
- `format` *(TV \| TV_SHORT \| MOVIE \| SPECIAL \| OVA \| ONA)*: Media format.
- `status` *(FINISHED \| RELEASING \| NOT_YET_RELEASED \| CANCELLED \| HIATUS)*: Airing status.
- `genres` *(comma-separated strings)*: e.g. `Action,Comedy,Fantasy`.
- `sort` *(comma-separated)*: `POPULARITY_DESC`, `TRENDING_DESC`, `SCORE_DESC`, `START_DATE_DESC`, etc.
- `averageScoreGreater` / `averageScoreLesser` *(number, 0-100)*: Score threshold filtering.

### Anime Details & Cast

#### `GET /anime/detail/:id`
Retrieves full anime metadata, relations, recommendations, and studios.
- **Params**: `id` *(AniList media ID)*.
- **Cache TTL**: 24 hours.

#### `GET /anime/detail/:id/characters`
Retrieves character cast and voice actors with multi-language data.
- **Params**: `id` *(AniList media ID)*.
- **Query Parameters**: `page` (default: 1), `perPage` (default: 50).
- **Cache TTL**: 3 days.

### Airing Schedule

#### `GET /anime/airing`
Retrieves upcoming airing schedule episodes within a timeframe.
- **Query Parameters**: `days` (default: 7), `page` (default: 1), `perPage` (default: 20).
- **Cache TTL**: 3 hours.

### Episodes & Streaming

#### `GET /anime/episodes/:id`
Retrieves episode listings for an anime.
- **Params**: `id` *(AniList media ID)*.
- **Query Parameters**: `provider` (`anilist` \| `hianime` \| `yumaapi`, default: `anilist`).

#### `GET /anime/servers`
Retrieves available streaming servers for a given episode ID.
- **Query Parameters**: `id` *(Episode identifier)*.

#### `GET /anime/stream`
Resolves playable HLS stream URLs and subtitle tracks.
- **Query Parameters**:
  - `id` *(string)*: Episode identifier.
  - `source` *(string)*: `hianime` or `yumaapi`.
  - `server` *(string, optional)*: Server key (e.g. `hd-1`, `hd-2`).
  - `type` *(string, optional)*: `sub` or `dub`.

---

## 💾 Caching & Rate Limiting (Redis)

AniStream API integrates **Upstash Redis** (`@upstash/redis`) using a **fail-open** design:

1. **Cache-Aside (`getOrSetCache`)**:
   - High-cost GraphQL queries (Details, Cast, Airing Schedules, Presets) are automatically cached with tailored TTLs.
   - If Redis credentials are unset or the network fails, queries execute normally without throwing errors.
2. **Distributed Rate Limiting**:
   - Behind reverse proxies (e.g., Vercel, Cloudflare), `trust proxy` extracts true client IPs from `X-Forwarded-For`.
   - Redis tracks request quotas globally (default: 60 requests/minute per IP) across serverless instances and cold starts.
   - Falls back to in-memory `express-rate-limit` when Redis is unconfigured.
3. **Bot & Scraper Shield**:
   - In production, automated scraping tools (`curl`, `python-requests`, `aiohttp`, `scrapy`, etc.) are blocked unless accessing `/health` or providing an `x-api-key` header matching `API_SECRET_KEY`.

---

## ☁️ Deployment on Vercel

AniStream API is pre-configured for seamless deployment as a Vercel Serverless Function:

1. The repository includes `api/index.ts` exporting the Express application and `vercel.json` routing all requests to `/api`.
2. Connect your GitHub repository to Vercel and set Framework Preset to **Other**.
3. Add your Environment Variables in the Vercel Project Settings:
   - `PORT`: `3000` (or omitted)
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
   - `UPSTASH_REDIS_REST_URL`: `https://your-database.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `your-token`
4. Deploy! Vercel automatically routes endpoints such as `/health`, `/anime/popular`, etc.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port & Mode
PORT=3000
NODE_ENV=development

# Allowed CORS Origins (comma-separated or * for public access)
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app

# Optional Shared Secret Key for Backend-to-Backend calls
API_SECRET_KEY=

# Optional Upstash Redis for distributed caching & rate limiting
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/Firkhie/anistream-api.git
cd anistream-api

# Install dependencies
pnpm install

# Setup environment
cp .env.sample .env
```

### Running Locally

```bash
# Development mode with hot-reload
pnpm run dev

# Build TypeScript
pnpm run build

# Start production build
pnpm run start
```

---

## 🧪 Testing

The test suite runs with Vitest:

```bash
# Run all tests
pnpm test

# Type checking
pnpm run typecheck

# Code formatting & linting
pnpm run lint
```

---

## 📄 License & Disclaimer

- **Disclaimer**: AniStream API does not store any video files or proprietary media. Content is fetched and parsed from public sources. Ensure compliance with upstream terms before deployment.
- **License**: Released under the [MIT License](LICENSE).
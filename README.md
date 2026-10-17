<p align="center">
  <a href="https://github.com/Firkhie/anistream-api">
    <img src="logo.png" alt="AniStream API Logo" width="160" height="160" />
  </a>
</p>

# <p align="center">AniStream API</p>

<div align="center">
  A high-performance, modular, and resilient RESTful API for anime metadata, airing schedules, episode guides, and character databases.

  <br />
  <br />

  <div>
    <a href="https://github.com/Firkhie/anistream-api/issues/new?template=bug_report.md">Bug Report</a>
    ·
    <a href="https://github.com/Firkhie/anistream-api/issues/new?template=feature_request.md">Feature Request</a>
  </div>
</div>

<br />

<div align="center">

[![Express 5](https://img.shields.io/badge/Express-5.1.0-black?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-00E599?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.4-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Vercel Serverless](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

<br />

> [!WARNING]
> **API SERVICE ONLY — THE FRONTEND APPLICATION IS PRIVATE**  
> This repository (`anistream-api`) contains **ONLY the backend REST API service**, not the website itself. The front-end web application repository (`anistream`) is currently private. Only `anistream-api` is open-source and publicly accessible.  
> You can deploy this API to power your own custom anime discovery web apps, mobile clients, Discord bots, or metadata services.

> [!IMPORTANT]
> 1. **Information & Metadata API Focus**: This API provides comprehensive anime information, seasonal charts, episode guides, character cast details, and airing countdown schedules via AniList GraphQL and AniZip.
> 2. **Stream Sources Notice**: Upstream third-party video scraping sources (`/anime/servers` and `/anime/stream`) are currently **inactive / deprecated** because the original scraping sources are offline. The route handlers remain in the repository as architectural stubs for developers who wish to plug in custom streaming scrapers via `IStreamingProvider`.
> 3. **Fail-Open Architecture**: Built-in Upstash Redis caching operates with a fail-open strategy. If Redis is unconfigured or experiences network downtime, the API transparently bypasses the cache and continues serving live data without crashing.

> [!CAUTION]
> AniStream API does not host, store, or upload any video files or media on its servers. It aggregates public metadata from AniList GraphQL and AniZip. Please ensure compliance with the terms of service of upstream providers and your local regulations.

---

## <span id="table-of-contents">📋 Table of Contents</span>

- [Key Features](#-key-features)
- [Architecture & Modular Providers](#-architecture--modular-providers)
- [Installation & Quick Start](#-installation--quick-start)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Configuration & Environment Variables](#️-configuration--environment-variables)
- [Host Your Instance](#-host-your-instance)
  - [Vercel (Serverless)](#vercel-serverless)
  - [Render / Node.js Standalone](#render--nodejs-standalone)
- [Documentation & API Reference](#-documentation--api-reference)
  - [`GET /health` (System Diagnostics)](#get-health)
  - [`GET /anime/popular` (Top Popular)](#get-animepopular)
  - [`GET /anime/trending` (Trending Now)](#get-animetrending)
  - [`GET /anime/newest` (New Releases)](#get-animenewest)
  - [`GET /anime/upcoming` (Upcoming Titles)](#get-animeupcoming)
  - [`GET /anime/airing` (Airing Schedule)](#get-animeairing)
  - [`GET /anime/random` (Random Title)](#get-animerandom)
  - [`GET /anime/search` (Advanced Search)](#get-animesearch)
  - [`GET /anime/base/:id` (Basic Metadata)](#get-animebaseid)
  - [`GET /anime/detail/:id` (Full Details)](#get-animedetailid)
  - [`GET /anime/detail/:id/characters` (Cast & Voice Actors)](#get-animedetailidcharacters)
  - [`GET /anime/episodes/:id` (Episode List)](#get-animeepisodesid)
  - [`GET /anime/servers` (Legacy / Inactive)](#get-animeservers)
  - [`GET /anime/stream` (Legacy / Inactive)](#get-animestream)
- [Caching & Rate Limiting (Redis)](#-caching--rate-limiting-redis)
- [Development & Testing](#-development--testing)
- [License & Disclaimer](#-license--disclaimer)

---

## ⚡ Key Features

- **📖 Complete Anime Metadata Engine**: Rich GraphQL integration with AniList and AniZip delivering high-fidelity anime metadata, episode listings, character details, and live broadcast countdown schedules.
- **🔌 Pluggable Architecture**: Modular provider pattern (`IStreamingProvider` / `ProviderManager`) designed so developers can plug in custom scraper engines. *(Note: Upstream video streaming scrapers are currently inactive due to source deprecation)*.
- **⚡ Fail-Open Upstash Redis Caching**: Multi-tier cache-aside pattern (`getOrSetCache`). Automatically caches heavy GraphQL queries (Details, Characters, Schedules, Presets). If Redis experiences network limits or downtime, requests bypass the cache and fetch live data without interrupting users.
- **🛡️ Distributed Rate Limiting & Anti-Spam**: Combines Upstash Redis with `express-rate-limit` for sliding-window IP limits (default: 60 req/min) that stay synchronized across serverless cold starts.
- **🤖 Built-in Bot & Scraper Shielding**: Automated HTTP clients (`curl`, `python-requests`, `aiohttp`, `scrapy`, etc.) are blocked in production unless accessing `/health` or authenticated with an `x-api-key` header matching `API_SECRET_KEY`.
- **💓 Runtime Health & Redis Probing**: `/health` endpoint tracks server uptime and actively validates Redis connectivity via `redis.ping()`.
- **🧪 100% Passing Vitest Suite**: Comprehensive test suite covering route responses, parameter validations, upstream errors, and provider failover logic.

---

## 📐 Architecture & Modular Providers

```
anistream-api/
├── api/
│   └── index.ts                 # Vercel serverless function entrypoint
├── src/
│   ├── providers/               # Metadata providers & scraper modules
│   │   ├── anilist/             # Active AniList GraphQL service
│   │   ├── anizip/              # Active AniZip metadata & episode mapping
│   │   ├── hianime/             # Legacy HiAnime scraper module
│   │   ├── yumaapi/             # Legacy YumaAPI extractor module
│   │   ├── provider.interface.ts # Standardized IStreamingProvider interface
│   │   └── provider.manager.ts   # Fallback manager with priority ranking
│   ├── routers/                 # Express route definitions (/anime/...)
│   ├── mappers/                 # Data normalizers and DTO transformers
│   ├── utils/                   # Custom error classes (BadRequestError, UpstreamError)
│   ├── app.ts                   # Express 5 app setup, security, & middlewares
│   ├── env.ts                   # Validated Zod environment configuration
│   ├── redis.ts                 # Resilient Upstash Redis client & cache helpers
│   └── index.ts                 # Standalone Node.js server listener
├── test/                        # Vitest integration & unit test suites
├── vercel.json                  # Vercel serverless URL rewrites
└── package.json
```

---

## 💻 Installation & Quick Start

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Firkhie/anistream-api.git
   cd anistream-api
   ```

2. **Install dependencies** (pnpm recommended):
   ```bash
   pnpm install
   # or npm install / yarn install
   ```

3. **Configure your environment**:
   ```bash
   cp .env.sample .env
   ```

4. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   The API will be running locally at `http://localhost:3000`. Test it by opening `http://localhost:3000/health`.

### Docker Setup

You can containerize and run AniStream API using either **Docker Compose** (recommended) or the standalone Docker CLI:

#### Option 1: Docker Compose (Quickest)
```bash
# 1. Ensure your .env is created
cp .env.sample .env

# 2. Build and start the container in detached mode
docker compose up -d
```

#### Option 2: Docker CLI
```bash
# 1. Build the Docker image from local Dockerfile
docker build -t anistream-api .

# 2. Run the container on port 3000 with your environment variables
docker run -d --name anistream-api -p 3000:3000 --env-file .env anistream-api
```
The server will now be accessible at `http://localhost:3000/health`.

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the project root:

```env
# Server Port & Mode
PORT=3000
NODE_ENV=development

# Allowed CORS Origins (comma-separated domains, or * for public access)
ALLOWED_ORIGINS=http://localhost:3000,https://anistream.catco.uno

# Optional Secret Key for protected backend calls or bypassing the bot blocker
API_SECRET_KEY=your_optional_secret_key

# Optional Upstash Redis for distributed caching & rate limiting
UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `3000` | Port for the standalone Express server. |
| `NODE_ENV` | `string` | `development` | Environment mode (`development` or `production`). |
| `ALLOWED_ORIGINS` | `string` | `*` | Comma-separated list of allowed web origins for CORS. |
| `API_SECRET_KEY` | `string` | `""` | Optional token for bypassing rate limits and bot shielding via `x-api-key`. |
| `UPSTASH_REDIS_REST_URL` | `string` | `""` | REST URL for Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | `string` | `""` | REST token for Upstash Redis database. |

---

## ⛅ Host Your Instance

### Vercel (Serverless)

AniStream API is designed out-of-the-box for zero-configuration Vercel Serverless deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Firkhie/anistream-api&env=ALLOWED_ORIGINS,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&envDescription=Optionally+specify+allowed+CORS+domains+and+Upstash+Redis+caching+credentials)

1. Click the **Deploy with Vercel** button above.
2. Sign in to your Vercel account and select your Git provider to clone the repository.
3. *(Optional)* Configure environment variables if prompted:
   - `ALLOWED_ORIGINS`: Comma-separated domains allowed to call the API (defaults to `*` for all domains if left empty).
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Upstash credentials if you want serverless Redis response caching.
4. Click **Deploy**. Vercel will automatically configure the serverless function handler via `vercel.json` and `api/index.ts`.

### Render / Node.js Standalone

Deploy to Render or any standard Linux VPS / container environment:

1. Build the production TypeScript code:
   ```bash
   pnpm run build
   ```
2. Start the production listener:
   ```bash
   pnpm run start
   ```

---

## 📚 Documentation & API Reference

All endpoints return standard JSON and appropriate HTTP status codes (`200 OK`, `400 Bad Request`, `404 Not Found`, `502 Bad Gateway`).

<details>
<summary><h3>GET /health</h3></summary>

#### Description
Returns system diagnostics, uptime, and active connectivity status to Upstash Redis.

#### Endpoint
```http
GET /health
```

#### Request Sample
```javascript
const res = await fetch("https://your-api.vercel.app/health");
const data = await res.json();
console.log(data);
```

#### Response Schema
```json
{
  "status": "ok",
  "timestamp": "2026-10-18T04:00:00.000Z",
  "uptime": 245.8,
  "redis": "healthy"
}
```
*Note: If Redis is unconfigured, `"redis": "disabled"` is returned. If Redis is unreachable, `"redis": "unreachable"` is returned while the API continues to function.*

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/popular</h3></summary>

#### Description
Retrieves the most popular anime titles for the current season and year.

#### Endpoint
```http
GET /anime/popular?page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | Page number for pagination | No | `1` |
| `perPage` | `number` | Total titles to return per page | No | `20` |

#### Request Sample
```javascript
const res = await fetch("https://your-api.vercel.app/anime/popular?page=1&perPage=10");
const data = await res.json();
```

#### Response Schema
```json
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": 16498,
      "title": {
        "romaji": "Shingeki no Kyojin",
        "english": "Attack on Titan",
        "native": "進撃の巨人"
      },
      "coverImage": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5luJwwJnPLW.png",
      "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498.jpg",
      "format": "TV",
      "rating": 84,
      "currentEpisode": 25,
      "totalEpisodes": 25,
      "status": "FINISHED"
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/trending</h3></summary>

#### Description
Retrieves currently trending anime ranked by recent viewer engagement.

#### Endpoint
```http
GET /anime/trending?page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | Page number for pagination | No | `1` |
| `perPage` | `number` | Total titles to return per page | No | `20` |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/newest</h3></summary>

#### Description
Retrieves newly released, recently updated, and currently airing titles.

#### Endpoint
```http
GET /anime/newest?page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | Page number for pagination | No | `1` |
| `perPage` | `number` | Total titles to return per page | No | `20` |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/upcoming</h3></summary>

#### Description
Retrieves the most anticipated upcoming anime titles scheduled for future seasons.

#### Endpoint
```http
GET /anime/upcoming?page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | Page number for pagination | No | `1` |
| `perPage` | `number` | Total titles to return per page | No | `20` |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/airing</h3></summary>

#### Description
Retrieves the weekly airing broadcast schedule for currently airing series with upcoming episode numbers and Unix broadcast timestamps.

#### Endpoint
```http
GET /anime/airing?days={days}&page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `days` | `number` | Number of upcoming schedule days to query | No | `7` |
| `page` | `number` | Page number for pagination | No | `1` |
| `perPage` | `number` | Total schedule items per page | No | `20` |

#### Response Schema
```json
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": 154587,
      "title": { "english": "Frieren: Beyond Journey's End", "romaji": "Sousou no Frieren" },
      "coverImage": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n1HJZ2sR0uD3.jpg",
      "nextAiringEpisode": {
        "airingAt": 1729252800,
        "episode": 28,
        "timeUntilAiring": 3600
      }
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/random</h3></summary>

#### Description
Returns full metadata for a randomly selected anime title.

#### Endpoint
```http
GET /anime/random
```

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/search</h3></summary>

#### Description
Multi-criteria filter and keyword search across the catalog.

#### Endpoint
```http
GET /anime/search?query={keyword}&genres={genres}&format={format}&status={status}&year={year}&season={season}&sort={sort}&page={page}&perPage={perPage}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `query` | `string` | Search keyword for title | No | — |
| `genres` | `string` | Comma-separated genres (e.g. `Action,Fantasy`) | No | — |
| `format` | `string` | `TV`, `TV_SHORT`, `MOVIE`, `SPECIAL`, `OVA`, `ONA` | No | — |
| `status` | `string` | `FINISHED`, `RELEASING`, `NOT_YET_RELEASED`, `CANCELLED` | No | — |
| `year` | `number` | Release year (e.g. `2024`) | No | — |
| `season` | `string` | `WINTER`, `SPRING`, `SUMMER`, `FALL` | No | — |
| `sort` | `string` | `POPULARITY_DESC`, `TRENDING_DESC`, `SCORE_DESC`, `START_DATE_DESC` | No | `POPULARITY_DESC` |
| `page` | `number` | Page number | No | `1` |
| `perPage` | `number` | Results per page | No | `20` |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/base/:id</h3></summary>

#### Description
Retrieves compact title and basic metadata for an anime by AniList ID.

#### Endpoint
```http
GET /anime/base/:id
```

#### Path Parameters
| Parameter | Type | Description | Required? |
| :--- | :--- | :--- | :--- |
| `id` | `number` \| `string` | AniList anime ID | Yes |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/detail/:id</h3></summary>

#### Description
Retrieves comprehensive details including synopsis, genres, studios, airing status, prequel/sequel relations, and recommendations.

#### Endpoint
```http
GET /anime/detail/:id
```

#### Path Parameters
| Parameter | Type | Description | Required? |
| :--- | :--- | :--- | :--- |
| `id` | `number` \| `string` | AniList anime ID | Yes |

#### Response Schema
```json
{
  "id": 21,
  "idMal": 21,
  "title": {
    "romaji": "ONE PIECE",
    "english": "ONE PIECE",
    "native": "ONE PIECE"
  },
  "coverImage": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDuy1vdLgz7.jpg",
  "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJ5A0b.jpg",
  "description": "Gol D. Roger was known as the Pirate King...",
  "status": "RELEASING",
  "rating": 88,
  "currentEpisode": 1122,
  "genres": ["Action", "Adventure", "Comedy", "Drama", "Fantasy"],
  "studios": ["Toei Animation"],
  "relations": [],
  "recommendations": []
}
```

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/detail/:id/characters</h3></summary>

#### Description
Retrieves characters, roles (Main / Supporting), and corresponding voice actors across multiple languages.

#### Endpoint
```http
GET /anime/detail/:id/characters?page={page}&perPage={perPage}
```

#### Path Parameters
| Parameter | Type | Description | Required? |
| :--- | :--- | :--- | :--- |
| `id` | `number` \| `string` | AniList anime ID | Yes |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/episodes/:id</h3></summary>

#### Description
Retrieves the consolidated episode guide for an anime title. Automatically matches episode identifiers with titles, descriptions, and screencap thumbnails via AniZip.

#### Endpoint
```http
GET /anime/episodes/:id?provider={provider}
```

#### Path Parameters
| Parameter | Type | Description | Required? |
| :--- | :--- | :--- | :--- |
| `id` | `number` \| `string` | AniList anime ID | Yes |

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `provider` | `string` | Upstream scraper (`anilist`, `hianime`, `yumaapi`) | No | `hianime` |

#### Response Schema
```json
{
  "totalEpisodes": 12,
  "episodes": [
    {
      "id": "hianime-episode-id",
      "episode": 1,
      "title": "To You, in 2000 Years",
      "image": "https://artworks.thetvdb.com/banners/v4/episode/.../screencap.jpg",
      "description": "The Colossal Titan appears..."
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/servers ⚠️ (Legacy / Inactive)</h3></summary>

> [!WARNING]
> **Upstream Sources Offline**: This route is currently **inactive** because the third-party upstream video sources are offline. This endpoint is retained in the codebase as an architectural reference for custom `IStreamingProvider` implementations.

#### Description
Retrieves available streaming server IDs and categories (`sub`, `dub`, `raw`) for an episode.

#### Endpoint
```http
GET /anime/servers?id={episodeId}&provider={provider}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Episode identifier from `/anime/episodes/:id` | Yes | — |
| `provider` | `string` | Provider name (`hianime`, `yumaapi`) | No | `hianime` |

[🔼 Back to Top](#table-of-contents)
</details>

<details>
<summary><h3>GET /anime/stream ⚠️ (Legacy / Inactive)</h3></summary>

> [!WARNING]
> **Upstream Sources Offline**: Video stream extraction is currently **inactive** because the original scraping sources have ceased operation. In consumer applications (like `anistream`), users are redirected to official / external guides. This route handler remains available for developers implementing their own streaming provider modules.

#### Description
Resolves playable HLS (`.m3u8`) streaming sources and subtitle tracks for a specified episode and server.

#### Endpoint
```http
GET /anime/stream?id={episodeId}&server={server}&type={sub|dub}&source={provider}
```

#### Query Parameters
| Parameter | Type | Description | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Episode identifier | Yes | — |
| `server` | `string` | Streaming server name (e.g. `hd-1`, `hd-2`, `megacloud`) | No | `hd-1` |
| `type` | `string` | Audio category (`sub` or `dub`) | No | `sub` |
| `source` | `string` | Scraper provider (`hianime`, `yumaapi`) | No | `hianime` |

#### Response Schema
```json
{
  "headers": {
    "Referer": "https://megacloud.tv/",
    "User-Agent": "Mozilla/5.0 ..."
  },
  "sources": [
    {
      "url": "https://.../master.m3u8",
      "isM3U8": true,
      "quality": "auto"
    }
  ],
  "subtitles": [
    {
      "lang": "English",
      "url": "https://.../subtitles/en.vtt"
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)
</details>

---

## 💾 Caching & Rate Limiting (Redis)

AniStream API features an enterprise-grade caching and protection layer:

1. **Fail-Open Redis Cache (`getOrSetCache`)**:
   - Heavy responses (details, character lists, schedules, and presets) are cached in Upstash Redis with tailored TTLs (from 3 hours for schedules to 72 hours for cast metadata).
   - If Redis runs out of quota or encounters network errors, the client silently catches the error, fetches the live data, and serves the user without disruption.
2. **IP Rate Limiting**:
   - Behind reverse proxies (e.g. Vercel, Cloudflare), `trust proxy` inspects client IPs from `X-Forwarded-For`.
   - Redis coordinates a rolling 60 requests/minute quota per IP. When Redis is absent, it falls back cleanly to an in-memory sliding window.
3. **Automated Bot Shield**:
   - Common command-line scrapers (`curl`, `wget`, `python-requests`, `aiohttp`, `scrapy`, `go-http-client`) are blocked in production unless they query `/health` or present a valid `x-api-key`.

---

## 🧪 Development & Testing

Run the Vitest test suite and TypeScript static verification:

```bash
# Run all unit and integration tests
pnpm test

# Run TypeScript type-checker
pnpm run typecheck

# Build the production bundle
pnpm run build
```

---

## 📄 License & Disclaimer

- **License**: Released under the [MIT License](LICENSE).
- **Disclaimer**: AniStream API does not host, store, or index any video files. All stream references and metadata are scraped or proxied from publicly accessible third-party services. Respect copyright and upstream terms of service.
# Meridian Labs — Digital Engineering Studio (Client Demo)

Full-stack TypeScript + React + Express web application for **Meridian Labs**, featuring an interactive landing experience, case-study portfolio, technology constellation, engineering workflow, inquiry validation, and a multi-modal Gemini AI Studio.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (`motion/react`), GSAP, Lucide Icons
- **Backend:** Express 4, Node.js WebSocket (`ws`), `@google/genai` SDK
- **Build & Tooling:** Vite (client bundle -> `dist/`), `esbuild` (server bundle -> `server.js`), `tsx` (dev & tests)

## Prerequisites

- **Node.js** v20+ (tested on Node v22)
- **npm** v10+ (or **Bun**)

## Environment Setup

Copy `.env.example` to `.env` before starting locally:

```bash
cp .env.example .env
```

Set `GEMINI_API_KEY` inside `.env` to enable the Multi-Modal Gemini Studio endpoints (`/api/gemini/chat`, `/api/gemini/transcribe`, and `/api/live`).  
If `GEMINI_API_KEY` is omitted, the rest of the website works normally and the AI Studio displays a clear configuration notice rather than crashing.

## Available Commands

```bash
# Install dependencies
npm install

# Run development server (Express + Vite HMR middleware on port 3000)
npm run dev

# Type-check TypeScript
npm run lint

# Run unit tests
npm test

# Build frontend (dist/) and compile production server (server.js)
npm run build

# Start compiled production server (serves dist/ + API + WebSocket on PORT or 3000)
npm start

# Remove compiled build outputs
npm run clean
```

## API Endpoints

- `GET /api/health` — Returns `{ ok: true, configured: boolean }`
- `POST /api/gemini/chat` — Server-Sent Events (SSE) multi-turn streaming Gemini chat with role personas and model routing
- `POST /api/gemini/transcribe` — Audio transcription (`audioBase64` + `mimeType`) via `gemini-3.5-transcribe`
- `WS /api/live` — Bidirectional WebSocket audio/text proxy to Gemini Live API (`gemini-3.8-live`)

## Notes for Client Demo Customization

- Business details, portfolio projects, FAQs, optional `contactApiEndpoint`, and optional `office.googleMapsEmbedUrl` live in `src/data/siteData.ts`.
- Never commit `.env` or expose `GEMINI_API_KEY` in frontend code (`VITE_*` variables).

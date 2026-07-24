# FitForge AI

An AI-powered fitness and nutrition platform. Users register, complete a fitness profile,
and generate personalized workout and meal plans via Fetch.ai agents, then save and manage
those plans from a personal dashboard.

See [specs/001-fitforge-mvp/spec.md](specs/001-fitforge-mvp/spec.md) for the full feature
specification, [plan.md](specs/001-fitforge-mvp/plan.md) for the technical design, and
[quickstart.md](specs/001-fitforge-mvp/quickstart.md) for end-to-end validation scenarios.

## Live deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://fitforge-ai-iota.vercel.app |
| Backend API (Render) | https://fitforge-backend-5kuf.onrender.com |
| Backend health check | https://fitforge-backend-5kuf.onrender.com/health |
| Agents service (Render) | https://fitforge-agents.onrender.com |
| Agents health check | https://fitforge-agents.onrender.com/health |

The agents service is internal — the backend is its only caller; the URL above is listed
for operational visibility, not for direct end-user or browser use. Both Render services run
on the free tier, which spins down after ~15 minutes of inactivity; the first request after
an idle period may take up to a minute while the service cold-starts.

## Architecture

Three deployable units, per the project constitution's four-layer architecture
(`.specify/memory/constitution.md`):

- **`frontend/`** — React + TypeScript + Vite + Bootstrap 5. Talks to Firebase only for
  authentication; all profile/plan data goes through the backend. Deployed to **Vercel**.
- **`backend/`** — Node.js + Express + TypeScript. The sole gateway to Firestore (via the
  Firebase Admin SDK) and to the Fetch.ai agent layer. Deployed to **Render** as a web
  service.
- **`agents/`** — Python + `uagents`. Two agents (workout, meal) that generate plans,
  reachable only from the backend. Deployed to **Render** as a second, separate web service
  (a `uagents` Bureau shares one HTTP server/port across both agents).

Firebase (Authentication + Firestore) is a managed service, not a directory in this repo.

## Prerequisites

- Node.js 20+ and npm
- Python 3.9+ and pip
- A Firebase project with the **email/password** Authentication provider and **Firestore**
  enabled (Firebase Console → Authentication → Sign-in method, and → Firestore Database).
  This one-time setup step must be done manually in the Firebase Console.
- (Optional, for local testing without a real Firebase project) the Firebase Emulator Suite:
  `npx firebase-tools emulators:start --only auth,firestore`

## Setup

Each project has its own `.env.example` — copy it to `.env` and fill in real values:

```bash
cp frontend/.env.example frontend/.env   # Firebase Web SDK config + backend URL
cp backend/.env.example backend/.env     # Firebase Admin credentials + agent URLs
cp agents/.env.example agents/.env       # Bureau port
```

Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../agents && python -m venv .venv && source .venv/Scripts/activate && pip install -r requirements.txt
```

## Run locally

Start all three in separate terminals (in this order — agents and backend before frontend):

```bash
# 1. Agents — runs both workout and meal agents behind one shared port (see agents/.env)
cd agents && source .venv/Scripts/activate && python -m src.bureau

# 2. Backend
cd backend && npm run dev

# 3. Frontend
cd frontend && npm run dev
```

Then open the frontend's dev server URL (typically http://localhost:5173).

## Production deployment

The repo root `render.yaml` is a Render **Blueprint** that provisions both the backend and
agents services in one step:

1. On [Render](https://dashboard.render.com): **New +** → **Blueprint** → select this repo.
   Render reads `render.yaml` and creates two web services, `fitforge-backend` (Node,
   `rootDir: backend`) and `fitforge-agents` (Python, `rootDir: agents`), each with a
   `/health` check.
2. Fill in the backend's secret env vars (marked `sync: false` in `render.yaml`) in the
   Render dashboard — never in the repo:

   | Env var | Purpose |
   |---|---|
   | `FIREBASE_PROJECT_ID` | Firebase Admin SDK credential |
   | `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK credential |
   | `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK credential |
   | `CORS_ORIGIN` | The deployed frontend's origin (production Vercel URL) |
   | `WORKOUT_AGENT_URL` | `https://<agents-service-url>/workout/generate` |
   | `MEAL_AGENT_URL` | `https://<agents-service-url>/meal/generate` |

3. On [Vercel](https://vercel.com): import the repo with **Root Directory** set to
   `frontend`. Vercel auto-detects the Vite framework preset. `frontend/vercel.json`
   rewrites all paths to `index.html` so refreshing a client-side route (e.g. `/dashboard`)
   doesn't 404. Set these production env vars in the Vercel project settings:

   | Env var | Purpose |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | Firebase Web SDK config |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Web SDK config |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase Web SDK config |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Web SDK config |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Web SDK config |
   | `VITE_FIREBASE_APP_ID` | Firebase Web SDK config |
   | `VITE_API_BASE_URL` | The deployed backend's base URL (Render) |

4. If the frontend's domain changes, update the backend's `CORS_ORIGIN` on Render and
   redeploy — Render redeploys automatically on env var changes.

No secret values live in this repository at any point; every credential above is entered
directly into the Render/Vercel dashboards.

## Quality gates

Per the project constitution's Development Workflow & Quality Gates, both `frontend/` and
`backend/` must pass before merging:

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes on the AI agents

The workout and meal agents in this MVP use deterministic, template-based generation logic
(keyed off fitness goal, activity level, experience, and dietary preference) rather than a
call to a hosted LLM — this keeps the agent layer fully offline-runnable for local
development and testing. The `uagents` REST contract (`contracts/agent-api.md`) is the
integration point; swapping in a model-backed generator later does not require changing the
backend or frontend, only the agents' internal `_build_plan` implementations.

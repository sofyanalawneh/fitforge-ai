# Phase 0 Research: FitForge AI MVP

All items below were technical decisions implied by the spec and constitution but not fully
pinned down; each is resolved here so Phase 1 design has no open unknowns.

## 1. Backend ↔ Fetch.ai agent communication pattern

**Decision**: The Express backend calls each Fetch.ai agent (workout, meal) over plain HTTP,
hitting a REST endpoint the agent exposes via `uagents`' built-in `@agent.on_rest_post`
handler. Both agents run in a single local `Bureau` process for the MVP. A `uagents` `Bureau`
serves all of its member agents from **one shared HTTP server bound to one port** — it
overwrites each agent's own endpoint/port when added — so the two agents are told apart by
REST **path** rather than by port: `/workout/generate` and `/meal/generate` on the Bureau's
single `BUREAU_PORT`. This was confirmed against the installed `uagents` source
(`Bureau.__init__` forces a single `_port`/`ASGIServer`) during implementation, after an
earlier draft of this decision incorrectly assumed each agent kept its own port under a
Bureau.

**Rationale**: `uagents` supports exposing a synchronous REST handler directly on an agent,
which lets the backend make a normal request/response HTTP call instead of implementing the
asynchronous Almanac/mailbox message-passing protocol meant for agent-to-agent discovery.
This matches constitution Principle IV (backend is the only caller) and Principle I
(simplicity — no message broker or Agentverse registration needed for an MVP with exactly two
known, first-party agents). Distinct REST paths are a minimal way to disambiguate two agents
sharing one Bureau port, with no additional infrastructure.

**Alternatives considered**:
- *Agentverse-hosted agents with mailbox messaging*: gives discoverability and hosting, but
  adds asynchronous message correlation and an external hosting dependency the MVP does not
  need yet. Deferred until multi-agent discovery or third-party agents are required.
- *Direct frontend → agent HTTP calls*: rejected outright — violates constitution Principle IV
  and FR-014 (backend must be the sole gateway).

## 2. Firebase Authentication verification on the backend

**Decision**: The frontend uses the Firebase Web SDK for sign-up/sign-in and attaches the
user's Firebase ID token as a `Authorization: Bearer <token>` header on every backend request.
The backend verifies each token per-request with the Firebase Admin SDK
(`getAuth().verifyIdToken`) in Express middleware; no separate backend session store.

**Rationale**: Firebase ID tokens are self-verifying JWTs, so per-request verification needs
no shared session state, keeping the backend stateless (constitution Principle I) while
satisfying Principle III (Firebase Auth as sole identity boundary).

**Alternatives considered**:
- *Server-side session cookies (Firebase session cookie API)*: adds cookie/session lifecycle
  management with no MVP benefit over token verification; deferred.

## 3. Firestore data model shape

**Decision**: One document per user at `users/{uid}` holding the fitness profile fields
directly. Saved plans live in a subcollection `users/{uid}/plans/{planId}`, each with a
`type` field (`workout` | `meal`), the generated content, a snapshot of the profile fields
used to generate it, and a `createdAt` timestamp.

**Rationale**: Subcollections scope naturally to Firestore Security Rules keyed on
`request.auth.uid` (constitution Principle III) and avoid a top-level `plans` collection that
would need an extra `ownerId` filter on every query.

**Alternatives considered**:
- *Top-level `plans` collection with an `ownerId` field*: workable but requires composite
  indexes and more defensive security rules for the same result; rejected as unnecessary
  complexity for the MVP's scale.

## 4. Plan generation vs. save lifecycle

**Decision**: Generation is a stateless backend call — the backend proxies the request to the
relevant agent and returns the result directly to the frontend without writing to Firestore.
Only when the user explicitly saves (FR-016/FR-017) does the backend write a document into
`users/{uid}/plans`.

**Rationale**: Matches the spec's explicit review-then-save flow (Assumptions section) and
keeps unsaved generations free of storage/cleanup concerns.

**Alternatives considered**:
- *Auto-save every generation, delete unsaved ones later*: would need a cleanup/GC job for
  abandoned drafts, adding complexity the MVP doesn't need (constitution Principle I).

## 5. Testing frameworks

**Decision**: Vitest + React Testing Library for the frontend; Vitest + Supertest for backend
route/contract tests; pytest for the two Python agents.

**Rationale**: Vitest is the natural fit for a Vite-based TypeScript frontend and shares
config/tooling with a TypeScript backend; Supertest is the standard way to exercise Express
routes without a running server; pytest is the standard choice for Python agent logic.

**Alternatives considered**:
- *Jest*: viable equivalent for both TS projects, but Vitest's native Vite integration avoids
  a second bundler config; not a significant difference either way, Vitest chosen for
  consistency across both TS projects.

## 6. Firestore Security Rules approach

**Decision**: Default-deny rules; `users/{uid}` and `users/{uid}/plans/{planId}` are readable
and writable only when `request.auth.uid == uid`. No client-side write path is granted for
fields the backend alone should set (e.g., `createdAt`), enforced via rule-level field checks.

**Rationale**: Directly implements constitution Principle III ("Firestore Security Rules MUST
default-deny and grant access only to the owning user").

**Alternatives considered**: None — this is a direct constitutional requirement, not an
open design choice.

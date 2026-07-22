<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (first concrete adoption; template placeholders replaced)
Added sections:
  - Core Principles: I. Simplicity & YAGNI, II. Observability & Logging,
    III. Security & Data Privacy, IV. Modular Architecture & Separation of Concerns
  - Technology Stack (formerly [SECTION_2_NAME])
  - Development Workflow & Quality Gates (formerly [SECTION_3_NAME])
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section already
    derives gates dynamically from this file — no hardcoded principle names to update)
  - .specify/templates/spec-template.md ✅ (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ (no constitution-specific references)
  - .claude/skills/speckit-*/SKILL.md ✅ (no stale agent-specific naming found)
Follow-up TODOs: None
-->

# FitForge AI Constitution

## Core Principles

### I. Simplicity & YAGNI

Start with the simplest solution that satisfies the current, active requirement.
New abstractions, configuration options, or extensibility layers MUST NOT be
introduced speculatively — they require a concrete, present need. Three similar
lines of code are preferred over a shared abstraction built for a hypothetical
future case. Any added complexity (a new service, a new layer, a new dependency)
MUST be justified in the relevant plan's Complexity Tracking section against a
simpler alternative that was considered and rejected.

**Rationale**: A small team building across four distinct layers (React frontend,
Express backend, Firebase, Fetch.ai agents) accumulates accidental complexity
fastest at the seams between those layers. Defaulting to the simplest option
keeps those seams legible.

### II. Observability & Logging

Every backend request path (Express routes) and every agent handler (Fetch.ai
uAgents) MUST emit structured logs at entry, on error, and at key decision
points, including a correlation identifier (request id or agent message id).
Errors MUST propagate with enough context — operation, relevant entity id,
stack trace — to diagnose without local reproduction. Silent failures (empty
catch blocks, swallowed rejections, discarded agent error responses) are NOT
permitted.

**Rationale**: The AI agent layer runs out-of-process from the backend, so
failures there are invisible unless deliberately surfaced; structured,
correlated logs are the only way to trace a request across the Express →
Fetch.ai boundary.

### III. Security & Data Privacy

User health, nutrition, and fitness data MUST be treated as sensitive personal
data. Firebase Authentication is the sole identity boundary: no endpoint or
Firestore access path may serve or accept user-scoped data without a verified
auth token. Firestore Security Rules MUST default-deny and grant access only
to the owning user or an explicitly authorized service account. Secrets
(Firebase service account keys, Agentverse/ASI:One API keys) MUST be supplied
via environment configuration and MUST NOT be committed to the repository.
Personal fitness/nutrition data passed to or returned from Fetch.ai agents
MUST NOT be logged or persisted outside Firestore without explicit,
documented justification.

**Rationale**: Fitness and nutrition data is health-adjacent personal data;
a breach or leak carries real user harm, and the multi-service architecture
(Firebase + external agent network) multiplies the places a leak could occur.

### IV. Modular Architecture & Separation of Concerns

The system MUST maintain clear boundaries between four layers: (1) the
React/TypeScript/Vite frontend, (2) the Node.js/Express/TypeScript backend
API, (3) Firebase services (Firestore, Authentication), and (4) the Python
Fetch.ai uAgents/Agentverse layer. The frontend MUST reach Firebase only
through the Firebase client SDK (for auth state and permitted reads) and MUST
reach the AI agent layer only through the backend API — never directly.
Cross-layer communication MUST go through explicit, typed contracts (REST
endpoint schemas, or uAgents message models) rather than one layer reaching
into another's internals.

**Rationale**: With four technologically distinct layers, undisciplined
cross-calls (e.g., frontend talking to Fetch.ai directly) quickly produce
duplicated auth logic and untestable coupling; a single backend chokepoint
keeps each layer independently replaceable and testable.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Bootstrap 5
- **Backend**: Node.js, Express.js, TypeScript
- **Data & Auth**: Firebase Firestore, Firebase Authentication
- **AI Agents**: Python, Fetch.ai uAgents, Agentverse, ASI:One (optional)

Changing any element of this stack (e.g., replacing Firebase, adopting a
different agent framework) is an architectural decision and requires a
constitution amendment, not an incidental implementation choice made inside
a feature plan.

## Development Workflow & Quality Gates

- Every feature MUST have a spec (`spec.md`) and plan (`plan.md`) produced via
  the Spec Kit workflow before implementation begins.
- Changes touching Firestore Security Rules or authentication flows MUST be
  reviewed with security as the primary review lens before merge.
- TypeScript strict mode MUST remain enabled in both frontend and backend
  projects; any use of `any` requires an inline comment justifying it.
- Feature branches MUST pass linting and type-checking before merge.
- The Constitution Check in each feature's `plan.md` MUST be completed before
  Phase 0 research begins, and re-checked after Phase 1 design.

## Governance

This constitution supersedes ad hoc conventions and prior undocumented
practice. All feature plans and pull requests MUST verify compliance with
the Core Principles above; any unresolved violation MUST be justified in the
plan's Complexity Tracking section or the change MUST be rejected.

Amendments require: (1) a documented rationale for the change, (2) a version
bump following semantic versioning — MAJOR for backward-incompatible principle
removals or redefinitions, MINOR for a new principle or materially expanded
guidance, PATCH for wording or clarification fixes — and (3) a propagation
check across `.specify/templates/*.md` and installed `speckit-*` skills to
catch any now-outdated references.

**Version**: 1.0.0 | **Ratified**: 2026-07-20 | **Last Amended**: 2026-07-20

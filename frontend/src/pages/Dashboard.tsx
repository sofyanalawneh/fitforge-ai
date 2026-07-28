import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/apiClient";
import type { Plan } from "../types";
import { LoadingState } from "../components/LoadingState";
import { PlanImage } from "../components/PlanImage";
import { StatusAlert } from "../components/StatusAlert";
import { EmptyState } from "../components/EmptyState";
import { PlanTypeBadge } from "../components/PlanTypeBadge";
import { IconDumbbell, IconLayoutGrid, IconSalad, IconTrash } from "../components/icons";
import { formatDateTime } from "../utils/format";
import { MEAL_PLACEHOLDER, WORKOUT_PLACEHOLDER, getPlanCoverCandidates } from "../utils/planImages";

/** Walks the plan list in order and, for each plan, picks the first cover
 * candidate not already used by an earlier card — falling back to that
 * plan's top-preferred candidate if every candidate collides. Deterministic
 * given a stable plan list order (GET /api/plans sorts most-recent-first),
 * so covers stay stable across refreshes while still "attempting" distinct
 * covers when two plans share the same candidate images. */
function assignDistinctCovers(plans: Plan[]): Map<string, string> {
  const used = new Set<string>();
  const covers = new Map<string, string>();
  for (const plan of plans) {
    const candidates = getPlanCoverCandidates(plan);
    const pick = candidates.find((src) => !used.has(src)) ?? candidates[0];
    covers.set(plan.planId, pick);
    used.add(pick);
  }
  return covers;
}

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiClient
      .get<{ plans: Plan[] }>("/api/plans")
      .then(({ plans }) => setPlans(plans))
      .catch(() => setError("Could not load your saved plans."));
  }

  useEffect(load, []);

  async function handleDelete(planId: string) {
    try {
      await apiClient.delete(`/api/plans/${planId}`);
      setPlans((prev) => (prev ? prev.filter((p) => p.planId !== planId) : prev));
    } catch {
      setError("Could not delete this plan. Please try again.");
    }
  }

  const workoutCount = plans?.filter((p) => p.type === "workout").length ?? 0;
  const mealCount = plans?.filter((p) => p.type === "meal").length ?? 0;

  return (
    <div className="container ff-page ff-page-wide">
      <div className="ff-page-header">
        <span className="ff-eyebrow">
          <IconLayoutGrid /> Dashboard
        </span>
        <h1>{firstName ? `Welcome, ${firstName} 👋` : "Welcome 👋"}</h1>
        <p>All your saved workout and meal plans in one place.</p>
      </div>

      {error && <StatusAlert variant="danger">{error}</StatusAlert>}

      {!error && plans === null && <LoadingState label="Loading your plans..." />}

      {!error && plans !== null && plans.length === 0 && (
        <EmptyState title="No saved plans yet">
          <p>
            Generate a <Link to="/generate/workout">workout plan</Link> or a{" "}
            <Link to="/generate/meal">meal plan</Link> to get started.
          </p>
        </EmptyState>
      )}

      {!error && plans !== null && plans.length > 0 && (
        <>
          <div className="stat-row">
            <div className="stat-card">
              <span className="stat-card-icon tone-brand">
                <IconLayoutGrid />
              </span>
              <div>
                <div className="stat-value">{plans.length}</div>
                <div className="stat-label">Saved plans</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon tone-workout">
                <IconDumbbell />
              </span>
              <div>
                <div className="stat-value">{workoutCount}</div>
                <div className="stat-label">Workout plans</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon tone-meal">
                <IconSalad />
              </span>
              <div>
                <div className="stat-value">{mealCount}</div>
                <div className="stat-label">Meal plans</div>
              </div>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-2 g-3">
            {(() => {
              const covers = assignDistinctCovers(plans);
              return plans.map((plan, index) => (
              <div
                className="col ff-animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
                key={plan.planId}
              >
                <div
                  className={`card-ff card-ff-interactive h-100 ${
                    plan.type === "workout" ? "accent-workout" : "accent-meal"
                  }`}
                >
                  <div className="card-ff-body d-flex flex-column">
                    <PlanImage
                      src={covers.get(plan.planId) ?? WORKOUT_PLACEHOLDER}
                      alt={`${plan.type === "workout" ? "Workout" : "Meal"} plan thumbnail`}
                      variant="card"
                      fallbackSrc={plan.type === "meal" ? MEAL_PLACEHOLDER : undefined}
                    />
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <PlanTypeBadge type={plan.type} />
                      <button
                        className="btn btn-outline-ff-danger btn-sm"
                        onClick={() => handleDelete(plan.planId)}
                      >
                        <IconTrash />
                        Delete
                      </button>
                    </div>
                    <Link to={`/plans/${plan.planId}`} className="fw-semibold mb-1 text-decoration-none">
                      {plan.content.summary}
                    </Link>
                    <div className="text-muted small mt-auto pt-2">{formatDateTime(plan.createdAt)}</div>
                  </div>
                </div>
              </div>
              ));
            })()}
          </div>
        </>
      )}
    </div>
  );
}

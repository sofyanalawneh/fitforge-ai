import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../services/apiClient";
import type { FitnessProfile, Plan, WorkoutPlanContent } from "../../types";
import { formatDateTime } from "../../utils/format";
import { computeDailyTargets } from "../../utils/mealStats";
import { DashboardCard } from "../../components/material/DashboardCard";
import { EmptyState } from "../../components/material/EmptyState";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { MetricCard } from "../../components/material/MetricCard";
import { QuickActionCard } from "../../components/material/QuickActionCard";
import { SectionHeader } from "../../components/material/SectionHeader";

const WEEKLY_PLAN_TARGET = 5;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function MaterialDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);

  useEffect(() => {
    apiClient
      .get<{ plans: Plan[] }>("/api/plans")
      .then(({ plans }) => setPlans(plans))
      .catch(() => setPlans([]));
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => undefined);
  }, []);

  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const initial = firstName?.charAt(0).toUpperCase() || "?";

  const mostRecentWorkout = plans?.find((p) => p.type === "workout") ?? null;
  const todaysWorkoutLabel = mostRecentWorkout
    ? (mostRecentWorkout.content as WorkoutPlanContent).weeklySchedule[0]?.focus ?? "Saved plan"
    : "No plan yet";
  const targets = profile ? computeDailyTargets(profile) : null;

  const weekStart = Date.now() - MS_PER_WEEK;
  const plansThisWeek = plans?.filter((p) => new Date(p.createdAt).getTime() >= weekStart) ?? [];
  const workoutsThisWeek = plansThisWeek.filter((p) => p.type === "workout").length;
  const mealsThisWeek = plansThisWeek.filter((p) => p.type === "meal").length;
  const weeklyProgressPct = Math.min(100, Math.round((plansThisWeek.length / WEEKLY_PLAN_TARGET) * 100));

  return (
    <MaterialContainer>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, mb: 4 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, fontSize: 22 }}>{initial}</Avatar>
        <Box>
          <Typography variant="h4" component="h1">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </Typography>
          <Typography color="text.secondary">Here's where your training and nutrition stand today.</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            role={mostRecentWorkout ? "button" : undefined}
            tabIndex={mostRecentWorkout ? 0 : undefined}
            onClick={mostRecentWorkout ? () => navigate(`/plans/${mostRecentWorkout.planId}`) : undefined}
            onKeyDown={(e) => {
              if (mostRecentWorkout && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                navigate(`/plans/${mostRecentWorkout.planId}`);
              }
            }}
            sx={{
              height: "100%",
              cursor: mostRecentWorkout ? "pointer" : "default",
              borderRadius: "16px",
              "&:focus-visible": mostRecentWorkout
                ? { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 }
                : undefined,
            }}
          >
            <MetricCard
              icon={<FitnessCenterRoundedIcon />}
              accentColor="#3457d5"
              label="Today's Workout"
              value={todaysWorkoutLabel}
              tooltip={todaysWorkoutLabel}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            icon={<LocalFireDepartmentRoundedIcon />}
            accentColor="#ff5a36"
            label="Calories Goal"
            value={targets ? `${targets.calories} kcal` : "Complete profile"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            icon={<RestaurantRoundedIcon />}
            accentColor="#1a9c6b"
            label="Protein Goal"
            value={targets ? `${targets.protein} g` : "Complete profile"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            icon={<TrendingUpRoundedIcon />}
            accentColor="#8a4fd6"
            label="Weekly Progress"
            value={`${plansThisWeek.length} of ${WEEKLY_PLAN_TARGET} plans`}
            footer={<LinearProgress variant="determinate" value={weeklyProgressPct} sx={{ borderRadius: 999, height: 6 }} />}
          />
        </Grid>
      </Grid>

      <SectionHeader title="Quick Actions" />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <QuickActionCard
            icon={<FitnessCenterRoundedIcon />}
            title="Generate Workout"
            description="Create a new AI-generated workout plan built around your fitness goal and experience."
            buttonLabel="Generate Workout"
            onClick={() => navigate("/generate/workout")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <QuickActionCard
            icon={<RestaurantRoundedIcon />}
            title="Generate Meal Plan"
            description="Create a new AI-generated meal plan tailored to your goal and dietary preference."
            buttonLabel="Generate Meal Plan"
            onClick={() => navigate("/generate/meal")}
          />
        </Grid>
      </Grid>

      <SectionHeader title="Recent Activity" />
      <DashboardCard sx={{ mb: 4 }}>
        {plans === null ? (
          <Stack spacing={1.5}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={<FitnessCenterRoundedIcon fontSize="large" />}
            title="No saved plans yet"
            description="Generate a workout or meal plan to see your recent activity here."
            actionLabel="Generate a workout"
            onAction={() => navigate("/generate/workout")}
          />
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid rgba(20,22,31,0.06)" }} />} spacing={1.5}>
            {plans.slice(0, 5).map((plan) => (
              <Box
                key={plan.planId}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/plans/${plan.planId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/plans/${plan.planId}`);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1,
                  px: 1,
                  mx: -1,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "background-color 0.12s ease",
                  "&:hover": { bgcolor: "rgba(20,22,31,0.03)" },
                  "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <Chip
                    size="small"
                    label={plan.type === "workout" ? "Workout" : "Meal"}
                    color={plan.type === "workout" ? "info" : "success"}
                  />
                  <Typography noWrap sx={{ maxWidth: { xs: 160, sm: 340 } }}>
                    {plan.content.summary}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, pl: 2, whiteSpace: "nowrap" }}>
                  {formatDateTime(plan.createdAt)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </DashboardCard>

      <SectionHeader title="Progress" />
      <DashboardCard>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Workout plans this week
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (workoutsThisWeek / 3) * 100)}
              sx={{ borderRadius: 999, height: 8, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Meal plans this week
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (mealsThisWeek / 3) * 100)}
              color="success"
              sx={{ borderRadius: 999, height: 8 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {profile && <Chip label={profile.fitnessGoal.replace("_", " ")} />}
              {profile && <Chip label={profile.workoutExperience} variant="outlined" />}
              <Chip label={`${plans?.length ?? 0} total plans`} variant="outlined" />
            </Stack>
          </Grid>
        </Grid>
      </DashboardCard>
    </MaterialContainer>
  );
}

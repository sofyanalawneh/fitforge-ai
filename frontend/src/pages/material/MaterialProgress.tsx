import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { apiClient } from "../../services/apiClient";
import type { Plan } from "../../types";
import { formatDateTime } from "../../utils/format";
import { DashboardCard } from "../../components/material/DashboardCard";
import { EmptyState } from "../../components/material/EmptyState";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { MetricCard } from "../../components/material/MetricCard";
import { SectionHeader } from "../../components/material/SectionHeader";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

/** Real, honest metrics only — every number here is derived directly from
 * the user's saved plans (GET /api/plans). This app has no
 * workout-completion or weight-history tracking, so no streaks, adherence
 * percentages, or charts are shown; a chart library isn't justified by a
 * handful of saved plans. */
export function MaterialProgress() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    apiClient
      .get<{ plans: Plan[] }>("/api/plans")
      .then(({ plans }) => setPlans(plans))
      .catch(() => setPlans([]));
  }, []);

  if (plans === null) {
    return (
      <MaterialContainer maxWidth="md">
        <SectionHeader title="Progress" />
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
        </Stack>
      </MaterialContainer>
    );
  }

  if (plans.length === 0) {
    return (
      <MaterialContainer maxWidth="sm">
        <SectionHeader title="Progress" />
        <DashboardCard>
          <EmptyState
            icon={<TrendingUpRoundedIcon fontSize="large" />}
            title="Nothing to show yet"
            description="Generate and save a workout or meal plan to start building your progress history."
            actionLabel="Generate a workout"
            onAction={() => navigate("/generate/workout")}
          />
        </DashboardCard>
      </MaterialContainer>
    );
  }

  const workoutPlans = plans.filter((p) => p.type === "workout");
  const mealPlans = plans.filter((p) => p.type === "meal");

  const now = Date.now();
  const plansThisWeek = plans.filter((p) => now - new Date(p.createdAt).getTime() <= MS_PER_WEEK).length;
  const plansThisMonth = plans.filter((p) => now - new Date(p.createdAt).getTime() <= MS_PER_MONTH).length;

  const mostRecent = plans[0];

  return (
    <MaterialContainer maxWidth="md">
      <SectionHeader title="Progress" />
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        A summary of your saved plans — real numbers only, based on what you've generated so far.
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<TrendingUpRoundedIcon />}
            accentColor="#8a4fd6"
            label="Total Plans"
            value={plans.length}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<FitnessCenterRoundedIcon />}
            accentColor="#3457d5"
            label="Workout Plans"
            value={workoutPlans.length}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<RestaurantRoundedIcon />}
            accentColor="#1a9c6b"
            label="Meal Plans"
            value={mealPlans.length}
          />
        </Grid>
      </Grid>

      <DashboardCard sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Activity over time
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Plans saved this week: {plansThisWeek}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (plansThisWeek / 5) * 100)}
          sx={{ borderRadius: 999, height: 8, mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Plans saved this month: {plansThisMonth}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (plansThisMonth / 20) * 100)}
          color="secondary"
          sx={{ borderRadius: 999, height: 8 }}
        />
      </DashboardCard>

      <DashboardCard>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Most recent plan
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography color="text.secondary">{mostRecent.content.summary}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(mostRecent.createdAt)}
          </Typography>
        </Box>
      </DashboardCard>
    </MaterialContainer>
  );
}

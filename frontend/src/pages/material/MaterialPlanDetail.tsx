import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { apiClient } from "../../services/apiClient";
import type { MealEntry, MealPlanContent, Plan, WorkoutPlanContent } from "../../types";
import { formatEnumLabel } from "../../utils/format";
import { getExerciseInfo, summarizeMuscleGroups } from "../../utils/exerciseInfo";
import { computeDailyTotals } from "../../utils/mealStats";
import { MEAL_PLACEHOLDER, WORKOUT_PLACEHOLDER, getMealImage, getWorkoutDayImages } from "../../utils/planImages";
import { computeWorkoutDurationRange } from "../../utils/workoutStats";
import { DashboardCard } from "../../components/material/DashboardCard";
import { EmptyState } from "../../components/material/EmptyState";
import { MaterialContainer } from "../../components/material/MaterialContainer";

// Real generated meal slots are named "Breakfast" / "Lunch" / "Dinner" /
// "Snack" (see agents/src/meal_agent.py's _MEAL_OPTIONS_BY_GOAL) — the
// backend never stores a clock time, so this is a display-only convention
// for a plausible time-of-day, not tracked data.
const MEAL_TIME_LABEL: Record<string, string> = {
  breakfast: "8:00 AM",
  lunch: "12:30 PM",
  dinner: "7:00 PM",
  snack: "3:30 PM",
};

function mealTimeLabel(mealName: string): string | undefined {
  return MEAL_TIME_LABEL[mealName.trim().toLowerCase()];
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <DashboardCard>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </DashboardCard>
  );
}

/** Fetches a saved plan by id and renders the Material-styled detail view —
 * reachable from the Dashboard's "Today's Workout" card, Recent Activity
 * rows, and the "View Details" action after generating+saving a plan. Reuses
 * the existing GET /api/plans/:planId endpoint (same one Classic's
 * PlanDetail.tsx already calls); no backend change needed. */
export function MaterialPlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);

  useEffect(() => {
    setPlan(undefined);
    apiClient
      .get<{ plan: Plan }>(`/api/plans/${planId}`)
      .then(({ plan }) => setPlan(plan))
      .catch(() => setPlan(null));
  }, [planId]);

  if (plan === undefined) {
    return (
      <MaterialContainer>
        <Stack spacing={2}>
          <Skeleton variant="text" width={280} height={40} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
        </Stack>
      </MaterialContainer>
    );
  }

  if (plan === null) {
    return (
      <MaterialContainer maxWidth="sm">
        <DashboardCard>
          <EmptyState
            icon={<FitnessCenterRoundedIcon fontSize="large" />}
            title="Plan not found"
            description="This plan may have been deleted, or you may not have access to it."
            actionLabel="Back to Dashboard"
            onAction={() => navigate("/dashboard")}
          />
        </DashboardCard>
      </MaterialContainer>
    );
  }

  const isWorkout = plan.type === "workout";
  const sectionLabel = isWorkout ? "Workouts" : "Meal Plans";
  const sectionPath = isWorkout ? "/generate/workout" : "/generate/meal";
  const goalLabel = plan.profileSnapshot.fitnessGoal ? formatEnumLabel(plan.profileSnapshot.fitnessGoal) : null;
  const title = goalLabel
    ? `${goalLabel} ${isWorkout ? "Plan" : "Meal Plan"}`
    : isWorkout
      ? "Workout Plan"
      : "Meal Plan";

  return (
    <MaterialContainer>
      <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">
          Dashboard
        </Link>
        <Link component={RouterLink} to={sectionPath} underline="hover" color="text.secondary">
          {sectionLabel}
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {plan.content.summary}
      </Typography>

      {isWorkout ? (
        <WorkoutDetailView plan={plan} content={plan.content as WorkoutPlanContent} />
      ) : (
        <MealDetailView plan={plan} content={plan.content as MealPlanContent} />
      )}
    </MaterialContainer>
  );
}

function WorkoutDetailView({ plan, content }: { plan: Plan; content: WorkoutPlanContent }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay = content.weeklySchedule[selectedDayIndex];
  const dayImages = selectedDay ? getWorkoutDayImages(selectedDay) : [];

  const experience = plan.profileSnapshot.workoutExperience ?? content.difficulty;
  const goalLabel = plan.profileSnapshot.fitnessGoal ? formatEnumLabel(plan.profileSnapshot.fitnessGoal) : "—";
  const durationRange = computeWorkoutDurationRange(content);
  const muscleSummary = summarizeMuscleGroups((selectedDay?.exercises ?? []).map((exercise) => exercise.name));

  const stats = [
    { label: "Level", value: experience ? formatEnumLabel(experience) : "—" },
    { label: "Duration", value: durationRange },
    { label: "Days/Week", value: `${content.weeklySchedule.length} days` },
    { label: "Goal", value: goalLabel },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <StatCard label={stat.label} value={stat.value} />
          </Grid>
        ))}
      </Grid>

      <Tabs
        value={selectedDayIndex}
        onChange={(_, value) => setSelectedDayIndex(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        {content.weeklySchedule.map((day, index) => (
          <Tab key={`${day.day}-${index}`} label={day.day.slice(0, 3).toUpperCase()} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <DashboardCard>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedDay ? `${selectedDay.day} — ${selectedDay.focus}` : "Workout Overview"}
            </Typography>
            <List disablePadding>
              {selectedDay?.exercises.map((exercise, index) => {
                const info = getExerciseInfo(exercise.name);
                return (
                  <Box key={`${exercise.name}-${index}`}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem disableGutters sx={{ py: 1.5, gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          bgcolor: "action.selected",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <CardMedia
                        component="img"
                        image={dayImages[index] ?? WORKOUT_PLACEHOLDER}
                        alt={exercise.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = WORKOUT_PLACEHOLDER;
                        }}
                        sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }}
                      />
                      <ListItemText primary={exercise.name} secondary={`${exercise.sets} sets × ${exercise.reps}`} />
                      <Stack spacing={0.5} sx={{ alignItems: "flex-end", flexShrink: 0, pl: 2 }}>
                        <Chip size="small" label={info.targetMuscles[0]} variant="outlined" />
                        {exercise.rest && (
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                            Rest: {exercise.rest}
                          </Typography>
                        )}
                      </Stack>
                    </ListItem>
                  </Box>
                );
              })}
            </List>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <DashboardCard>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Workout Tips
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                {content.progressionGuidance && (
                  <Typography component="li" variant="body2">
                    {content.progressionGuidance}
                  </Typography>
                )}
                <Typography component="li" variant="body2">
                  Warm up for 5-10 minutes before each session.
                </Typography>
                <Typography component="li" variant="body2">
                  Stay hydrated and prioritize form over speed.
                </Typography>
              </Stack>
            </DashboardCard>

            <DashboardCard>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Muscle Groups
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Primary
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", mt: 0.5, mb: 1.5 }}>
                {muscleSummary.primary.map((muscle) => (
                  <Chip key={muscle} label={muscle} size="small" color="primary" />
                ))}
              </Stack>
              {muscleSummary.secondary.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary">
                    Secondary
                  </Typography>
                  <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", mt: 0.5 }}>
                    {muscleSummary.secondary.map((muscle) => (
                      <Chip key={muscle} label={muscle} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}
            </DashboardCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function MealDetailCard({ meal }: { meal: MealEntry }) {
  const time = mealTimeLabel(meal.meal);
  return (
    <DashboardCard sx={{ p: 0, overflow: "hidden" }}>
      <Grid container>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CardMedia
            component="img"
            image={getMealImage(meal)}
            alt={meal.description}
            onError={(e) => {
              (e.target as HTMLImageElement).src = MEAL_PLACEHOLDER;
            }}
            sx={{ height: { xs: 160, sm: "100%" }, objectFit: "cover" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Chip label={meal.meal} size="small" color="success" />
              {time && (
                <Typography variant="caption" color="text.secondary">
                  {time}
                </Typography>
              )}
            </Stack>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {meal.description}
            </Typography>
            {meal.calories != null && (
              <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Typography variant="body2">
                  <strong>{meal.calories}</strong> kcal
                </Typography>
                <Typography variant="body2">
                  <strong>{meal.protein}g</strong> protein
                </Typography>
                <Typography variant="body2">
                  <strong>{meal.carbs}g</strong> carbs
                </Typography>
                <Typography variant="body2">
                  <strong>{meal.fat}g</strong> fat
                </Typography>
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </DashboardCard>
  );
}

function MealDetailView({ plan, content }: { plan: Plan; content: MealPlanContent }) {
  const totals = computeDailyTotals(content.dailyMeals);
  const goalLabel = plan.profileSnapshot.fitnessGoal ? formatEnumLabel(plan.profileSnapshot.fitnessGoal) : "—";
  // Real note already attached by the meal agent for vegetarian/vegan plans
  // (see agents/src/meal_agent.py's _build_plan) — reused here rather than
  // inventing plan-specific advice.
  const dietNote = content.dailyMeals.find((meal) => meal.notes)?.notes;

  const stats = [
    { label: "Calories", value: totals ? `${totals.calories} kcal` : "—" },
    { label: "Protein", value: totals ? `${totals.protein} g` : "—" },
    { label: "Duration", value: "1 Day" },
    { label: "Goal", value: goalLabel },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <StatCard label={stat.label} value={stat.value} />
          </Grid>
        ))}
      </Grid>

      <Chip label="Day 1" color="primary" sx={{ alignSelf: "flex-start", fontWeight: 700 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {content.dailyMeals.map((meal, index) => (
              <MealDetailCard key={`${meal.meal}-${index}`} meal={meal} />
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {totals && (
              <DashboardCard>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Daily Nutrition Summary
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Calories
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{totals.calories} kcal</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Protein
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{totals.protein} g</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Carbs
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{totals.carbs} g</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Fat
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{totals.fat} g</Typography>
                  </Stack>
                </Stack>
              </DashboardCard>
            )}

            <DashboardCard>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Meal Tips
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                {dietNote && (
                  <Typography component="li" variant="body2">
                    {dietNote}
                  </Typography>
                )}
                <Typography component="li" variant="body2">
                  Drink plenty of water throughout the day.
                </Typography>
                <Typography component="li" variant="body2">
                  Space meals every 3-4 hours for steady energy.
                </Typography>
              </Stack>
            </DashboardCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

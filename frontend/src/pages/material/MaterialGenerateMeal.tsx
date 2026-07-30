import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { ApiError, apiClient } from "../../services/apiClient";
import type { FitnessProfile, MealPlanContent, Plan } from "../../types";
import { formatEnumLabel } from "../../utils/format";
import { computeDailyTargets, computeDailyTotals } from "../../utils/mealStats";
import { MEAL_PLACEHOLDER, getMealImage } from "../../utils/planImages";
import { DashboardCard } from "../../components/material/DashboardCard";
import { FeedbackSnackbar } from "../../components/material/FeedbackSnackbar";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { SectionHeader } from "../../components/material/SectionHeader";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

export function MaterialGenerateMeal() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<MealPlanContent | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => undefined);
  }, []);

  async function generate() {
    setStatus("loading");
    setPlan(null);
    setSavedPlanId(null);
    try {
      const result = await apiClient.post<{ type: "meal"; content: MealPlanContent }>(
        "/api/plans/meal/generate",
      );
      setPlan(result.content);
      setStatus("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStatus("profile_incomplete");
      } else {
        setStatus("error");
        setSnackbar({ message: "We couldn't reach the meal planner right now.", severity: "error" });
      }
    }
  }

  async function save() {
    if (!plan) return;
    try {
      const { plan: savedPlan } = await apiClient.post<{ plan: Plan }>("/api/plans", {
        type: "meal",
        content: plan,
      });
      setSavedPlanId(savedPlan.planId);
      setStatus("saved");
      setSnackbar({ message: "Meal plan saved to your dashboard.", severity: "success" });
    } catch {
      setSnackbar({ message: "Could not save this plan. Please try again.", severity: "error" });
    }
  }

  const targets = profile ? computeDailyTargets(profile) : null;
  const dailyTotals = plan ? computeDailyTotals(plan.dailyMeals) : null;

  return (
    <MaterialContainer maxWidth="md">
      <SectionHeader
        title="Generate a Meal Plan"
        action={
          plan && (status === "ready" || status === "saved") ? (
            <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={generate} variant="outlined">
              Generate another
            </Button>
          ) : undefined
        }
      />
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Built from your fitness goal and dietary preference.
      </Typography>

      {status === "profile_incomplete" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your fitness profile before generating a plan.{" "}
          <Button size="small" onClick={() => navigate("/profile")}>
            Go to profile
          </Button>
        </Alert>
      )}

      {(status === "idle" || status === "error" || status === "profile_incomplete") && (
        <DashboardCard sx={{ textAlign: "center", py: 5 }}>
          <RestaurantRoundedIcon sx={{ fontSize: 40, color: "primary.main", mb: 1.5 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Ready when you are
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Generate a personalized daily meal plan in a few seconds.
          </Typography>
          <Button variant="contained" size="large" onClick={generate}>
            Generate Meal Plan
          </Button>
        </DashboardCard>
      )}

      {status === "loading" && (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      )}

      {plan && profile && (status === "ready" || status === "saved") && (
        <Stack spacing={3}>
          {targets && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip label={`Goal: ${formatEnumLabel(profile.fitnessGoal)}`} variant="outlined" />
              <Chip label={`${targets.calories} kcal/day`} variant="outlined" />
              <Chip label={`${targets.protein}g protein`} variant="outlined" />
              <Chip label={`${targets.carbs}g carbs`} variant="outlined" />
              <Chip label={`${targets.fat}g fat`} variant="outlined" />
            </Stack>
          )}

          <DashboardCard sx={{ bgcolor: "grey.900", color: "#fff" }}>
            <Typography>{plan.summary}</Typography>
          </DashboardCard>

          <Stack spacing={2}>
            {plan.dailyMeals.map((meal, index) => (
              <DashboardCard key={`${meal.meal}-${index}`} sx={{ p: 0, overflow: "hidden" }}>
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
                      <Chip label={meal.meal} size="small" color="success" sx={{ mb: 1 }} />
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {meal.description}
                      </Typography>
                      {meal.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {meal.notes}
                        </Typography>
                      )}
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: "wrap" }} useFlexGap>
                          {meal.ingredients.map((ingredient) => (
                            <Chip
                              key={ingredient.name}
                              size="small"
                              variant="outlined"
                              label={`${ingredient.name} ${ingredient.quantity}`}
                            />
                          ))}
                        </Stack>
                      )}
                      {meal.calories != null && (
                        <Stack direction="row" spacing={2}>
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
            ))}
          </Stack>

          {dailyTotals && (
            <DashboardCard sx={{ bgcolor: "success.50" }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Daily Nutrition Summary
              </Typography>
              <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Calories
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dailyTotals.calories} kcal</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Protein
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dailyTotals.protein} g</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Carbs
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dailyTotals.carbs} g</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fat
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dailyTotals.fat} g</Typography>
                </Box>
              </Stack>
            </DashboardCard>
          )}

          {status === "ready" && (
            <Button variant="contained" color="success" size="large" onClick={save} sx={{ alignSelf: "flex-start" }}>
              Save Plan
            </Button>
          )}
          {status === "saved" && (
            <Stack direction="row" spacing={1.5}>
              {savedPlanId && (
                <Button variant="contained" onClick={() => navigate(`/plans/${savedPlanId}`)}>
                  View Details
                </Button>
              )}
              <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {snackbar && (
        <FeedbackSnackbar
          open
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar(null)}
        />
      )}
    </MaterialContainer>
  );
}

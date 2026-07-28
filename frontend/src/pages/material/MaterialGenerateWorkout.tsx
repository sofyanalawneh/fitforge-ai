import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { ApiError, apiClient } from "../../services/apiClient";
import type { FitnessProfile, WorkoutPlanContent } from "../../types";
import { getExerciseInfo } from "../../utils/exerciseInfo";
import { computeSessionSummary, computeWorkoutPlanStats } from "../../utils/workoutStats";
import { DashboardCard } from "../../components/material/DashboardCard";
import { FeedbackSnackbar } from "../../components/material/FeedbackSnackbar";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { SectionHeader } from "../../components/material/SectionHeader";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

export function MaterialGenerateWorkout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<WorkoutPlanContent | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
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
    setSelectedDayIndex(0);
    try {
      const result = await apiClient.post<{ type: "workout"; content: WorkoutPlanContent }>(
        "/api/plans/workout/generate",
      );
      setPlan(result.content);
      setStatus("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStatus("profile_incomplete");
      } else {
        setStatus("error");
        setSnackbar({ message: "We couldn't reach the workout planner right now.", severity: "error" });
      }
    }
  }

  async function save() {
    if (!plan) return;
    try {
      await apiClient.post("/api/plans", { type: "workout", content: plan });
      setStatus("saved");
      setSnackbar({ message: "Workout plan saved to your dashboard.", severity: "success" });
    } catch {
      setSnackbar({ message: "Could not save this plan. Please try again.", severity: "error" });
    }
  }

  const selectedDay = plan?.weeklySchedule[selectedDayIndex];
  const stats = plan && profile ? computeWorkoutPlanStats(plan, profile) : null;
  const summary = selectedDay && profile ? computeSessionSummary(selectedDay, profile.weightKg, profile.workoutExperience) : null;

  return (
    <MaterialContainer maxWidth="md">
      <SectionHeader
        title="Generate a Workout Plan"
        action={
          plan && (status === "ready" || status === "saved") ? (
            <Button
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={generate}
              variant="outlined"
            >
              Generate another
            </Button>
          ) : undefined
        }
      />
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Built from your fitness goal, activity level, and workout experience.
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
          <FitnessCenterRoundedIcon sx={{ fontSize: 40, color: "primary.main", mb: 1.5 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Ready when you are
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Generate a personalized weekly workout plan in a few seconds.
          </Typography>
          <Button variant="contained" size="large" onClick={generate}>
            Generate Workout
          </Button>
        </DashboardCard>
      )}

      {status === "loading" && (
        <DashboardCard>
          <Stack spacing={1.5}>
            <Skeleton variant="rectangular" height={32} width="60%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          </Stack>
        </DashboardCard>
      )}

      {plan && profile && (status === "ready" || status === "saved") && (
        <Stack spacing={3}>
          {stats && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {stats.map((stat) => (
                <Chip key={stat.label} label={`${stat.label}: ${stat.value}`} variant="outlined" />
              ))}
            </Stack>
          )}

          <DashboardCard sx={{ bgcolor: "grey.900", color: "#fff" }}>
            <Typography>{plan.summary}</Typography>
            {plan.progressionGuidance && (
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                {plan.progressionGuidance}
              </Typography>
            )}
          </DashboardCard>

          <Tabs
            value={selectedDayIndex}
            onChange={(_, value) => setSelectedDayIndex(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {plan.weeklySchedule.map((day, index) => (
              <Tab key={`${day.day}-${index}`} label={day.day.slice(0, 3).toUpperCase()} />
            ))}
          </Tabs>

          {selectedDay && (
            <DashboardCard>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedDay.day} — {selectedDay.focus}
              </Typography>
              <List disablePadding>
                {selectedDay.exercises.map((exercise, index) => {
                  const info = getExerciseInfo(exercise.name);
                  return (
                    <Box key={`${exercise.name}-${index}`}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem disableGutters sx={{ py: 1.5 }}>
                        <ListItemText
                          primary={exercise.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.secondary">
                                {info.description}
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap" }} useFlexGap>
                                {info.targetMuscles.map((muscle) => (
                                  <Chip key={muscle} label={muscle} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </>
                          }
                          slotProps={{ secondary: { component: "div" } }}
                        />
                        <Box sx={{ textAlign: "right", flexShrink: 0, pl: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                            {exercise.sets} {exercise.sets === 1 ? "set" : "sets"} × {exercise.reps}
                          </Typography>
                          {exercise.rest && (
                            <Typography variant="caption" color="text.secondary">
                              Rest: {exercise.rest}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            </DashboardCard>
          )}

          {summary && (
            <DashboardCard>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Session Summary
              </Typography>
              <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Volume
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{summary.volume}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Est. Calories
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{summary.estCalories}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Focus Muscles
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{summary.focusMuscles}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Intensity
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{summary.intensity}</Typography>
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
            <Button variant="outlined" onClick={() => navigate("/dashboard")} sx={{ alignSelf: "flex-start" }}>
              View Dashboard
            </Button>
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

import { type FormEvent, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError, apiClient } from "../../services/apiClient";
import type { FitnessProfile, FitnessProfileInput } from "../../types";
import { formatEnumLabel } from "../../utils/format";
import { DashboardCard } from "../../components/material/DashboardCard";
import { EmptyState } from "../../components/material/EmptyState";
import { FeedbackSnackbar } from "../../components/material/FeedbackSnackbar";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { SectionHeader } from "../../components/material/SectionHeader";

// Same enum options and ranges as the Classic profile form
// (frontend/src/pages/Profile.tsx) — kept in sync deliberately so both
// designs validate and accept the exact same values against the same
// PUT /api/profile contract (backend/src/api/profile.ts).
const GENDER_OPTIONS: Array<{ value: FitnessProfileInput["gender"]; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const FITNESS_GOAL_OPTIONS: Array<{ value: FitnessProfileInput["fitnessGoal"]; label: string }> = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "build_muscle", label: "Build muscle" },
  { value: "improve_endurance", label: "Improve endurance" },
  { value: "general_fitness", label: "General fitness" },
];

const ACTIVITY_LEVEL_OPTIONS: Array<{ value: FitnessProfileInput["activityLevel"]; label: string }> = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Lightly active" },
  { value: "moderately_active", label: "Moderately active" },
  { value: "very_active", label: "Very active" },
];

const WORKOUT_EXPERIENCE_OPTIONS: Array<{ value: FitnessProfileInput["workoutExperience"]; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DIETARY_PREFERENCE_OPTIONS: Array<{ value: FitnessProfileInput["dietaryPreferences"]; label: string }> = [
  { value: "none", label: "No specific preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "other", label: "Other" },
];

type FieldErrors = Partial<Record<keyof FitnessProfileInput, string>>;

// Mirrors backend/src/api/profile.ts's validateProfileInput ranges exactly,
// so invalid input is caught client-side before it ever reaches the API.
function validate(form: FitnessProfileInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!Number.isFinite(form.age) || form.age < 13 || form.age > 100) {
    errors.age = "Age must be between 13 and 100.";
  }
  if (!Number.isFinite(form.heightCm) || form.heightCm < 100 || form.heightCm > 250) {
    errors.heightCm = "Height must be between 100 and 250 cm.";
  }
  if (!Number.isFinite(form.weightKg) || form.weightKg < 30 || form.weightKg > 300) {
    errors.weightKg = "Weight must be between 30 and 300 kg.";
  }
  return errors;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, sm: 4 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Grid>
  );
}

interface EditFormProps {
  form: FitnessProfileInput;
  fieldErrors: FieldErrors;
  saving: boolean;
  onChange: <K extends keyof FitnessProfileInput>(key: K, value: FitnessProfileInput[K]) => void;
  onCancel: () => void;
}

function ProfileEditForm({ form, fieldErrors, saving, onChange, onCancel }: EditFormProps) {
  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Age"
            type="number"
            fullWidth
            required
            value={form.age}
            onChange={(e) => onChange("age", Number(e.target.value))}
            error={!!fieldErrors.age}
            helperText={fieldErrors.age}
            slotProps={{ htmlInput: { min: 13, max: 100 } }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            select
            label="Gender"
            fullWidth
            value={form.gender}
            onChange={(e) => onChange("gender", e.target.value as FitnessProfileInput["gender"])}
          >
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Height (cm)"
            type="number"
            fullWidth
            required
            value={form.heightCm}
            onChange={(e) => onChange("heightCm", Number(e.target.value))}
            error={!!fieldErrors.heightCm}
            helperText={fieldErrors.heightCm}
            slotProps={{ htmlInput: { min: 100, max: 250 } }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Weight (kg)"
            type="number"
            fullWidth
            required
            value={form.weightKg}
            onChange={(e) => onChange("weightKg", Number(e.target.value))}
            error={!!fieldErrors.weightKg}
            helperText={fieldErrors.weightKg}
            slotProps={{ htmlInput: { min: 30, max: 300 } }}
          />
        </Grid>
      </Grid>

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Fitness Goal"
            fullWidth
            value={form.fitnessGoal}
            onChange={(e) => onChange("fitnessGoal", e.target.value as FitnessProfileInput["fitnessGoal"])}
          >
            {FITNESS_GOAL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Activity Level"
            fullWidth
            value={form.activityLevel}
            onChange={(e) => onChange("activityLevel", e.target.value as FitnessProfileInput["activityLevel"])}
          >
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Workout Experience"
            fullWidth
            value={form.workoutExperience}
            onChange={(e) =>
              onChange("workoutExperience", e.target.value as FitnessProfileInput["workoutExperience"])
            }
          >
            {WORKOUT_EXPERIENCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Dietary Preference"
            fullWidth
            value={form.dietaryPreferences}
            onChange={(e) =>
              onChange("dietaryPreferences", e.target.value as FitnessProfileInput["dietaryPreferences"])
            }
          >
            {DIETARY_PREFERENCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1.5}>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}

/** Fitness-profile summary and editor. Viewing fetches from GET /api/profile;
 * editing reuses the exact same fields/ranges/options and the same
 * PUT /api/profile flow as the Classic profile page (frontend/src/pages/Profile.tsx)
 * so both designs stay behaviorally identical against one backend contract. */
export function MaterialProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FitnessProfile | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FitnessProfileInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => setProfile(null));
  }, []);

  function startEditing() {
    if (!profile) return;
    setForm(profile);
    setFieldErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setForm(null);
    setFieldErrors({});
  }

  function updateField<K extends keyof FitnessProfileInput>(key: K, value: FitnessProfileInput[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const { profile: updated } = await apiClient.put<{ profile: FitnessProfile }>("/api/profile", form);
      setProfile(updated);
      setIsEditing(false);
      setForm(null);
      setFieldErrors({});
      setSnackbar({ message: "Profile saved.", severity: "success" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.body as { fields?: Record<string, string> } | undefined;
        if (body?.fields) setFieldErrors(body.fields as FieldErrors);
        setSnackbar({ message: "Please fix the highlighted fields.", severity: "error" });
      } else {
        setSnackbar({ message: "Could not save your profile. Please try again.", severity: "error" });
      }
    } finally {
      setSaving(false);
    }
  }

  const initial = user?.displayName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <MaterialContainer maxWidth="sm">
      <SectionHeader title="Profile" />

      <DashboardCard sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, fontSize: 24 }}>{initial}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {user?.displayName || "Your account"}
            </Typography>
            <Typography color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Stack>
      </DashboardCard>

      <DashboardCard>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1">Fitness Profile</Typography>
          {profile && !isEditing && (
            <Button size="small" variant="outlined" onClick={startEditing}>
              Edit Profile
            </Button>
          )}
        </Stack>

        {profile === undefined ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rectangular" height={20} width="40%" />
            <Skeleton variant="rectangular" height={60} />
          </Stack>
        ) : profile === null ? (
          <EmptyState
            icon={<PersonRoundedIcon fontSize="large" />}
            title="Profile not set up yet"
            description="Complete your fitness profile in Classic Design (switch using the toggle above) to unlock personalized plans and see your details here."
          />
        ) : isEditing && form ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <ProfileEditForm
              form={form}
              fieldErrors={fieldErrors}
              saving={saving}
              onChange={updateField}
              onCancel={cancelEditing}
            />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              <ProfileField label="Age" value={`${profile.age}`} />
              <ProfileField label="Gender" value={formatEnumLabel(profile.gender)} />
              <ProfileField label="Height" value={`${profile.heightCm} cm`} />
              <ProfileField label="Weight" value={`${profile.weightKg} kg`} />
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <ProfileField label="Fitness Goal" value={formatEnumLabel(profile.fitnessGoal)} />
              <ProfileField label="Activity Level" value={formatEnumLabel(profile.activityLevel)} />
              <ProfileField label="Experience" value={formatEnumLabel(profile.workoutExperience)} />
              <ProfileField label="Diet" value={formatEnumLabel(profile.dietaryPreferences)} />
            </Grid>
          </>
        )}
      </DashboardCard>

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

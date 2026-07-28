import { useEffect, useState } from "react";
import { Avatar, Box, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../services/apiClient";
import type { FitnessProfile } from "../../types";
import { formatEnumLabel } from "../../utils/format";
import { DashboardCard } from "../../components/material/DashboardCard";
import { EmptyState } from "../../components/material/EmptyState";
import { MaterialContainer } from "../../components/material/MaterialContainer";
import { SectionHeader } from "../../components/material/SectionHeader";

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

/** Read-only profile summary — real account info from Firebase Auth and
 * real fitness-profile fields from GET /api/profile. No editable fields are
 * added here; editing the profile is not built in Material Design yet, so
 * this page is honest about that rather than faking a form. */
export function MaterialProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FitnessProfile | null | undefined>(undefined);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => setProfile(null));
  }, []);

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
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Fitness Profile
        </Typography>

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
    </MaterialContainer>
  );
}

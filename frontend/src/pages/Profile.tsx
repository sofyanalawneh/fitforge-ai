import { type FormEvent, useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { FitnessProfile, FitnessProfileInput } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { IconSalad, IconTarget, IconUser } from "../components/icons";

const emptyForm: FitnessProfileInput = {
  age: 25,
  gender: "prefer_not_to_say",
  heightCm: 170,
  weightKg: 70,
  fitnessGoal: "general_fitness",
  activityLevel: "moderately_active",
  dietaryPreferences: "none",
  workoutExperience: "beginner",
};

export function Profile() {
  const [form, setForm] = useState<FitnessProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => {
        if (profile) setForm(profile);
      })
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof FitnessProfileInput>(key: K, value: FitnessProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiClient.put<{ profile: FitnessProfile }>("/api/profile", form);
      setSaved(true);
    } catch {
      setError("Could not save your profile. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container ff-page ff-page-medium">
        <LoadingState label="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="container ff-page ff-page-medium">
      <div className="ff-page-header">
        <span className="ff-eyebrow">Your profile</span>
        <h1>Your Fitness Profile</h1>
        <p>Tell us about yourself so we can tailor your workout and meal plans.</p>
      </div>

      {error && <StatusAlert variant="danger">{error}</StatusAlert>}
      {saved && <StatusAlert variant="success">Profile saved.</StatusAlert>}

      <form onSubmit={handleSubmit} className="card-ff">
        <div className="form-section">
          <h2>
            <span className="section-card-icon">
              <IconUser />
            </span>
            About you
          </h2>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                required
                min={13}
                max={100}
                value={form.age}
                onChange={(e) => update("age", Number(e.target.value))}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as FitnessProfileInput["gender"])}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                className="form-control"
                required
                min={100}
                max={250}
                value={form.heightCm}
                onChange={(e) => update("heightCm", Number(e.target.value))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                required
                min={30}
                max={300}
                value={form.weightKg}
                onChange={(e) => update("weightKg", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <span className="section-card-icon">
              <IconTarget />
            </span>
            Goals &amp; experience
          </h2>
          <div className="mb-3">
            <label className="form-label">Fitness goal</label>
            <select
              className="form-select"
              value={form.fitnessGoal}
              onChange={(e) => update("fitnessGoal", e.target.value as FitnessProfileInput["fitnessGoal"])}
            >
              <option value="lose_weight">Lose weight</option>
              <option value="build_muscle">Build muscle</option>
              <option value="improve_endurance">Improve endurance</option>
              <option value="general_fitness">General fitness</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Activity level</label>
            <select
              className="form-select"
              value={form.activityLevel}
              onChange={(e) => update("activityLevel", e.target.value as FitnessProfileInput["activityLevel"])}
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly active</option>
              <option value="moderately_active">Moderately active</option>
              <option value="very_active">Very active</option>
            </select>
          </div>

          <div>
            <label className="form-label">Workout experience</label>
            <select
              className="form-select"
              value={form.workoutExperience}
              onChange={(e) =>
                update("workoutExperience", e.target.value as FitnessProfileInput["workoutExperience"])
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <span className="section-card-icon">
              <IconSalad />
            </span>
            Nutrition
          </h2>
          <div>
            <label className="form-label">Dietary preference</label>
            <select
              className="form-select"
              value={form.dietaryPreferences}
              onChange={(e) =>
                update("dietaryPreferences", e.target.value as FitnessProfileInput["dietaryPreferences"])
              }
            >
              <option value="none">No specific preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-section-footer">
          <button type="submit" className="btn btn-brand" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Static exercise-science metadata keyed by exercise name — target muscles, a
// one-line description, and a broad muscle-group tag. Covers every exercise
// name actually produced by agents/src/workout_agent.py's exercise pools.
// muscleGroup is also consumed by planImages.ts for the same-muscle-group
// image fallback, so it's the single source of truth for grouping.

export type MuscleGroup = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";

export interface ExerciseInfo {
  targetMuscles: string[];
  description: string;
  muscleGroup: MuscleGroup;
}

const DEFAULT_INFO: ExerciseInfo = {
  targetMuscles: ["Full Body"],
  description: "A programmed exercise for this session.",
  muscleGroup: "core",
};

export const EXERCISE_INFO: Record<string, ExerciseInfo> = {
  "Bench Press": {
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    description: "Builds chest, shoulders, and triceps.",
    muscleGroup: "chest",
  },
  "Overhead Press": {
    targetMuscles: ["Shoulders", "Triceps"],
    description: "Builds shoulder strength and size.",
    muscleGroup: "shoulders",
  },
  "Bent-Over Row": {
    targetMuscles: ["Back", "Biceps"],
    description: "Targets the mid-back and lats.",
    muscleGroup: "back",
  },
  "Incline Dumbbell Press": {
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
    description: "Targets upper chest for thickness.",
    muscleGroup: "chest",
  },
  "Lateral Raise": {
    targetMuscles: ["Shoulders"],
    description: "Builds wider shoulders.",
    muscleGroup: "shoulders",
  },
  "Tricep Extension": {
    targetMuscles: ["Triceps"],
    description: "Isolates and shapes the triceps.",
    muscleGroup: "arms",
  },
  Squat: {
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    description: "Builds total lower-body strength.",
    muscleGroup: "legs",
  },
  "Romanian Deadlift": {
    targetMuscles: ["Hamstrings", "Glutes"],
    description: "Targets the hamstrings and glutes.",
    muscleGroup: "legs",
  },
  "Walking Lunge": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds single-leg strength and balance.",
    muscleGroup: "legs",
  },
  "Leg Press": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds quad and glute strength.",
    muscleGroup: "legs",
  },
  "Calf Raise": {
    targetMuscles: ["Calves"],
    description: "Isolates and builds the calves.",
    muscleGroup: "legs",
  },
  "Leg Curl": {
    targetMuscles: ["Hamstrings"],
    description: "Isolates the hamstrings.",
    muscleGroup: "legs",
  },
  Deadlift: {
    targetMuscles: ["Back", "Glutes", "Hamstrings"],
    description: "Builds total posterior-chain strength.",
    muscleGroup: "back",
  },
  "Pull-Up": {
    targetMuscles: ["Back", "Biceps"],
    description: "Builds a wider, stronger back.",
    muscleGroup: "back",
  },
  "Dumbbell Row": {
    targetMuscles: ["Back", "Biceps"],
    description: "Targets the lats and mid-back.",
    muscleGroup: "back",
  },
  "Face Pull": {
    targetMuscles: ["Rear Delts", "Upper Back"],
    description: "Improves shoulder health and posture.",
    muscleGroup: "shoulders",
  },
  "Hammer Curl": {
    targetMuscles: ["Biceps", "Forearms"],
    description: "Builds biceps and forearm size.",
    muscleGroup: "arms",
  },
  "Bicep Curl": {
    targetMuscles: ["Biceps"],
    description: "Isolates and builds the biceps.",
    muscleGroup: "arms",
  },
  "Front Squat": {
    targetMuscles: ["Quads", "Core"],
    description: "Emphasizes the quads and core.",
    muscleGroup: "legs",
  },
  "Hip Thrust": {
    targetMuscles: ["Glutes"],
    description: "Builds glute strength and power.",
    muscleGroup: "legs",
  },
  "Bulgarian Split Squat": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds single-leg strength and stability.",
    muscleGroup: "legs",
  },
  "Farmer's Carry": {
    targetMuscles: ["Core", "Forearms", "Traps"],
    description: "Builds grip strength and total-body stability.",
    muscleGroup: "core",
  },
  "Chin-Up": {
    targetMuscles: ["Back", "Biceps"],
    description: "Builds the back and biceps together.",
    muscleGroup: "back",
  },
  "Dumbbell Fly": {
    targetMuscles: ["Chest"],
    description: "Isolates and stretches the chest.",
    muscleGroup: "chest",
  },
  "Barbell Row": {
    targetMuscles: ["Back", "Biceps"],
    description: "Targets the mid-back and lats.",
    muscleGroup: "back",
  },
  "Weighted Dip": {
    targetMuscles: ["Chest", "Triceps"],
    description: "Builds chest and tricep size.",
    muscleGroup: "chest",
  },
  "Push-Up": {
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    description: "Builds chest and tricep endurance.",
    muscleGroup: "chest",
  },
  "Kettlebell Swing": {
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    description: "Builds explosive hip power.",
    muscleGroup: "cardio",
  },
  "Mountain Climbers": {
    targetMuscles: ["Core"],
    description: "Raises heart rate while working the core.",
    muscleGroup: "cardio",
  },
  Plank: {
    targetMuscles: ["Core"],
    description: "Builds core stability and endurance.",
    muscleGroup: "core",
  },
  "Jump Rope": {
    targetMuscles: ["Calves"],
    description: "Builds cardio conditioning and calf endurance.",
    muscleGroup: "cardio",
  },
  "Bicycle Crunch": {
    targetMuscles: ["Abs", "Obliques"],
    description: "Targets the abs and obliques.",
    muscleGroup: "core",
  },
  "Battle Ropes": {
    targetMuscles: ["Shoulders", "Core"],
    description: "Builds conditioning and upper-body endurance.",
    muscleGroup: "cardio",
  },
  Burpees: {
    targetMuscles: ["Full Body"],
    description: "A full-body conditioning move.",
    muscleGroup: "cardio",
  },
  "Goblet Squat": {
    targetMuscles: ["Quads", "Glutes", "Core"],
    description: "Builds lower-body strength with a core challenge.",
    muscleGroup: "legs",
  },
  "Incline Push-Up": {
    targetMuscles: ["Chest", "Triceps"],
    description: "An easier push-up variation for the chest.",
    muscleGroup: "chest",
  },
  "Box Step-Up": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds single-leg strength and power.",
    muscleGroup: "legs",
  },
  "Side Plank": {
    targetMuscles: ["Obliques", "Core"],
    description: "Builds oblique and core stability.",
    muscleGroup: "core",
  },
  "Sled Push": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds leg power and conditioning.",
    muscleGroup: "cardio",
  },
  "Russian Twist": {
    targetMuscles: ["Obliques", "Core"],
    description: "Targets the obliques with rotation.",
    muscleGroup: "core",
  },
  "Sprint Intervals": {
    targetMuscles: ["Legs"],
    description: "High-intensity cardio conditioning.",
    muscleGroup: "cardio",
  },
  "Tempo Run": {
    targetMuscles: ["Legs"],
    description: "Builds aerobic endurance at a controlled pace.",
    muscleGroup: "cardio",
  },
  "Brisk Walk": {
    targetMuscles: ["Legs"],
    description: "Low-impact cardio and active recovery.",
    muscleGroup: "cardio",
  },
  "Hanging Leg Raise": {
    targetMuscles: ["Abs", "Hip Flexors"],
    description: "Builds lower-ab and hip-flexor strength.",
    muscleGroup: "core",
  },
  "Hill Sprints": {
    targetMuscles: ["Legs"],
    description: "Builds power and cardio conditioning.",
    muscleGroup: "cardio",
  },
  "High Knees": {
    targetMuscles: ["Hip Flexors", "Core"],
    description: "Raises heart rate and works the hip flexors.",
    muscleGroup: "cardio",
  },
  "Jumping Jacks": {
    targetMuscles: ["Full Body"],
    description: "A full-body cardio warm-up move.",
    muscleGroup: "cardio",
  },
  Cycling: {
    targetMuscles: ["Legs"],
    description: "Low-impact cardio conditioning.",
    muscleGroup: "cardio",
  },
  "Brisk Walk/Jog": {
    targetMuscles: ["Legs"],
    description: "Low-impact aerobic conditioning.",
    muscleGroup: "cardio",
  },
  "Hip Mobility Drills": {
    targetMuscles: ["Hips"],
    description: "Improves hip mobility and movement quality.",
    muscleGroup: "core",
  },
  "Cat-Cow Stretch": {
    targetMuscles: ["Spine"],
    description: "Improves spinal mobility and recovery.",
    muscleGroup: "core",
  },
  "Bird Dog": {
    targetMuscles: ["Core", "Back"],
    description: "Builds core stability and balance.",
    muscleGroup: "core",
  },
  "Single-Leg Balance": {
    targetMuscles: ["Core", "Legs"],
    description: "Builds balance and stability.",
    muscleGroup: "core",
  },
  "Wall Sit": {
    targetMuscles: ["Quads"],
    description: "Builds isometric quad endurance.",
    muscleGroup: "legs",
  },
  "Step-Up": {
    targetMuscles: ["Quads", "Glutes"],
    description: "Builds single-leg strength and power.",
    muscleGroup: "legs",
  },
};

export function getExerciseInfo(name?: string | null): ExerciseInfo {
  if (!name) return DEFAULT_INFO;
  return EXERCISE_INFO[name] ?? DEFAULT_INFO;
}

export interface MuscleGroupSummary {
  primary: string[];
  secondary: string[];
}

/** Ranks the real target muscles trained across a day's own exercises by how
 * often each one appears — the most-hit muscles are "primary", the rest
 * (still real, just less frequent) are "secondary". Nothing here is
 * fabricated: it's a frequency count over getExerciseInfo's own data. */
export function summarizeMuscleGroups(exerciseNames: Array<string | undefined | null>): MuscleGroupSummary {
  const counts = new Map<string, number>();
  for (const name of exerciseNames) {
    for (const muscle of getExerciseInfo(name).targetMuscles) {
      counts.set(muscle, (counts.get(muscle) ?? 0) + 1);
    }
  }

  const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const maxCount = ranked[0]?.[1] ?? 0;

  return {
    primary: ranked.filter(([, count]) => count === maxCount).map(([muscle]) => muscle),
    secondary: ranked.filter(([, count]) => count < maxCount).map(([muscle]) => muscle),
  };
}

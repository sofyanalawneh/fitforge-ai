"""Shared request/response models for the workout and meal agents.

Mirrors the contract documented in specs/001-fitforge-mvp/contracts/agent-api.md.
Only the profile fields relevant to a given plan type are sent to that agent.
"""

from typing import List, Optional

from uagents import Model as BaseModel


class WorkoutProfileInput(BaseModel):
    fitness_goal: str
    activity_level: str
    workout_experience: str


class WorkoutGenerateRequest(BaseModel):
    request_id: str
    profile: WorkoutProfileInput


class WorkoutExercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest: Optional[str] = None
    notes: Optional[str] = None


class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: List[WorkoutExercise]


class WorkoutPlanContent(BaseModel):
    summary: str
    weekly_schedule: List[WorkoutDay]
    difficulty: Optional[str] = None
    progression_guidance: Optional[str] = None


class WorkoutGenerateResponse(BaseModel):
    request_id: str
    content: WorkoutPlanContent


class MealProfileInput(BaseModel):
    fitness_goal: str
    dietary_preferences: str


class MealGenerateRequest(BaseModel):
    request_id: str
    profile: MealProfileInput


class Ingredient(BaseModel):
    name: str
    quantity: str


class MealEntry(BaseModel):
    meal: str
    description: str
    notes: Optional[str] = None
    ingredients: Optional[List[Ingredient]] = None
    calories: Optional[int] = None
    protein_g: Optional[int] = None
    carbs_g: Optional[int] = None
    fat_g: Optional[int] = None


class MealPlanContent(BaseModel):
    summary: str
    daily_meals: List[MealEntry]


class MealGenerateResponse(BaseModel):
    request_id: str
    content: MealPlanContent


class HealthResponse(BaseModel):
    status: str

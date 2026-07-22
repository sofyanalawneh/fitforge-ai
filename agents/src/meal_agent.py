"""Meal plan generation agent.

Exposes a synchronous REST endpoint (see contracts/agent-api.md) rather than
using the async Almanac/mailbox protocol: the backend is the only caller
(constitution Principle IV), and a plain request/response call is simpler for
that single, known, first-party caller (constitution Principle I).
"""

import logging
import os

from uagents import Agent, Context

from src.shared.models import MealEntry, MealGenerateRequest, MealGenerateResponse, MealPlanContent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meal_agent")

PORT = int(os.environ.get("MEAL_AGENT_PORT", "8002"))

agent = Agent(name="meal_agent", port=PORT, endpoint=[f"http://127.0.0.1:{PORT}/submit"])

_BASE_MEALS_BY_GOAL = {
    "lose_weight": {
        "Breakfast": "Greek yogurt with berries and a sprinkle of chia seeds",
        "Lunch": "Grilled chicken salad with mixed greens and olive oil dressing",
        "Dinner": "Baked salmon with steamed broccoli and quinoa",
        "Snack": "Apple slices with a small handful of almonds",
    },
    "build_muscle": {
        "Breakfast": "Scrambled eggs, oats, and a banana",
        "Lunch": "Grilled chicken breast, brown rice, and roasted vegetables",
        "Dinner": "Lean beef stir-fry with rice and mixed vegetables",
        "Snack": "Cottage cheese with pineapple",
    },
    "improve_endurance": {
        "Breakfast": "Oatmeal with banana, honey, and peanut butter",
        "Lunch": "Whole-grain pasta with grilled chicken and tomato sauce",
        "Dinner": "Sweet potato, grilled fish, and sauteed spinach",
        "Snack": "Trail mix with dried fruit and nuts",
    },
    "general_fitness": {
        "Breakfast": "Whole-grain toast with avocado and eggs",
        "Lunch": "Turkey and vegetable wrap with a side salad",
        "Dinner": "Grilled chicken, roasted vegetables, and brown rice",
        "Snack": "Greek yogurt with granola",
    },
}

_DIETARY_OVERRIDES = {
    "vegetarian": {
        "Breakfast": "Greek yogurt with berries, chia seeds, and granola",
        "Lunch": "Chickpea and quinoa salad with mixed greens and olive oil dressing",
        "Dinner": "Grilled tofu or paneer with steamed broccoli and quinoa",
        "Snack": "Apple slices with a small handful of almonds",
    },
    "vegan": {
        "Breakfast": "Oatmeal with banana, chia seeds, and almond milk",
        "Lunch": "Lentil and quinoa bowl with mixed vegetables and tahini dressing",
        "Dinner": "Tofu stir-fry with brown rice and mixed vegetables",
        "Snack": "Trail mix with dried fruit and nuts",
    },
}


def _build_plan(fitness_goal: str, dietary_preferences: str) -> MealPlanContent:
    base = _BASE_MEALS_BY_GOAL.get(fitness_goal, _BASE_MEALS_BY_GOAL["general_fitness"])
    overrides = _DIETARY_OVERRIDES.get(dietary_preferences)
    meals = {**base, **(overrides or {})}

    note = None
    if dietary_preferences in ("vegetarian", "vegan"):
        note = f"Adjusted for a {dietary_preferences} diet."

    daily_meals = [
        MealEntry(meal=meal, description=description, notes=note)
        for meal, description in meals.items()
    ]

    summary = (
        f"A {dietary_preferences.replace('_', ' ')} meal plan supporting "
        f"{fitness_goal.replace('_', ' ')}."
    )

    return MealPlanContent(summary=summary, daily_meals=daily_meals)


@agent.on_rest_post("/meal/generate", MealGenerateRequest, MealGenerateResponse)
async def handle_generate(ctx: Context, req: MealGenerateRequest) -> MealGenerateResponse:
    ctx.logger.info("meal_agent.generate.start", extra={"request_id": req.request_id})
    try:
        content = _build_plan(req.profile.fitness_goal, req.profile.dietary_preferences)
    except Exception as err:  # noqa: BLE001 - log with context, then let the
        # uagents REST layer's schema-validation fallback turn this into a
        # non-200 response, which the backend already maps to agent_unavailable.
        ctx.logger.error(
            "meal_agent.generate.failed",
            extra={"request_id": req.request_id, "error": str(err)},
        )
        raise

    ctx.logger.info("meal_agent.generate.success", extra={"request_id": req.request_id})
    return MealGenerateResponse(request_id=req.request_id, content=content)


if __name__ == "__main__":
    agent.run()

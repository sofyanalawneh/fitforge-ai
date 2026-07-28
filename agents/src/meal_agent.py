"""Meal plan generation agent.

Exposes a synchronous REST endpoint (see contracts/agent-api.md) rather than
using the async Almanac/mailbox protocol: the backend is the only caller
(constitution Principle IV), and a plain request/response call is simpler for
that single, known, first-party caller (constitution Principle I).
"""

import logging
import os
import random

from uagents import Agent, Context

from src.shared.models import Ingredient, MealEntry, MealGenerateRequest, MealGenerateResponse, MealPlanContent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meal_agent")

PORT = int(os.environ.get("MEAL_AGENT_PORT", "8002"))

agent = Agent(name="meal_agent", port=PORT, endpoint=[f"http://127.0.0.1:{PORT}/submit"])

# Each meal slot has 2+ curated options so a variation seed can pick between
# them. Description/ingredients/macros are authored together as one unit per
# option (never mixed across options) so the numbers shown always match the
# actual dish. Descriptions are deliberately worded to match the frontend's
# keyword-based image lookup (frontend/src/utils/planImages.ts) so every meal
# still gets a relevant photo, not a generic placeholder.
_MEAL_OPTIONS_BY_GOAL = {
    "lose_weight": {
        "Breakfast": [
            {
                "description": "Greek yogurt with berries and a sprinkle of chia seeds",
                "ingredients": [("Greek Yogurt", "200g"), ("Mixed Berries", "100g"), ("Chia Seeds", "10g")],
                "macros": (280, 24, 30, 8),
            },
            {
                "description": "Egg white omelette with spinach and tomatoes",
                "ingredients": [("Egg Whites", "150g"), ("Spinach", "50g"), ("Tomato", "80g")],
                "macros": (210, 26, 8, 6),
            },
            {
                "description": "Cottage cheese with sliced peaches and a few walnuts",
                "ingredients": [("Cottage Cheese", "200g"), ("Peach", "1"), ("Walnuts", "15g")],
                "macros": (240, 26, 18, 9),
            },
        ],
        "Lunch": [
            {
                "description": "Grilled chicken salad with mixed greens and olive oil dressing",
                "ingredients": [("Chicken Breast", "150g"), ("Mixed Greens", "100g"), ("Olive Oil", "1 tbsp")],
                "macros": (380, 40, 12, 18),
            },
            {
                "description": "Tuna salad over mixed greens with a light vinaigrette",
                "ingredients": [("Tuna", "150g"), ("Mixed Greens", "100g"), ("Vinaigrette", "1 tbsp")],
                "macros": (320, 38, 10, 12),
            },
            {
                "description": "Turkey lettuce wraps with cucumber and bell pepper",
                "ingredients": [("Turkey Breast", "150g"), ("Lettuce", "50g"), ("Cucumber", "50g"), ("Bell Pepper", "50g")],
                "macros": (300, 35, 10, 10),
            },
        ],
        "Dinner": [
            {
                "description": "Baked salmon with steamed broccoli and quinoa",
                "ingredients": [("Salmon", "180g"), ("Broccoli", "150g"), ("Quinoa", "100g")],
                "macros": (460, 38, 35, 18),
            },
            {
                "description": "Grilled white fish with roasted asparagus and cauliflower rice",
                "ingredients": [("White Fish", "180g"), ("Asparagus", "150g"), ("Cauliflower Rice", "150g")],
                "macros": (340, 36, 18, 10),
            },
            {
                "description": "Grilled fish skewers with a side salad and lemon",
                "ingredients": [("White Fish", "180g"), ("Mixed Greens", "100g"), ("Lemon", "1")],
                "macros": (320, 36, 8, 12),
            },
        ],
        "Snack": [
            {
                "description": "Apple slices with a small handful of almonds",
                "ingredients": [("Apple", "1 medium"), ("Almonds", "20g")],
                "macros": (200, 5, 22, 11),
            },
            {
                "description": "Celery sticks with a tablespoon of peanut butter",
                "ingredients": [("Celery", "80g"), ("Peanut Butter", "1 tbsp")],
                "macros": (140, 5, 8, 10),
            },
            {
                "description": "A hard-boiled egg with cucumber slices",
                "ingredients": [("Egg", "1"), ("Cucumber", "80g")],
                "macros": (120, 7, 4, 8),
            },
        ],
    },
    "build_muscle": {
        "Breakfast": [
            {
                "description": "Scrambled eggs, oats, and a banana",
                "ingredients": [("Eggs", "3"), ("Oats", "80g"), ("Banana", "1")],
                "macros": (520, 32, 62, 16),
            },
            {
                "description": "Cottage cheese with berries and a slice of whole-grain toast",
                "ingredients": [("Cottage Cheese", "200g"), ("Mixed Berries", "100g"), ("Whole-Grain Toast", "1 slice")],
                "macros": (340, 30, 35, 8),
            },
            {
                "description": "Egg-based protein pancakes with peanut butter and banana",
                "ingredients": [("Eggs", "2"), ("Oats", "60g"), ("Peanut Butter", "1 tbsp"), ("Banana", "1")],
                "macros": (480, 28, 55, 16),
            },
        ],
        "Lunch": [
            {
                "description": "Grilled chicken breast, brown rice, and roasted vegetables",
                "ingredients": [("Chicken Breast", "200g"), ("Brown Rice", "150g"), ("Mixed Vegetables", "150g")],
                "macros": (650, 55, 70, 14),
            },
            {
                "description": "Lean beef and rice bowl with steamed broccoli",
                "ingredients": [("Lean Beef", "180g"), ("Rice", "150g"), ("Broccoli", "150g")],
                "macros": (620, 48, 65, 16),
            },
            {
                "description": "Turkey meatballs with whole-wheat pasta and marinara",
                "ingredients": [("Turkey Meatballs", "200g"), ("Whole-Wheat Pasta", "150g"), ("Marinara Sauce", "100g")],
                "macros": (640, 50, 68, 18),
            },
        ],
        "Dinner": [
            {
                "description": "Lean beef stir-fry with rice and mixed vegetables",
                "ingredients": [("Lean Beef", "180g"), ("Rice", "150g"), ("Mixed Vegetables", "150g")],
                "macros": (600, 45, 60, 18),
            },
            {
                "description": "Grilled salmon with quinoa and roasted brussels sprouts",
                "ingredients": [("Salmon", "200g"), ("Quinoa", "150g"), ("Brussels Sprouts", "150g")],
                "macros": (630, 45, 55, 20),
            },
            {
                "description": "Grilled chicken thighs with sweet potato and green beans",
                "ingredients": [("Chicken Thighs", "200g"), ("Sweet Potato", "200g"), ("Green Beans", "150g")],
                "macros": (600, 42, 50, 20),
            },
        ],
        "Snack": [
            {
                "description": "Cottage cheese with pineapple",
                "ingredients": [("Cottage Cheese", "200g"), ("Pineapple", "100g")],
                "macros": (260, 24, 28, 4),
            },
            {
                "description": "Greek yogurt with a handful of walnuts",
                "ingredients": [("Greek Yogurt", "200g"), ("Walnuts", "20g")],
                "macros": (300, 26, 16, 15),
            },
            {
                "description": "A banana protein smoothie",
                "ingredients": [("Banana", "1"), ("Protein Powder", "1 scoop"), ("Almond Milk", "200ml")],
                "macros": (260, 28, 30, 4),
            },
        ],
    },
    "improve_endurance": {
        "Breakfast": [
            {
                "description": "Oatmeal with banana, honey, and peanut butter",
                "ingredients": [("Oats", "80g"), ("Banana", "1"), ("Honey", "1 tbsp"), ("Peanut Butter", "1 tbsp")],
                "macros": (480, 16, 65, 18),
            },
            {
                "description": "Whole-grain toast with almond butter and banana slices",
                "ingredients": [("Whole-Grain Toast", "2 slices"), ("Almond Butter", "1 tbsp"), ("Banana", "1")],
                "macros": (380, 12, 52, 14),
            },
            {
                "description": "Granola with Greek yogurt and mixed berries",
                "ingredients": [("Granola", "40g"), ("Greek Yogurt", "200g"), ("Mixed Berries", "100g")],
                "macros": (420, 22, 55, 10),
            },
        ],
        "Lunch": [
            {
                "description": "Whole-grain pasta with grilled chicken and tomato sauce",
                "ingredients": [("Whole-Grain Pasta", "150g"), ("Chicken Breast", "150g"), ("Tomato Sauce", "100g")],
                "macros": (560, 42, 68, 10),
            },
            {
                "description": "Turkey and rice bowl with mixed vegetables",
                "ingredients": [("Turkey Breast", "180g"), ("Rice", "180g"), ("Mixed Vegetables", "150g")],
                "macros": (540, 40, 65, 8),
            },
            {
                "description": "Quinoa bowl with grilled chicken, black beans, and corn",
                "ingredients": [("Quinoa", "120g"), ("Chicken Breast", "150g"), ("Black Beans", "100g"), ("Corn", "80g")],
                "macros": (560, 42, 65, 10),
            },
        ],
        "Dinner": [
            {
                "description": "Sweet potato, grilled fish, and sauteed spinach",
                "ingredients": [("White Fish", "180g"), ("Sweet Potato", "200g"), ("Spinach", "100g")],
                "macros": (460, 35, 45, 10),
            },
            {
                "description": "Grilled chicken with brown rice and green beans",
                "ingredients": [("Chicken Breast", "180g"), ("Brown Rice", "180g"), ("Green Beans", "150g")],
                "macros": (520, 42, 58, 10),
            },
            {
                "description": "Brown rice bowl with grilled chicken and roasted vegetables",
                "ingredients": [("Brown Rice", "180g"), ("Chicken Breast", "180g"), ("Mixed Vegetables", "150g")],
                "macros": (540, 44, 60, 10),
            },
        ],
        "Snack": [
            {
                "description": "Trail mix with dried fruit and nuts",
                "ingredients": [("Trail Mix", "40g")],
                "macros": (220, 6, 22, 12),
            },
            {
                "description": "Greek yogurt with granola and berries",
                "ingredients": [("Greek Yogurt", "200g"), ("Granola", "30g"), ("Mixed Berries", "80g")],
                "macros": (280, 20, 38, 6),
            },
            {
                "description": "Rice cakes with almond butter",
                "ingredients": [("Rice Cakes", "2"), ("Almond Butter", "1 tbsp")],
                "macros": (200, 6, 24, 9),
            },
        ],
    },
    "general_fitness": {
        "Breakfast": [
            {
                "description": "Whole-grain toast with avocado and eggs",
                "ingredients": [("Whole-Grain Toast", "2 slices"), ("Avocado", "0.5"), ("Eggs", "2")],
                "macros": (420, 18, 38, 22),
            },
            {
                "description": "Greek yogurt with granola and mixed berries",
                "ingredients": [("Greek Yogurt", "200g"), ("Granola", "40g"), ("Mixed Berries", "100g")],
                "macros": (360, 22, 46, 8),
            },
            {
                "description": "Veggie omelette with a side of whole-grain toast",
                "ingredients": [("Eggs", "2"), ("Mixed Vegetables", "60g"), ("Whole-Grain Toast", "1 slice")],
                "macros": (380, 20, 32, 18),
            },
        ],
        "Lunch": [
            {
                "description": "Turkey and vegetable wrap with a side salad",
                "ingredients": [("Turkey Breast", "120g"), ("Whole-Grain Wrap", "1"), ("Mixed Vegetables", "100g")],
                "macros": (460, 32, 45, 14),
            },
            {
                "description": "Grilled chicken salad with cherry tomatoes and cucumber",
                "ingredients": [("Chicken Breast", "150g"), ("Cherry Tomatoes", "80g"), ("Cucumber", "80g")],
                "macros": (400, 38, 15, 16),
            },
            {
                "description": "Quinoa and black bean bowl with mixed greens",
                "ingredients": [("Quinoa", "120g"), ("Black Beans", "100g"), ("Mixed Greens", "80g")],
                "macros": (420, 18, 60, 10),
            },
        ],
        "Dinner": [
            {
                "description": "Grilled chicken, roasted vegetables, and brown rice",
                "ingredients": [("Chicken Breast", "180g"), ("Roasted Vegetables", "150g"), ("Brown Rice", "150g")],
                "macros": (540, 45, 55, 12),
            },
            {
                "description": "Baked salmon with a side salad and brown rice",
                "ingredients": [("Salmon", "180g"), ("Mixed Greens", "100g"), ("Brown Rice", "150g")],
                "macros": (560, 40, 50, 20),
            },
            {
                "description": "Turkey chili with a side of brown rice",
                "ingredients": [("Turkey Chili", "250g"), ("Brown Rice", "150g")],
                "macros": (520, 38, 55, 14),
            },
        ],
        "Snack": [
            {
                "description": "Greek yogurt with granola",
                "ingredients": [("Greek Yogurt", "200g"), ("Granola", "30g")],
                "macros": (260, 20, 30, 6),
            },
            {
                "description": "Apple slices with a small handful of almonds",
                "ingredients": [("Apple", "1 medium"), ("Almonds", "20g")],
                "macros": (200, 5, 22, 11),
            },
            {
                "description": "Hummus with carrot and cucumber sticks",
                "ingredients": [("Hummus", "60g"), ("Carrot", "80g"), ("Cucumber", "80g")],
                "macros": (180, 6, 18, 9),
            },
        ],
    },
}

_DIETARY_OVERRIDES = {
    "vegetarian": {
        "Breakfast": [
            {
                "description": "Greek yogurt with berries, chia seeds, and granola",
                "ingredients": [("Greek Yogurt", "200g"), ("Mixed Berries", "80g"), ("Chia Seeds", "10g"), ("Granola", "20g")],
                "macros": (340, 24, 42, 8),
            },
            {
                "description": "Veggie omelette with spinach and feta cheese",
                "ingredients": [("Eggs", "3"), ("Spinach", "50g"), ("Feta Cheese", "30g")],
                "macros": (320, 22, 6, 22),
            },
            {
                "description": "Overnight oatmeal with berries and a scoop of protein powder",
                "ingredients": [("Oats", "80g"), ("Mixed Berries", "80g"), ("Protein Powder", "1 scoop")],
                "macros": (380, 26, 50, 8),
            },
        ],
        "Lunch": [
            {
                "description": "Chickpea and quinoa salad with mixed greens and olive oil dressing",
                "ingredients": [("Chickpeas", "150g"), ("Quinoa", "100g"), ("Mixed Greens", "80g"), ("Olive Oil", "1 tbsp")],
                "macros": (420, 18, 55, 14),
            },
            {
                "description": "Caprese sandwich with mozzarella, tomato, and basil",
                "ingredients": [("Mozzarella", "100g"), ("Tomato", "100g"), ("Whole-Grain Bread", "2 slices"), ("Basil", "5g")],
                "macros": (400, 20, 38, 18),
            },
            {
                "description": "Black bean and corn salad with avocado",
                "ingredients": [("Black Beans", "150g"), ("Corn", "80g"), ("Avocado", "0.5")],
                "macros": (400, 16, 50, 16),
            },
        ],
        "Dinner": [
            {
                "description": "Grilled tofu or paneer with steamed broccoli and quinoa",
                "ingredients": [("Paneer", "150g"), ("Broccoli", "150g"), ("Quinoa", "100g")],
                "macros": (440, 26, 40, 18),
            },
            {
                "description": "Vegetable and paneer curry with brown rice",
                "ingredients": [("Paneer", "150g"), ("Mixed Vegetables", "150g"), ("Brown Rice", "150g")],
                "macros": (480, 24, 55, 16),
            },
            {
                "description": "Stuffed bell peppers with quinoa, black beans, and a side salad",
                "ingredients": [("Bell Peppers", "2"), ("Quinoa", "100g"), ("Black Beans", "100g"), ("Mixed Greens", "50g")],
                "macros": (420, 20, 55, 12),
            },
        ],
        "Snack": [
            {
                "description": "Apple slices with a small handful of almonds",
                "ingredients": [("Apple", "1 medium"), ("Almonds", "20g")],
                "macros": (200, 5, 22, 11),
            },
            {
                "description": "Greek yogurt with a drizzle of honey",
                "ingredients": [("Greek Yogurt", "200g"), ("Honey", "1 tbsp")],
                "macros": (220, 18, 26, 4),
            },
            {
                "description": "Hummus with carrot and cucumber sticks",
                "ingredients": [("Hummus", "60g"), ("Carrot", "80g"), ("Cucumber", "80g")],
                "macros": (180, 6, 18, 9),
            },
        ],
    },
    "vegan": {
        "Breakfast": [
            {
                "description": "Oatmeal with banana, chia seeds, and almond milk",
                "ingredients": [("Oats", "80g"), ("Banana", "1"), ("Chia Seeds", "10g"), ("Almond Milk", "200ml")],
                "macros": (380, 12, 58, 10),
            },
            {
                "description": "Whole-grain toast with almond butter and banana",
                "ingredients": [("Whole-Grain Toast", "2 slices"), ("Almond Butter", "1 tbsp"), ("Banana", "1")],
                "macros": (360, 10, 50, 14),
            },
            {
                "description": "Smoothie with banana, spinach, and plant-based protein powder",
                "ingredients": [("Banana", "1"), ("Spinach", "40g"), ("Plant Protein Powder", "1 scoop"), ("Almond Milk", "200ml")],
                "macros": (320, 24, 40, 6),
            },
        ],
        "Lunch": [
            {
                "description": "Lentil and quinoa bowl with mixed vegetables and tahini dressing",
                "ingredients": [("Lentils", "150g"), ("Quinoa", "100g"), ("Mixed Vegetables", "100g"), ("Tahini", "1 tbsp")],
                "macros": (460, 22, 60, 14),
            },
            {
                "description": "Chickpea salad with cucumber, tomato, and olive oil",
                "ingredients": [("Chickpeas", "150g"), ("Cucumber", "80g"), ("Tomato", "80g"), ("Olive Oil", "1 tbsp")],
                "macros": (380, 16, 42, 16),
            },
            {
                "description": "Chickpea salad sandwich on whole-grain bread",
                "ingredients": [("Chickpeas", "120g"), ("Whole-Grain Bread", "2 slices"), ("Mixed Greens", "30g")],
                "macros": (420, 18, 55, 12),
            },
        ],
        "Dinner": [
            {
                "description": "Tofu stir-fry with brown rice and mixed vegetables",
                "ingredients": [("Tofu", "180g"), ("Brown Rice", "150g"), ("Mixed Vegetables", "150g")],
                "macros": (460, 22, 55, 14),
            },
            {
                "description": "Chickpea and vegetable stew with quinoa and mixed greens",
                "ingredients": [("Chickpeas", "150g"), ("Mixed Vegetables", "150g"), ("Quinoa", "100g"), ("Mixed Greens", "50g")],
                "macros": (420, 18, 58, 10),
            },
            {
                "description": "Lentil curry with a side salad",
                "ingredients": [("Lentils", "150g"), ("Mixed Vegetables", "100g"), ("Mixed Greens", "50g")],
                "macros": (400, 20, 55, 10),
            },
        ],
        "Snack": [
            {
                "description": "Trail mix with dried fruit and nuts",
                "ingredients": [("Trail Mix", "40g")],
                "macros": (220, 6, 22, 12),
            },
            {
                "description": "Hummus with carrot and cucumber sticks",
                "ingredients": [("Hummus", "60g"), ("Carrot", "80g"), ("Cucumber", "80g")],
                "macros": (180, 6, 18, 9),
            },
            {
                "description": "A banana with a tablespoon of almond butter",
                "ingredients": [("Banana", "1"), ("Almond Butter", "1 tbsp")],
                "macros": (180, 4, 24, 9),
            },
        ],
    },
}


def _build_meal_entry(meal: str, option: dict, note: str) -> MealEntry:
    calories, protein_g, carbs_g, fat_g = option["macros"]
    return MealEntry(
        meal=meal,
        description=option["description"],
        notes=note,
        ingredients=[Ingredient(name=name, quantity=qty) for name, qty in option["ingredients"]],
        calories=calories,
        protein_g=protein_g,
        carbs_g=carbs_g,
        fat_g=fat_g,
    )


def _build_plan(fitness_goal: str, dietary_preferences: str, variation_seed: str) -> MealPlanContent:
    rng = random.Random(variation_seed)
    base = _MEAL_OPTIONS_BY_GOAL.get(fitness_goal, _MEAL_OPTIONS_BY_GOAL["general_fitness"])
    overrides = _DIETARY_OVERRIDES.get(dietary_preferences)
    slots = {**base, **(overrides or {})}

    note = None
    if dietary_preferences in ("vegetarian", "vegan"):
        note = f"Adjusted for a {dietary_preferences} diet."

    daily_meals = [_build_meal_entry(meal, rng.choice(options), note) for meal, options in slots.items()]

    if dietary_preferences == "none":
        summary = f"A meal plan supporting the user's {fitness_goal.replace('_', ' ')} goal."
    else:
        summary = (
            f"A {dietary_preferences.replace('_', ' ')} meal plan supporting "
            f"{fitness_goal.replace('_', ' ')}."
        )

    return MealPlanContent(summary=summary, daily_meals=daily_meals)


@agent.on_rest_post("/meal/generate", MealGenerateRequest, MealGenerateResponse)
async def handle_generate(ctx: Context, req: MealGenerateRequest) -> MealGenerateResponse:
    ctx.logger.info("meal_agent.generate.start", extra={"request_id": req.request_id})
    try:
        content = _build_plan(req.profile.fitness_goal, req.profile.dietary_preferences, req.request_id)
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

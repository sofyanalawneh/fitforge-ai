import type { CSSProperties } from "react";
import type { MealEntry } from "../../types";
import { MEAL_PLACEHOLDER, getMealImage } from "../../utils/planImages";
import { PlanImage } from "../PlanImage";
import { PlanCard } from "./PlanCard";
import { PlanStat } from "./PlanStat";

interface MealCardProps {
  meal: MealEntry;
  style?: CSSProperties;
}

/** Renders a nutrition stat only when the API actually provides it — older
 * saved plans may predate these fields, so this row simply stays empty for
 * them; no values are invented here. */
function buildNutritionStats(meal: MealEntry): Array<{ label: string; value: string }> {
  const stats: Array<{ label: string; value: string }> = [];
  if (meal.calories != null) stats.push({ label: "Calories", value: `${meal.calories} kcal` });
  if (meal.protein != null) stats.push({ label: "Protein", value: `${meal.protein}g` });
  if (meal.carbs != null) stats.push({ label: "Carbs", value: `${meal.carbs}g` });
  if (meal.fat != null) stats.push({ label: "Fat", value: `${meal.fat}g` });
  return stats;
}

export function MealCard({ meal, style }: MealCardProps) {
  const stats = buildNutritionStats(meal);

  return (
    <PlanCard
      accent="meal"
      style={style}
      visual={
        <PlanImage
          src={getMealImage(meal)}
          alt={meal.description || meal.meal}
          variant="plan"
          fallbackSrc={MEAL_PLACEHOLDER}
        />
      }
    >
      <span className="plan-card-eyebrow">{meal.meal}</span>
      <h3 className="plan-card-title">{meal.description}</h3>
      {meal.notes && <p className="plan-card-notes">{meal.notes}</p>}
      {meal.ingredients && meal.ingredients.length > 0 && (
        <div className="meal-ingredient-chips">
          {meal.ingredients.map((ingredient) => (
            <span className="meal-ingredient-chip" key={ingredient.name}>
              {ingredient.name} <span className="meal-ingredient-chip-qty">{ingredient.quantity}</span>
            </span>
          ))}
        </div>
      )}
      {stats.length > 0 && (
        <div className="plan-stat-row">
          {stats.map((stat) => (
            <PlanStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      )}
    </PlanCard>
  );
}

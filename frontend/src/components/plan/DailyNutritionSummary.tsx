import type { MacroTotals } from "../../utils/mealStats";
import { IconCalendarCheck, IconDumbbell, IconFlame, IconTarget } from "../icons";

/** Bottom green-tinted bar summing the plan's own generated meal macros
 * (computeDailyTotals) — real totals, not a target/estimate. */
export function DailyNutritionSummary({ totals }: { totals: MacroTotals }) {
  return (
    <div className="daily-nutrition-summary">
      <div className="daily-nutrition-summary-title">Daily Nutrition Summary</div>
      <div className="daily-nutrition-summary-grid">
        <div className="daily-nutrition-summary-item">
          <IconFlame />
          <div>
            <div className="daily-nutrition-summary-label">Calories</div>
            <div className="daily-nutrition-summary-value">{totals.calories} kcal</div>
          </div>
        </div>
        <div className="daily-nutrition-summary-item">
          <IconDumbbell />
          <div>
            <div className="daily-nutrition-summary-label">Protein</div>
            <div className="daily-nutrition-summary-value">{totals.protein} g</div>
          </div>
        </div>
        <div className="daily-nutrition-summary-item">
          <IconCalendarCheck />
          <div>
            <div className="daily-nutrition-summary-label">Carbs</div>
            <div className="daily-nutrition-summary-value">{totals.carbs} g</div>
          </div>
        </div>
        <div className="daily-nutrition-summary-item">
          <IconTarget />
          <div>
            <div className="daily-nutrition-summary-label">Fats</div>
            <div className="daily-nutrition-summary-value">{totals.fat} g</div>
          </div>
        </div>
      </div>
    </div>
  );
}

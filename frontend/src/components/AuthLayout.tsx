import type { ReactNode } from "react";
import { IconCalendarCheck, IconDumbbell, IconFlame, IconSalad } from "./icons";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-hero d-none d-lg-flex">
        <div className="auth-hero-inner">
          <span className="auth-hero-mark">
            <IconFlame />
          </span>
          <h2>
            Train smarter.
            <br />
            Eat with purpose.
          </h2>
          <p>
            AI-generated workout and meal plans built around your goals — saved and ready
            whenever you are.
          </p>
          <ul className="auth-hero-features">
            <li>
              <span className="auth-hero-icon">
                <IconDumbbell />
              </span>
              Personalized workout plans
            </li>
            <li>
              <span className="auth-hero-icon">
                <IconSalad />
              </span>
              Meal plans that fit your diet
            </li>
            <li>
              <span className="auth-hero-icon">
                <IconCalendarCheck />
              </span>
              Save your plans, revisit anytime
            </li>
          </ul>
        </div>
      </div>
      <div className="auth-form-panel">{children}</div>
    </div>
  );
}

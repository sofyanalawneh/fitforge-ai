import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/authService";
import { PlanImage } from "../components/PlanImage";
import { PlanTypeBadge } from "../components/PlanTypeBadge";
import {
  IconArrowRight,
  IconCalendarCheck,
  IconCheckCircle,
  IconClose,
  IconDumbbell,
  IconFlame,
  IconMenu,
  IconSalad,
  IconSparkle,
  IconTarget,
  IconUser,
} from "../components/icons";
import { MEAL_PLACEHOLDER, getExerciseImage, getMealImage } from "../utils/planImages";

const FEATURES = [
  {
    icon: <IconDumbbell />,
    title: "AI-generated workout plans",
    body: "A structured weekly training split built around your goal, experience, and days available — every exercise programmed with sets, reps, and rest.",
  },
  {
    icon: <IconSalad />,
    title: "Personalized meal plans",
    body: "Daily meals tailored to your dietary preferences, so eating well fits the way you actually live.",
  },
  {
    icon: <IconTarget />,
    title: "Calorie and macro targets",
    body: "Clear daily calorie and protein targets that stay aligned with your goal, whether that's fat loss, muscle, or performance.",
  },
  {
    icon: <IconCalendarCheck />,
    title: "Save and manage your plans",
    body: "Every plan is saved to your dashboard, so you can revisit, compare, and pick up right where you left off.",
  },
];

const STEPS = [
  {
    icon: <IconUser />,
    title: "Create your profile",
    body: "Tell us your age, body stats, and activity level so plans start from the right baseline.",
  },
  {
    icon: <IconTarget />,
    title: "Select your goal and preferences",
    body: "Pick a fitness goal, workout experience, and dietary preference — FitForge AI adapts to all three.",
  },
  {
    icon: <IconSparkle />,
    title: "Receive personalized AI plans",
    body: "Get a structured workout plan and meal plan generated instantly, ready to save and follow.",
  },
];

const PREVIEW_EXERCISES = [
  { name: "Bench Press", sets: 4, reps: "6-8 reps" },
  { name: "Bent-Over Row", sets: 4, reps: "8-10 reps" },
  { name: "Overhead Press", sets: 3, reps: "8-10 reps" },
];

const PREVIEW_MEALS = [
  { meal: "Breakfast", description: "Scrambled eggs, oats, and a banana", calories: 480, protein: 32 },
  { meal: "Lunch", description: "Grilled chicken breast with rice and vegetables", calories: 620, protein: 48 },
  { meal: "Dinner", description: "Salmon with a green salad", calories: 540, protein: 42 },
];

export function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileNav() {
    setMobileOpen(false);
  }

  async function handleLogout() {
    closeMobileNav();
    await logout();
    navigate("/");
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand" onClick={closeMobileNav}>
            <span className="brand-mark">
              <IconFlame />
            </span>
            FitForge AI
          </Link>

          <nav
            id="landing-nav-links"
            className={`landing-nav-links${mobileOpen ? " open" : ""}`}
            aria-label="Primary"
          >
            <a href="#features" onClick={closeMobileNav}>
              Features
            </a>
            <a href="#how-it-works" onClick={closeMobileNav}>
              How it works
            </a>
            <div className="landing-nav-actions">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-outline-dark btn-sm" onClick={closeMobileNav}>
                    Dashboard
                  </Link>
                  <button type="button" className="btn btn-brand btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-dark btn-sm" onClick={closeMobileNav}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-brand btn-sm" onClick={closeMobileNav}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            type="button"
            className="landing-nav-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="landing-nav-links"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>

      <main>
        <Hero isAuthed={!!user} />
        <FeaturesSection />
        <HowItWorksSection />
        <PreviewSection />
        <FinalCta isAuthed={!!user} />
      </main>

      <LandingFooter />
    </div>
  );
}

function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="landing-hero" aria-label="Introduction">
      <div className="landing-container landing-hero-grid">
        <div className="landing-hero-copy">
          <span className="ff-eyebrow">
            <IconSparkle />
            AI-powered fitness &amp; nutrition
          </span>
          <h1>Train smarter. Eat better. Transform with AI.</h1>
          <p className="landing-hero-lead">
            FitForge AI builds personalized workout and meal plans around your goals, experience
            level, and dietary preferences — then keeps every plan saved and ready whenever you
            need it.
          </p>
          <div className="landing-hero-actions">
            <Link to={isAuthed ? "/dashboard" : "/register"} className="btn btn-brand btn-lg">
              {isAuthed ? "Go to dashboard" : "Get started free"}
              <IconArrowRight />
            </Link>
            <a href="#how-it-works" className="btn btn-outline-dark btn-lg">
              See how it works
            </a>
          </div>
        </div>

        <div className="landing-hero-media">
          <div className="landing-hero-image">
            <img src="/images/workouts/strength.webp" alt="Athlete performing a barbell deadlift in the gym" />
          </div>
          <div className="landing-hero-stat landing-hero-stat-1">
            <span className="landing-hero-stat-icon">
              <IconCheckCircle />
            </span>
            <div>
              <div className="landing-hero-stat-value">92%</div>
              <div className="landing-hero-stat-label">Workout readiness</div>
            </div>
          </div>
          <div className="landing-hero-stat landing-hero-stat-2">
            <span className="landing-hero-stat-icon">
              <IconTarget />
            </span>
            <div>
              <div className="landing-hero-stat-value">2,150 kcal</div>
              <div className="landing-hero-stat-label">Daily calorie target</div>
            </div>
          </div>
          <div className="landing-hero-stat landing-hero-stat-3">
            <span className="landing-hero-stat-icon">
              <IconDumbbell />
            </span>
            <div>
              <div className="landing-hero-stat-value">165g</div>
              <div className="landing-hero-stat-label">Protein target</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="landing-section" aria-labelledby="features-heading">
      <div className="landing-container">
        <div className="landing-section-header">
          <span className="ff-eyebrow">
            <IconSparkle />
            Features
          </span>
          <h2 id="features-heading">Everything you need to train and eat with a plan</h2>
          <p>One platform for the workout and nutrition side of your goal — generated for you, not a generic template.</p>
        </div>

        <div className="landing-features-grid">
          {FEATURES.map((feature) => (
            <div className="card-ff landing-feature-card" key={feature.title}>
              <div className="card-ff-body">
                <span className="landing-feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section landing-section-alt" aria-labelledby="how-it-works-heading">
      <div className="landing-container">
        <div className="landing-section-header">
          <span className="ff-eyebrow">
            <IconCheckCircle />
            How it works
          </span>
          <h2 id="how-it-works-heading">From profile to plan in three steps</h2>
          <p>No spreadsheets, no guesswork — answer a few questions and FitForge AI does the programming.</p>
        </div>

        <ol className="landing-steps">
          {STEPS.map((step, index) => (
            <li className="landing-step" key={step.title}>
              <span className="landing-step-number">{index + 1}</span>
              <h3>
                {step.icon}
                {step.title}
              </h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PreviewSection() {
  return (
    <section className="landing-section" aria-labelledby="preview-heading">
      <div className="landing-container">
        <div className="landing-section-header">
          <span className="ff-eyebrow">
            <IconDumbbell />
            Product preview
          </span>
          <h2 id="preview-heading">A real look at what FitForge AI generates</h2>
          <p>Sample output from the same workout and meal plan engine you'll use after signing up.</p>
        </div>

        <div className="landing-preview-grid">
          <div className="card-ff">
            <div className="card-ff-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <PlanTypeBadge type="workout" />
              </div>
              <PlanImage
                src={getExerciseImage(PREVIEW_EXERCISES[0].name)}
                alt="Bench press exercise preview"
                variant="card"
              />
              <p className="fw-semibold mb-3">Build Muscle — Upper Body (Push Focus)</p>
              {PREVIEW_EXERCISES.map((exercise) => (
                <div className="plan-exercise-row is-static" key={exercise.name}>
                  <div className="d-flex align-items-center gap-2">
                    <PlanImage src={getExerciseImage(exercise.name)} alt={exercise.name} variant="thumb" />
                    <span className="exercise-name">{exercise.name}</span>
                  </div>
                  <span className="exercise-volume">
                    {exercise.sets} sets × {exercise.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-ff">
            <div className="card-ff-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <PlanTypeBadge type="meal" />
              </div>
              <PlanImage
                src={getMealImage(PREVIEW_MEALS[1])}
                alt="Grilled chicken and rice meal preview"
                variant="card"
                fallbackSrc={MEAL_PLACEHOLDER}
              />
              <p className="fw-semibold mb-3">General Fitness — Daily Meal Plan</p>
              {PREVIEW_MEALS.map((meal) => (
                <div className="meal-entry is-static" key={meal.meal}>
                  <div className="d-flex align-items-start gap-2">
                    <PlanImage
                      src={getMealImage(meal)}
                      alt={meal.meal}
                      variant="thumb"
                      fallbackSrc={MEAL_PLACEHOLDER}
                    />
                    <div>
                      <span className="meal-label">{meal.meal}</span>
                      {meal.description}
                      <div className="landing-preview-macro">
                        <span>
                          <strong>{meal.calories}</strong> kcal
                        </span>
                        <span>
                          <strong>{meal.protein}g</strong> protein
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="landing-final-cta" aria-labelledby="final-cta-heading">
      <div className="landing-container">
        <h2 id="final-cta-heading">Ready to train smarter?</h2>
        <p>Create your free account and get your first AI-generated workout and meal plan in minutes.</p>
        <Link to={isAuthed ? "/dashboard" : "/register"} className="btn btn-brand btn-lg">
          {isAuthed ? "Go to dashboard" : "Create your free account"}
        </Link>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer-inner">
        <span className="landing-footer-brand">
          <span className="brand-mark">
            <IconFlame />
          </span>
          FitForge AI
        </span>
        <nav className="landing-footer-nav" aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Log in</Link>
          <Link to="/register">Get started</Link>
        </nav>
        <span className="landing-footer-copy">© {new Date().getFullYear()} FitForge AI. Train smarter, eat better.</span>
      </div>
    </footer>
  );
}

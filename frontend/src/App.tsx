import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RequireAuth } from "./components/RequireAuth";
import { Dashboard } from "./pages/Dashboard";
import { GenerateMeal } from "./pages/GenerateMeal";
import { GenerateWorkout } from "./pages/GenerateWorkout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { PlanDetail } from "./pages/PlanDetail";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/generate/workout"
          element={
            <RequireAuth>
              <GenerateWorkout />
            </RequireAuth>
          }
        />
        <Route
          path="/generate/meal"
          element={
            <RequireAuth>
              <GenerateMeal />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/plans/:planId"
          element={
            <RequireAuth>
              <PlanDetail />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Landing />} />
      </Routes>
    </AppShell>
  );
}

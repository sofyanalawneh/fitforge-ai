import { Route, Routes, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppShell } from "./components/AppShell";
import { DesignModeSwitcher } from "./components/DesignModeSwitcher";
import { RequireAuth } from "./components/RequireAuth";
import { useDesignMode } from "./contexts/DesignModeContext";
import { MaterialAppLayout } from "./layouts/MaterialAppLayout";
import { materialTheme } from "./theme/material/materialTheme";
import { Dashboard } from "./pages/Dashboard";
import { GenerateMeal } from "./pages/GenerateMeal";
import { GenerateWorkout } from "./pages/GenerateWorkout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { MaterialLogin } from "./pages/material/MaterialLogin";
import { MaterialRegister } from "./pages/material/MaterialRegister";
import { PlanDetail } from "./pages/PlanDetail";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";

const MATERIAL_AUTH_PATHS = new Set(["/login", "/register"]);

export function App() {
  const { mode } = useDesignMode();
  const { pathname } = useLocation();

  // /login and /register must stay reachable by unauthenticated visitors, but
  // MaterialAppLayout wraps its entire routes tree in RequireAuth (it's only
  // meant for the authenticated app shell). So in Material mode, those two
  // paths render their own standalone auth pages instead of MaterialAppLayout.
  const isMaterialAuthRoute = mode === "material" && MATERIAL_AUTH_PATHS.has(pathname);

  return (
    <>
      <DesignModeSwitcher />
      {isMaterialAuthRoute ? (
        <ThemeProvider theme={materialTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<MaterialLogin />} />
            <Route path="/register" element={<MaterialRegister />} />
          </Routes>
        </ThemeProvider>
      ) : mode === "material" ? (
        <MaterialAppLayout />
      ) : (
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
      )}
    </>
  );
}

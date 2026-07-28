import { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { RequireAuth } from "../components/RequireAuth";
import { MaterialLoadingFallback } from "../components/material/MaterialLoadingFallback";
import { MaterialSidebar, MATERIAL_DRAWER_WIDTH } from "../components/material/MaterialSidebar";
import { MaterialTopBar } from "../components/material/MaterialTopBar";
import { materialTheme } from "../theme/material/materialTheme";

// Lazily loaded: each Material page (and its share of the MUI bundle) only
// downloads once a user actually switches to Material mode and visits that
// route, instead of all being bundled into the main chunk.
const MaterialDashboard = lazy(() =>
  import("../pages/material/MaterialDashboard").then((m) => ({ default: m.MaterialDashboard })),
);
const MaterialGenerateWorkout = lazy(() =>
  import("../pages/material/MaterialGenerateWorkout").then((m) => ({ default: m.MaterialGenerateWorkout })),
);
const MaterialGenerateMeal = lazy(() =>
  import("../pages/material/MaterialGenerateMeal").then((m) => ({ default: m.MaterialGenerateMeal })),
);
const MaterialProgress = lazy(() =>
  import("../pages/material/MaterialProgress").then((m) => ({ default: m.MaterialProgress })),
);
const MaterialProfile = lazy(() =>
  import("../pages/material/MaterialProfile").then((m) => ({ default: m.MaterialProfile })),
);

/** The real Material app shell: responsive AppBar + Drawer, and its own
 * routing tree. Reuses the same URL paths as Classic where they overlap
 * (/dashboard, /generate/workout, /generate/meal, /profile) so the URL
 * stays meaningful regardless of which design is active — only one of
 * Classic's <Routes> or this one is ever mounted per `mode`, so there is no
 * collision. `RequireAuth` is reused as pure auth-gate logic (no Classic
 * styling of its own), same as `useAuth`/`apiClient` elsewhere in this app. */
export function MaterialAppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      <RequireAuth>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <MaterialTopBar onMenuClick={() => setMobileOpen(true)} />
          <MaterialSidebar
            variant={isDesktop ? "permanent" : "temporary"}
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
          <Box
            component="main"
            sx={{
              ml: { md: `${MATERIAL_DRAWER_WIDTH}px` },
            }}
          >
            <Toolbar />
            <Suspense fallback={<MaterialLoadingFallback />}>
              <Routes>
                <Route path="/dashboard" element={<MaterialDashboard />} />
                <Route path="/generate/workout" element={<MaterialGenerateWorkout />} />
                <Route path="/generate/meal" element={<MaterialGenerateMeal />} />
                <Route path="/progress" element={<MaterialProgress />} />
                <Route path="/profile" element={<MaterialProfile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Box>
        </Box>
      </RequireAuth>
    </ThemeProvider>
  );
}

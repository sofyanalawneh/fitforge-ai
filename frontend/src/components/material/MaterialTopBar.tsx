import { AppBar, Avatar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MATERIAL_DRAWER_WIDTH } from "./MaterialSidebar";

interface MaterialTopBarProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/generate/workout": "Workouts",
  "/generate/meal": "Meal Plans",
  "/progress": "Progress",
  "/profile": "Profile",
};

/** Responsive AppBar: hamburger menu (mobile only, toggles the Drawer), the
 * current page's title (from the route), and a user avatar on the right. */
export function MaterialTopBar({ onMenuClick }: MaterialTopBarProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const initial = user?.displayName?.trim().charAt(0).toUpperCase() || "?";
  const pageTitle = PAGE_TITLES[pathname] ?? "FitForge AI";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(20, 22, 31, 0.08)",
        width: { md: `calc(100% - ${MATERIAL_DRAWER_WIDTH}px)` },
        ml: { md: `${MATERIAL_DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: "none" } }}
            aria-label="Open navigation"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
            {pageTitle}
          </Typography>
        </Box>
        <Tooltip title={user?.email ?? "Account"}>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {initial}
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

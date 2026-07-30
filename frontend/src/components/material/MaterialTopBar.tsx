import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/authService";
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const initial = user?.displayName?.trim().charAt(0).toUpperCase() || "?";
  const pageTitle = PAGE_TITLES[pathname] ?? "FitForge AI";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          {isDesktop ? (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{ borderColor: "rgba(20, 22, 31, 0.16)" }}
            >
              Logout
            </Button>
          ) : (
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} aria-label="Logout" size="small">
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={user?.email ?? "Account"}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
              {initial}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

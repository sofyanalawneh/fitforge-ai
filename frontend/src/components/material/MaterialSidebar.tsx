import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useLocation, useNavigate } from "react-router-dom";

export const MATERIAL_DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: HomeRoundedIcon },
  { label: "Workouts", path: "/generate/workout", icon: FitnessCenterRoundedIcon },
  { label: "Meal Plans", path: "/generate/meal", icon: RestaurantRoundedIcon },
  { label: "Progress", path: "/progress", icon: TrendingUpRoundedIcon },
  { label: "Profile", path: "/profile", icon: PersonRoundedIcon },
];

interface MaterialSidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "temporary";
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: MATERIAL_DRAWER_WIDTH, display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocalFireDepartmentRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          FitForge AI
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.5, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => {
                navigate(item.path);
                onNavigate();
              }}
              aria-current={active ? "page" : undefined}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: "text.secondary",
                transition: "background-color 0.12s ease, color 0.12s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 90, 54, 0.08)",
                  color: "text.primary",
                },
                "&:active": {
                  bgcolor: "rgba(255, 90, 54, 0.16)",
                },
                "&.Mui-focusVisible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "#fff" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontWeight: active ? 700 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

/** Responsive Drawer: permanent on desktop, temporary (overlay) on mobile.
 * The parent decides which variant to render based on breakpoint. */
export function MaterialSidebar({ open, onClose, variant }: MaterialSidebarProps) {
  if (variant === "permanent") {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: MATERIAL_DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: MATERIAL_DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
      >
        <SidebarContent onNavigate={() => {}} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": { width: MATERIAL_DRAWER_WIDTH, boxSizing: "border-box" },
      }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}

import { Box, Button, Typography } from "@mui/material";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { DashboardCard } from "./DashboardCard";

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

/** The whole card is clickable/keyboard-activatable (role="button"), with an
 * explicit Button as a clear, redundant action affordance — its click is
 * stopped from bubbling so onClick only ever fires once per interaction. */
export function QuickActionCard({ icon, title, description, buttonLabel, onClick }: QuickActionCardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  function handleButtonClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick();
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      sx={{
        height: "100%",
        cursor: "pointer",
        borderRadius: "16px",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <DashboardCard
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(20,22,31,0.06), 0 12px 28px rgba(20,22,31,0.08)",
            borderColor: "rgba(20, 22, 31, 0.14)",
          },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "#fff",
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {description}
        </Typography>
        <Button variant="contained" onClick={handleButtonClick} sx={{ alignSelf: "flex-start" }}>
          {buttonLabel}
        </Button>
      </DashboardCard>
    </Box>
  );
}

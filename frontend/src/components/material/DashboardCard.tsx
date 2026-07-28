import { Paper, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Generic white, rounded, subtly-elevated card shell other dashboard
 * sections are built on top of. */
export function DashboardCard({ children, sx }: DashboardCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        border: "1px solid rgba(20, 22, 31, 0.08)",
        boxShadow: "0 1px 2px rgba(20,22,31,0.04), 0 8px 20px rgba(20,22,31,0.05)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

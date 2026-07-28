import { Box, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { DashboardCard } from "./DashboardCard";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Full text for a Tooltip when `value` is a string that might overflow
   * (e.g. a long workout focus name) — omit when value is already short. */
  tooltip?: string;
  accentColor: string;
  footer?: ReactNode;
}

/** One of the 4 top dashboard metric cards: icon, label, value, accent
 * color, plus an optional footer slot (used for progress bars/chips). */
export function MetricCard({ icon, label, value, tooltip, accentColor, footer }: MetricCardProps) {
  const valueEl = (
    <Typography
      variant="h5"
      sx={{
        mt: 0.25,
        mb: footer ? 1.5 : 0,
        fontSize: { xs: "1.15rem", sm: "1.35rem" },
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  );

  return (
    <DashboardCard
      sx={{
        height: "100%",
        transition: "box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease",
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
          bgcolor: `${accentColor}1f`,
          color: accentColor,
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {tooltip ? <Tooltip title={tooltip}>{valueEl}</Tooltip> : valueEl}
      {footer}
    </DashboardCard>
  );
}

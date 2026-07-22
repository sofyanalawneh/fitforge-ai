import type { ReactNode } from "react";
import { IconAlertCircle, IconAlertTriangle, IconCheckCircle } from "./icons";

type Variant = "danger" | "warning" | "success";

const ICONS: Record<Variant, ReactNode> = {
  danger: <IconAlertCircle />,
  warning: <IconAlertTriangle />,
  success: <IconCheckCircle />,
};

export function StatusAlert({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  return (
    <div className={`ff-alert ff-alert-${variant} mb-3`} role="alert">
      <span className="ff-alert-icon">{ICONS[variant]}</span>
      <div className="ff-alert-body">{children}</div>
    </div>
  );
}

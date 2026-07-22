import type { ReactNode } from "react";
import { IconSparkle } from "./icons";

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="ff-state">
      <div className="ff-state-icon">{icon ?? <IconSparkle />}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

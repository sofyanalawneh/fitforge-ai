import type { ReactNode } from "react";

/** Dark gradient banner for a plan's summary/progression text. Reuses the
 * existing `.plan-summary-banner` styling under a shared, reusable name. */
export function InfoNotice({ children }: { children: ReactNode }) {
  return <div className="plan-summary-banner">{children}</div>;
}

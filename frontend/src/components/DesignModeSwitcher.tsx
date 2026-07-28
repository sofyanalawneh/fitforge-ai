import type { CSSProperties } from "react";
import { useDesignMode, type DesignMode } from "../contexts/DesignModeContext";

// Deliberately self-contained (inline styles only, no theme.css or Bootstrap
// classes) so this cross-cutting control can never be affected by — or
// accidentally affect — either design's own stylesheet. It must render
// identically regardless of which design is active underneath it.

const containerStyle: CSSProperties = {
  position: "fixed",
  top: 12,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2000,
  display: "flex",
  gap: 2,
  padding: 4,
  borderRadius: 999,
  backgroundColor: "#14161f",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

function buttonStyle(active: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: active ? "#14161f" : "rgba(255, 255, 255, 0.7)",
    backgroundColor: active ? "#ffffff" : "transparent",
    transition: "background-color 0.15s ease, color 0.15s ease",
  };
}

const OPTIONS: Array<{ mode: DesignMode; label: string }> = [
  { mode: "classic", label: "Classic Design" },
  { mode: "material", label: "Material UI Design" },
];

export function DesignModeSwitcher() {
  const { mode, setMode } = useDesignMode();

  return (
    <div style={containerStyle} role="group" aria-label="Design mode">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          style={buttonStyle(mode === option.mode)}
          aria-pressed={mode === option.mode}
          onClick={() => setMode(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

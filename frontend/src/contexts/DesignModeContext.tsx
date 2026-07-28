import { createContext, useContext, useState, type ReactNode } from "react";

export type DesignMode = "classic" | "material";

const STORAGE_KEY = "fitforge:design-mode";

interface DesignModeContextValue {
  mode: DesignMode;
  setMode: (mode: DesignMode) => void;
}

const DesignModeContext = createContext<DesignModeContextValue>({
  mode: "classic",
  setMode: () => {},
});

function readStoredMode(): DesignMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "material" ? "material" : "classic";
}

/** Independent of AuthContext — the design mode is a pure UI preference, not
 * tied to the signed-in user, and must keep working on public pages too. */
export function DesignModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DesignMode>(readStoredMode);

  function setMode(next: DesignMode) {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <DesignModeContext.Provider value={{ mode, setMode }}>{children}</DesignModeContext.Provider>
  );
}

export function useDesignMode(): DesignModeContextValue {
  return useContext(DesignModeContext);
}

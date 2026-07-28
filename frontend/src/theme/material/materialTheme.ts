import { createTheme } from "@mui/material/styles";

// A fully independent theme — these are plain literal values (not imports
// from theme.css), used only to keep the Material design on-brand. It never
// reads from or writes to the Classic Design's stylesheet or tokens.
export const materialTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ff5a36",
      dark: "#e14a2a",
    },
    background: {
      default: "#f5f6fa",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(20, 22, 31, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

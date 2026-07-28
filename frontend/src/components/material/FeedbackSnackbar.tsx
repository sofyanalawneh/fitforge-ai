import { Alert, Snackbar } from "@mui/material";

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

/** Thin Snackbar+Alert wrapper reused by the Material generate pages for
 * save/error feedback. */
export function FeedbackSnackbar({ open, message, severity, onClose }: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

import { Box, CircularProgress } from "@mui/material";

/** Suspense fallback for lazily-loaded Material route pages. */
export function MaterialLoadingFallback() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress />
    </Box>
  );
}

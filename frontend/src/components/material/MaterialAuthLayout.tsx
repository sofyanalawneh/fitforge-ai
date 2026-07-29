import type { ReactNode } from "react";
import { Avatar, Box, Card, CardContent, Stack, Typography, alpha } from "@mui/material";
import { IconFlame } from "../icons";

interface MaterialAuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared centered auth-card shell for the Material login/register pages.
 * Self-contained (own gradient background, own Card) rather than reusing
 * MaterialAppLayout — that layout gates everything behind RequireAuth, which
 * unauthenticated visitors hitting /login or /register must never pass through. */
export function MaterialAuthLayout({ title, subtitle, children, footer }: MaterialAuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        background: (theme) =>
          `radial-gradient(circle at 12% 8%, ${alpha(theme.palette.primary.main, 0.14)}, transparent 45%),` +
          `radial-gradient(circle at 88% 92%, ${alpha(theme.palette.primary.dark, 0.12)}, transparent 50%),` +
          `${theme.palette.background.default}`,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          boxShadow: "0 24px 64px rgba(20, 22, 31, 0.14)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={0.75} sx={{ mb: 4, alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52, mb: 1 }}>
              <IconFlame width={26} height={26} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              FitForge AI
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              {subtitle}
            </Typography>
          </Stack>
          {children}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {footer}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

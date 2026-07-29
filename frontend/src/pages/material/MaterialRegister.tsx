import { type FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Box, Button, IconButton, Link, Stack, TextField } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { DuplicateEmailError, registerWithEmail } from "../../services/authService";
import { MaterialAuthLayout } from "../../components/material/MaterialAuthLayout";

export function MaterialRegister() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(email, password, fullName);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const passwordAdornment = (
    <IconButton
      aria-label={showPassword ? "Hide password" : "Show password"}
      onClick={() => setShowPassword((v) => !v)}
      edge="end"
    >
      {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
    </IconButton>
  );

  return (
    <MaterialAuthLayout
      title="Create your account"
      subtitle="Start your personalized fitness journey today."
      footer={
        <>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
            Log in
          </Link>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            id="fullName"
            type="text"
            label="Full Name"
            required
            fullWidth
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            id="email"
            type="email"
            label="Email"
            required
            fullWidth
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            required
            fullWidth
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 8 characters."
            slotProps={{
              input: { endAdornment: passwordAdornment },
              htmlInput: { minLength: 8 },
            }}
          />
          <TextField
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            label="Confirm Password"
            required
            fullWidth
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            slotProps={{ input: { endAdornment: passwordAdornment } }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </Button>
        </Stack>
      </Box>
    </MaterialAuthLayout>
  );
}

import { Container, type ContainerProps } from "@mui/material";

/** Consistent max-width/padding for every Material page — one place to tune
 * the app's overall spacing rhythm. */
export function MaterialContainer({ children, ...props }: ContainerProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }} {...props}>
      {children}
    </Container>
  );
}

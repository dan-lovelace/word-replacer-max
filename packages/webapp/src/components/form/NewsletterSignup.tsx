import { useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import Box from "@mui/material/Box/Box";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Container from "@mui/material/Container/Container";
import Fade from "@mui/material/Fade/Fade";
import FormGroup from "@mui/material/FormGroup/FormGroup";
import Paper from "@mui/material/Paper/Paper";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import TextField from "@mui/material/TextField/TextField";
import Typography from "@mui/material/Typography/Typography";

import { getApiEndpoint } from "@worm/shared/src/api";
import {
  ApiMarketingSignupResponse,
  ApiResponse,
  MarketingContact,
} from "@worm/types";
import { ValidationErrors } from "@worm/types/src/validation";

import Button from "../button/Button";

const useMarketingSignup = () =>
  useMutation<
    ApiMarketingSignupResponse,
    AxiosError<ApiResponse<ApiMarketingSignupResponse>>,
    MarketingContact
  >({
    mutationFn: (newContact) =>
      axios.post(getApiEndpoint("POST:marketingSignup"), newContact),
  });

export default function NewsletterSignup() {
  const [canSubmit, setCanSubmit] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>();

  const { isPending, mutate } = useMarketingSignup();
  const containerRef = useRef<HTMLDivElement>();
  const { palette, zIndex } = useTheme();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setValidationErrors(undefined);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    if (!email) {
      return setValidationErrors({
        email: ["Email is required"],
      });
    }

    mutate(
      { email: String(email) },
      {
        onError(error) {
          const details: ValidationErrors | undefined =
            error.response?.data.error?.details;

          setValidationErrors(details);
        },
        onSuccess() {
          setCanSubmit(false);
        },
      }
    );
  };

  return (
    <Paper>
      <Container
        maxWidth="xs"
        sx={{
          pb: 2,
          pt: 4,
          textAlign: "center",
        }}
      >
        <Typography gutterBottom variant="h5">
          Stay in the Loop
        </Typography>
        <Box ref={containerRef} sx={{ position: "relative" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Subscribe for exclusive product updates and offers
          </Typography>
          <Stack component="form" onSubmit={handleFormSubmit} sx={{ gap: 2 }}>
            <FormGroup
              row
              sx={{ alignItems: "start", gap: 1, justifyContent: "center" }}
            >
              <TextField
                error={Boolean(validationErrors?.email)}
                helperText={validationErrors?.email[0]}
                label="Email"
                name="email"
                required
                size="small"
                type="email"
              />
              <Button disabled={isPending} type="submit" sx={{ minWidth: 64 }}>
                <Box
                  component="span"
                  sx={{ alignItems: "center", display: "flex", height: 1 }}
                >
                  {isPending ? <CircularProgress size={24} /> : "Submit"}
                </Box>
              </Button>
            </FormGroup>
          </Stack>
          <Fade in={!canSubmit}>
            <Paper
              elevation={1}
              sx={{
                alignItems: "center",
                backgroundColor: palette.background.paper,
                boxShadow: "none",
                display: "flex",
                height: 1,
                justifyContent: "center",
                position: "absolute",
                textAlign: "left",
                top: 0,
                width: 1,
                zIndex: zIndex.tooltip,
              }}
            >
              <Alert
                severity="success"
                onClose={() => setCanSubmit(true)}
                sx={{ width: 1 }}
              >
                <AlertTitle>Sign up success</AlertTitle>
                <Typography variant="body2">
                  Thank you for signing up!
                </Typography>
              </Alert>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Paper>
  );
}

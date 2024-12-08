import { useRef, useState } from "react";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import Box from "@mui/material/Box/Box";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Container from "@mui/material/Container/Container";
import Fade from "@mui/material/Fade/Fade";
import FormGroup from "@mui/material/FormGroup/FormGroup";
import FormHelperText from "@mui/material/FormHelperText/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import TextField from "@mui/material/TextField/TextField";
import Typography from "@mui/material/Typography/Typography";
import { useMutation } from "@tanstack/react-query";

import { logDebug } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import {
  ApiMarketingSignupRequest,
  ApiMarketingSignupResponse,
  ApiResponse,
  MarketingContact,
} from "@worm/types/src/api";
import { ValidationErrors } from "@worm/types/src/validation";

import { getReCaptchaToken } from "../../lib/form/recaptcha";

import MaterialIcon from "../icon/MaterialIcon";
import Link from "../link/Link";

import ReCaptcha from "./ReCaptcha";

const DEFAULT_FORM_DATA: MarketingContact = {
  email: "",
};

const useMarketingSignup = () =>
  useMutation<
    AxiosRequestConfig<ApiMarketingSignupRequest>,
    AxiosError<ApiResponse<ApiMarketingSignupResponse>>,
    ApiMarketingSignupRequest
  >({
    mutationFn: (newContact) =>
      axios.post(getApiEndpoint("POST:marketingSignup"), newContact),
  });

export default function NewsletterSignup() {
  const [canSubmit, setCanSubmit] = useState(true);
  const [formData, setFormData] = useState<MarketingContact>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>();

  const { isPending, mutate: invokeMarketingSignup } = useMarketingSignup();
  const containerRef = useRef<HTMLDivElement>();
  const { breakpoints, palette, zIndex } = useTheme();

  const handleFormDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;

    const newFormData = { ...formData };

    newFormData[name as keyof MarketingContact] = value;

    setFormData(newFormData);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setValidationErrors(undefined);

    if (!formData.email) {
      return setValidationErrors({
        email: ["Email is required"],
      });
    }

    setIsSubmitting(true);

    try {
      invokeMarketingSignup(
        {
          contact: formData,
          token: await getReCaptchaToken(),
        },
        {
          onError(error) {
            const details: ValidationErrors | undefined =
              error.response?.data.error?.details;

            setValidationErrors(details);
          },
          onSuccess() {
            setCanSubmit(false);
            setFormData(DEFAULT_FORM_DATA);
          },
        }
      );
    } catch (error) {
      logDebug("Error invoking marketing signup", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isPending || isSubmitting;
  const emailErrors = validationErrors?.["contact.email"];

  return (
    <Container disableGutters maxWidth="sm" sx={{ textAlign: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 0.5 }}>
        Stay in the loop
      </Typography>
      <Box ref={containerRef} sx={{ position: "relative" }}>
        <Typography variant="subtitle2" sx={{ mb: 3 }}>
          Subscribe for exclusive product updates and offers
        </Typography>
        <Stack component="form" onSubmit={handleFormSubmit} sx={{ gap: 2 }}>
          <TextField
            error={!!emailErrors}
            label="Email"
            name="email"
            required
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <ReCaptcha disabled={isPending} type="submit">
                      {isLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <MaterialIcon>send</MaterialIcon>
                      )}
                    </ReCaptcha>
                  </InputAdornment>
                ),
              },
            }}
            type="email"
            value={formData.email}
            onChange={handleFormDataChange}
            sx={{
              maxWidth: 1,
              mx: "auto",
              width: 380,
            }}
          />
          {!!emailErrors && (
            <FormHelperText error sx={{ textAlign: "center" }}>
              {emailErrors}
            </FormHelperText>
          )}
        </Stack>
        <Fade in={!canSubmit}>
          <Box
            sx={{
              alignItems: "center",
              backgroundColor: palette.background.paper,
              display: "flex",
              height: 1,
              justifyContent: "center",
              left: "50%",
              position: "absolute",
              textAlign: "left",
              top: 0,
              transform: "translateX(-50%)",
              zIndex: zIndex.tooltip,
              maxWidth: breakpoints.values.sm,
              width: "100%",
            }}
          >
            <Alert
              severity="success"
              onClose={() => setCanSubmit(true)}
              sx={{ flex: "1 1 auto" }}
            >
              <AlertTitle>Sign up success</AlertTitle>
              <Typography variant="body2">Thank you for signing up!</Typography>
            </Alert>
          </Box>
        </Fade>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: palette.text.secondary, fontSize: 12, mt: 2 }}
      >
        This site is protected by reCAPTCHA and the Google{" "}
        <Link
          to="https://policies.google.com/privacy"
          target="_blank"
          sx={{ color: palette.text.secondary }}
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          to="https://policies.google.com/terms"
          target="_blank"
          sx={{ color: palette.text.secondary }}
        >
          Terms of Service
        </Link>{" "}
        apply
      </Typography>
    </Container>
  );
}

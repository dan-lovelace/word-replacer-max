import { useRef, useState } from "react";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import Box from "@mui/material/Box/Box";
import Card from "@mui/material/Card/Card";
import CardActions from "@mui/material/CardActions/CardActions";
import CardContent from "@mui/material/CardContent/CardContent";
import CardHeader from "@mui/material/CardHeader/CardHeader";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Container from "@mui/material/Container/Container";
import Fade from "@mui/material/Fade/Fade";
import FormGroup from "@mui/material/FormGroup/FormGroup";
import FormHelperText from "@mui/material/FormHelperText/FormHelperText";
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
} from "@worm/types";
import { ValidationErrors } from "@worm/types/src/validation";

import { getReCaptchaToken } from "../../lib/form/recaptcha";

import Link from "../link/Link";

import ReCaptcha from "./ReCaptcha";

const DEFAULT_FORM_DATA: MarketingContact = {
  email: "",
};

const useMarketingSignup = () =>
  useMutation<
    AxiosRequestConfig<ApiMarketingSignupResponse>,
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
    <Container disableGutters maxWidth="md" sx={{ textAlign: "center" }}>
      <Card elevation={1} variant="outlined">
        <CardHeader title="Stay in the Loop" />
        <CardContent>
          <Box ref={containerRef} sx={{ position: "relative" }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Subscribe for exclusive product updates and offers
            </Typography>
            <Stack component="form" onSubmit={handleFormSubmit} sx={{ gap: 2 }}>
              <FormGroup
                row
                sx={{
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <TextField
                  error={!!emailErrors}
                  label="Email"
                  name="email"
                  required
                  size="small"
                  type="email"
                  value={formData.email}
                  onChange={handleFormDataChange}
                />
                <ReCaptcha
                  disabled={isPending}
                  type="submit"
                  sx={{ minWidth: 64 }}
                >
                  <Box
                    component="span"
                    sx={{ alignItems: "center", display: "flex", height: 1 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : "Submit"}
                  </Box>
                </ReCaptcha>
              </FormGroup>
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
                  <Typography variant="body2">
                    Thank you for signing up!
                  </Typography>
                </Alert>
              </Box>
            </Fade>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "center", my: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: palette.text.secondary, fontSize: 12 }}
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
        </CardActions>
      </Card>
    </Container>
  );
}

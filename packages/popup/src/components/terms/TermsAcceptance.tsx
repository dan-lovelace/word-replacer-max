import { useMemo } from "preact/hooks";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared/src/api";
import { sendConnectMessage } from "@worm/shared/src/browser";
import { getTermsNeedAcceptance } from "@worm/shared/src/permission";
import { TERMS_AND_CONDITIONS_URL } from "@worm/shared/src/support";
import { ApiResponse } from "@worm/types/src/api";
import {
  ApiAcceptTermsRequest,
  ApiAcceptTermsResponse,
} from "@worm/types/src/api/auth";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";

export default function TermsAcceptance() {
  const { currentUser, hasAccess } = useAuth();

  const {
    storage: {
      session: { authAccessToken },
    },
  } = useConfig();

  const language = useLanguage();
  const { showToast } = useToast();

  const { isPending, mutate: invokeAcceptTerms } = useMutation<
    AxiosRequestConfig<ApiAcceptTermsRequest>,
    AxiosError<ApiResponse<ApiAcceptTermsResponse>>,
    ApiAcceptTermsRequest
  >({
    mutationFn: () =>
      axios.post(getApiEndpoint("POST:authAcceptTerms"), undefined, {
        headers: {
          Authorization: `Bearer ${authAccessToken}`,
        },
      }),
  });

  const handleAcceptClick = () => {
    invokeAcceptTerms(undefined, {
      onError({ response }) {
        const message =
          response?.data.error?.details ??
          language.auth.TERMS_ACCEPTANCE_GENERAL_ERROR_MESSAGE;

        showToast({
          message,
          options: { severity: "danger", showContactSupport: true },
        });
      },
      onSuccess() {
        // Force-refresh tokens to pick up latest attributes
        sendConnectMessage("popup", "forceRefreshTokensRequest");
      },
    });
  };

  const needsAcceptance = useMemo(
    () => currentUser && getTermsNeedAcceptance(currentUser.termsAcceptance),
    [currentUser]
  );

  if (!hasAccess("api:InvokeAcceptTerms") || !needsAcceptance) {
    return <></>;
  }

  const { auth: lang } = language;

  return (
    <Alert className="rounded-0 fs-sm" severity="warning">
      <div className="d-flex align-items-center">
        <div className="flex-fill">
          {lang.TERMS_ACCEPTANCE_REQUIRED_MESSAGE}{" "}
          <a
            className="px-0 text-decoration-none"
            href={TERMS_AND_CONDITIONS_URL}
            target="_blank"
          >
            {lang.TERMS_ACCEPTANCE_REQUIRED_LINK_TEXT}
          </a>
        </div>
        <Button
          className="btn btn-primary btn-sm"
          disabled={isPending}
          onClick={handleAcceptClick}
        >
          {lang.TERMS_ACCEPTANCE_ACCEPT_BUTTON_TEXT}
        </Button>
      </div>
    </Alert>
  );
}

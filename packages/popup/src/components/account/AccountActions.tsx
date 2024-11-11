import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared/src/api";
import { sendConnectMessage } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import {
  ApiAuthDeleteAccountRequest,
  ApiAuthDeleteAccountResponse,
  ApiResponse,
} from "@worm/types/src/api";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import Slide from "../transition/Slide";

export default function AccountActions() {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [hasConfirmedDelete, setHasConfirmedDelete] = useState(false);

  const { currentUser, hasAccess } = useAuth();
  const {
    storage: {
      session: { authAccessToken },
      sync: { preferences },
    },
  } = useConfig();
  const { account: lang } = useLanguage();
  const { showToast } = useToast();

  const { isPending: isDeleteAccountPending, mutate: deleteAccount } =
    useMutation<
      AxiosRequestConfig<ApiAuthDeleteAccountRequest>,
      AxiosError<ApiResponse<ApiAuthDeleteAccountResponse>>,
      ApiAuthDeleteAccountRequest
    >({
      mutationFn: () =>
        axios.post(getApiEndpoint("POST:authDeleteAccount"), undefined, {
          headers: {
            Authorization: `Bearer ${authAccessToken}`,
          },
        }),
    });

  const handleConfirmDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleDeleteAccountClick = () => {
    deleteAccount(undefined, {
      onError({ response }) {
        const message =
          response?.data.error?.details ??
          lang.DELETE_ACCOUNT_API_RESPONSE_GENERAL_ERROR;

        showToast({
          message,
          options: { severity: "danger", showContactSupport: true },
        });
      },
      onSuccess() {
        sendConnectMessage("popup", "signOutRequest");

        const newPreferences = Object.assign({}, preferences);
        newPreferences.activeTab = "rules";

        storageSetByKeys({
          preferences: newPreferences,
        });
      },
      onSettled() {
        stopConfirming();
      },
    });
  };

  const handleHasConfirmedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasConfirmedDelete(event.currentTarget.checked);
  };

  const stopConfirming = () => {
    setIsConfirmingDelete(false);
    setHasConfirmedDelete(false);
  };

  if (!currentUser || !hasAccess("api:post:AuthDeleteAccount")) {
    return <></>;
  }

  return (
    <div data-testid="account-actions">
      {isConfirmingDelete ? (
        <Alert
          className="overflow-hidden"
          severity="danger"
          title={lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_CONFIRMATION_TITLE}
          data-testid="delete-account-confirmation-alert"
        >
          {lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_CONFIRMATION_BODY}
          <div className="d-flex flex-column gap-2 mt-3">
            <div>
              <Button
                className="btn btn-secondary"
                onClick={stopConfirming}
                data-testid="cancel-button"
              >
                {
                  lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_CONFIRMATION_CANCEL_BUTTON_TEXT
                }
              </Button>
            </div>
            <div className="form-check">
              <label
                className="user-select-none"
                for="delete-confirmation-checkbox"
              >
                {lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_CONFIRMATION_INPUT_LABEL}
              </label>
              <input
                checked={hasConfirmedDelete}
                className="form-check-input"
                id="delete-confirmation-checkbox"
                type="checkbox"
                onChange={handleHasConfirmedChange}
                data-testid="confirmation-checkbox"
              />
            </div>
            <Slide isOpen={hasConfirmedDelete}>
              <Button
                className="btn btn-danger text-decoration-none"
                disabled={isDeleteAccountPending}
                startIcon="delete"
                onClick={handleDeleteAccountClick}
                style={{
                  opacity: hasConfirmedDelete ? 1 : 0,
                  transition: "opacity 150ms",
                }}
                data-testid="submit-confirmation-button"
              >
                {
                  lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_CONFIRMATION_PROCEED_BUTTON_TEXT
                }
              </Button>
            </Slide>
          </div>
        </Alert>
      ) : (
        <div>
          <Button
            className="btn btn-outline-danger"
            startIcon="close"
            onClick={handleConfirmDeleteClick}
            data-testid="delete-account-button"
          >
            {lang.ACCOUNT_ACTIONS_DELETE_ACCOUNT_BUTTON_TEXT}
          </Button>
        </div>
      )}
    </div>
  );
}

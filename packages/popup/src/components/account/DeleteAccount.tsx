import { ChangeEvent } from "preact/compat";
import { StateUpdater, useState } from "preact/hooks";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { getApiEndpoint } from "@worm/shared/src/api";
import { getAccessToken, sendConnectMessage } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import {
  ApiAuthDeleteAccountRequest,
  ApiAuthDeleteAccountResponse,
  ApiResponse,
} from "@worm/types/src/api";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";
import { MESSAGE_SENDER } from "../../store/Message";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import Slide from "../transition/Slide";

type DeleteAccountProps = {
  setIsConfirmingDelete: StateUpdater<boolean>;
};

export default function DeleteAccount({
  setIsConfirmingDelete,
}: DeleteAccountProps) {
  const [hasConfirmedDelete, setHasConfirmedDelete] = useState(false);

  const { currentUser, hasAccess } = useAuth();
  const {
    storage: {
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
      mutationFn: async () =>
        axios.post(getApiEndpoint("POST:authDeleteAccount"), undefined, {
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
        }),
    });

  const handleConfirmClick = () => {
    deleteAccount(undefined, {
      onError({ response }) {
        const message =
          response?.data.error?.message ??
          lang.DELETE_ACCOUNT_API_RESPONSE_GENERAL_ERROR;

        showToast({
          message,
          options: { severity: "danger", showContactSupport: true },
        });
      },
      onSuccess() {
        sendConnectMessage(MESSAGE_SENDER, "signOutRequest");

        const newPreferences = Object.assign({}, preferences);
        newPreferences.activeTab = "rules";

        storageSetByKeys({
          preferences: newPreferences,
        });
      },
      onSettled() {
        stopConfirmingDelete();
      },
    });
  };

  const handleHasConfirmedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasConfirmedDelete(event.currentTarget.checked);
  };

  const stopConfirmingDelete = () => {
    setIsConfirmingDelete(false);
    setHasConfirmedDelete(false);
  };

  if (!currentUser || !hasAccess("api:post:AuthDeleteAccount")) {
    return <></>;
  }

  return (
    <div data-testid="delete-account-confirmation-container">
      <Alert
        className="overflow-hidden"
        severity="danger"
        title={lang.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_TITLE}
        data-testid="delete-account-confirmation-alert"
      >
        {lang.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_BODY}
        <div className="d-flex flex-column gap-2 mt-3">
          <div>
            <Button
              className="btn btn-secondary"
              onClick={stopConfirmingDelete}
              data-testid="delete-account-confirmation-cancel-button"
            >
              {lang.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_CANCEL_BUTTON_TEXT}
            </Button>
          </div>
          <div className="form-check">
            <label
              className="user-select-none"
              for="delete-confirmation-checkbox"
            >
              {lang.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_INPUT_LABEL}
            </label>
            <input
              checked={hasConfirmedDelete}
              className="form-check-input"
              id="delete-confirmation-checkbox"
              type="checkbox"
              onChange={handleHasConfirmedChange}
              data-testid="delete-account-confirmation-checkbox"
            />
          </div>
          <Slide isOpen={hasConfirmedDelete}>
            <Button
              className="btn btn-danger"
              disabled={isDeleteAccountPending}
              startIcon="dangerous"
              onClick={handleConfirmClick}
              style={{
                opacity: hasConfirmedDelete ? 1 : 0,
                transition: "opacity 150ms",
              }}
              data-testid="delete-account-confirmation-submit-button"
            >
              {lang.DANGER_ZONE_DELETE_ACCOUNT_CONFIRMATION_PROCEED_BUTTON_TEXT}
            </Button>
          </Slide>
        </div>
      </Alert>
    </div>
  );
}

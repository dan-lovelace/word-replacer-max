import { ChangeEvent } from "preact/compat";
import { StateUpdater, useState } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import Slide from "../transition/Slide";

type DeleteAllRulesProps = {
  setIsConfirmingDelete: StateUpdater<boolean>;
};

export default function DeleteAllRules({
  setIsConfirmingDelete,
}: DeleteAllRulesProps) {
  const [hasConfirmedRulesDelete, setHasConfirmedRulesDelete] = useState(false);

  const { currentUser, hasAccess } = useAuth();
  const { account: lang } = useLanguage();
  const { showToast } = useToast();

  const handleConfirmClick = () => {
    storageSetByKeys(
      { matchers: [] },
      {
        onError: (message) => {
          showToast({
            message,
            options: { severity: "danger" },
          });
        },
        onSuccess: () => {
          showToast({
            message: lang.DANGER_ZONE_DELETE_RULES_SUCCESS_MESSAGE,
            options: { severity: "success", showRefresh: true },
          });
        },
      }
    );

    setIsConfirmingDelete(false);
    setHasConfirmedRulesDelete(false);
  };

  const handleHasConfirmedRulesChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setHasConfirmedRulesDelete(event.currentTarget.checked);
  };

  const stopConfirmingDelete = () => {
    setIsConfirmingDelete(false);
    setHasConfirmedRulesDelete(false);
  };

  if (!currentUser || !hasAccess("api:post:AuthDeleteAccount")) {
    return <></>;
  }

  return (
    <div data-testid="delete-all-rules-confirmation-container">
      <Alert
        severity="danger"
        title={lang.DANGER_ZONE_DELETE_RULES_CONFIRMATION_TITLE}
        data-testid="delete-rules-confirmation-alert"
      >
        {lang.DANGER_ZONE_DELETE_RULES_CONFIRMATION_BODY}
        <div className="d-flex flex-column gap-2 mt-3">
          <div>
            <Button
              className="btn btn-secondary"
              onClick={stopConfirmingDelete}
              data-testid="delete-all-rules-confirmation-cancel-button"
            >
              {lang.DANGER_ZONE_DELETE_RULES_CONFIRMATION_CANCEL_BUTTON_TEXT}
            </Button>
          </div>
          <div className="form-check">
            <label
              className="user-select-none"
              for="delete-rules-confirmation-checkbox"
            >
              {lang.DANGER_ZONE_DELETE_RULES_CONFIRMATION_INPUT_LABEL}
            </label>
            <input
              checked={hasConfirmedRulesDelete}
              className="form-check-input"
              id="delete-rules-confirmation-checkbox"
              type="checkbox"
              onChange={handleHasConfirmedRulesChange}
              data-testid="delete-all-rules-confirmation-checkbox"
            />
          </div>
          <Slide isOpen={hasConfirmedRulesDelete}>
            <Button
              className="btn btn-danger"
              startIcon="delete"
              onClick={handleConfirmClick}
              style={{
                opacity: hasConfirmedRulesDelete ? 1 : 0,
                transition: "opacity 150ms",
              }}
              data-testid="delete-all-rules-confirmation-submit-button"
            >
              {lang.DANGER_ZONE_DELETE_RULES_BUTTON_TEXT}
            </Button>
          </Slide>
        </div>
      </Alert>
    </div>
  );
}

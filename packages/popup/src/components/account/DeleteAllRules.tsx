import { ChangeEvent } from "preact/compat";
import { Dispatch, StateUpdater, useState } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { useLanguage } from "../../lib/language";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import Slide from "../transition/Slide";

type DeleteAllRulesProps = {
  setIsConfirmingDelete: Dispatch<StateUpdater<boolean>>;
};

export default function DeleteAllRules({
  setIsConfirmingDelete,
}: DeleteAllRulesProps) {
  const [hasConfirmedDelete, setHasConfirmedDelete] = useState(false);

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
    setHasConfirmedDelete(false);
  };

  const handleHasConfirmedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasConfirmedDelete(event.currentTarget.checked);
  };

  const stopConfirmingDelete = () => {
    setIsConfirmingDelete(false);
    setHasConfirmedDelete(false);
  };

  return (
    <div data-testid="delete-all-rules-confirmation-container">
      <Alert
        severity="danger"
        title={lang.DANGER_ZONE_DELETE_RULES_CONFIRMATION_TITLE}
        data-testid="delete-all-rules-confirmation-alert"
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
              checked={hasConfirmedDelete}
              className="form-check-input"
              id="delete-rules-confirmation-checkbox"
              type="checkbox"
              onChange={handleHasConfirmedChange}
              data-testid="delete-all-rules-confirmation-checkbox"
            />
          </div>
          <Slide isOpen={hasConfirmedDelete}>
            <Button
              className="btn btn-danger"
              startIcon="delete"
              onClick={handleConfirmClick}
              style={{
                opacity: hasConfirmedDelete ? 1 : 0,
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

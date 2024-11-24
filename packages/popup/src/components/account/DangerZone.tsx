import { useState } from "preact/hooks";

import { useLanguage } from "../../lib/language";

import Button from "../button/Button";

import DeleteAccount from "./DeleteAccount";
import DeleteAllRules from "./DeleteAllRules";

export default function DangerZone() {
  const [isConfirmingAccountDelete, setIsConfirmingAccountDelete] =
    useState(false);
  const [isConfirmingRulesDelete, setIsConfirmingRulesDelete] = useState(false);

  const { account: lang } = useLanguage();

  const handleConfirmDeleteAccountClick = () => {
    setIsConfirmingAccountDelete(true);
  };

  const handleConfirmRulesDeleteClick = () => {
    setIsConfirmingRulesDelete(true);
  };

  return (
    <div data-testid="danger-zone">
      <div className="border border-danger rounded p-3">
        {isConfirmingAccountDelete ? (
          <DeleteAccount setIsConfirmingDelete={setIsConfirmingAccountDelete} />
        ) : isConfirmingRulesDelete ? (
          <DeleteAllRules setIsConfirmingDelete={setIsConfirmingRulesDelete} />
        ) : (
          <div className="d-flex gap-4">
            <div>
              <div className="fw-bold mb-1">
                {lang.DANGER_ZONE_DELETE_RULES_HEADING}
              </div>
              <p className="fs-sm mb-2">
                {lang.DANGER_ZONE_DELETE_RULES_SUBHEADING}
              </p>
              <Button
                className="btn btn-outline-danger"
                startIcon="delete"
                onClick={handleConfirmRulesDeleteClick}
                data-testid="delete-rules-button"
              >
                {lang.DANGER_ZONE_DELETE_RULES_BUTTON_TEXT}
              </Button>
            </div>
            <div className="border-start border-danger" />
            <div>
              <div className="fw-bold mb-1">
                {lang.DANGER_ZONE_DELETE_ACCOUNT_HEADING}
              </div>
              <p className="fs-sm mb-2">
                {lang.DANGER_ZONE_DELETE_ACCOUNT_SUBHEADING}
              </p>
              <Button
                className="btn btn-outline-danger"
                startIcon="dangerous"
                onClick={handleConfirmDeleteAccountClick}
                data-testid="delete-account-button"
              >
                {lang.DANGER_ZONE_DELETE_ACCOUNT_BUTTON_TEXT}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

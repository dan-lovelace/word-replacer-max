import { useState } from "preact/hooks";

import { useLanguage } from "../../lib/language";

import Button from "../button/Button";

import DeleteAllRules from "./DeleteAllRules";

export default function DangerZone() {
  const [isConfirmingRulesDelete, setIsConfirmingRulesDelete] = useState(false);

  const { options: lang } = useLanguage();

  const handleConfirmRulesDeleteClick = () => {
    setIsConfirmingRulesDelete(true);
  };

  return (
    <div data-testid="danger-zone">
      <div className="border border-danger rounded p-3">
        {isConfirmingRulesDelete ? (
          <DeleteAllRules setIsConfirmingDelete={setIsConfirmingRulesDelete} />
        ) : (
          <div className="d-flex gap-4">
            <div data-testid="delete-all-rules-container">
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
                data-testid="delete-all-rules-button"
              >
                {lang.DANGER_ZONE_DELETE_RULES_BUTTON_TEXT}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

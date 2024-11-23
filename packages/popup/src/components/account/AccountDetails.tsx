import { PopupAlertSeverity } from "@worm/types/src/popup";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

import MaterialIcon from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

type FeatureItemProps = {
  icon: string;
  label: string;
  severity: PopupAlertSeverity;
  tooltip?: string;
};

function FeatureItem({ icon, label, severity, tooltip }: FeatureItemProps) {
  return (
    <div className="d-flex align-items-center gap-1">
      <MaterialIcon className={`text-${severity}`} name={icon} />
      <span>{label}</span>
      {tooltip && (
        <div className="d-flex align-items-center gap-1 badge text-bg-secondary">
          <span>Coming Soon</span>
          <Tooltip title={tooltip}>
            <MaterialIcon className="text-light" name="info" size="sm" />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default function AccountDetails() {
  const { currentUser } = useAuth();

  const { account: lang } = useLanguage();

  if (!currentUser) {
    return <></>;
  }

  return (
    <div data-testid="account-details">
      <div className="d-flex flex-column gap-2">
        <div>
          <label className="fw-medium" for="user-email-input">
            {lang.ACCOUNT_DETAILS_EMAIL_LABEL}
          </label>
          <div className="position-relative ms-3" style={{ maxWidth: 320 }}>
            <input
              className="form-control"
              disabled
              id="user-email-input"
              value={currentUser.email}
            />
          </div>
        </div>
        <div>
          <div className="fw-medium">Features</div>
          <div className="d-flex flex-column gap-1 ms-3">
            <FeatureItem
              icon="check_circle"
              label="AI replacement suggestions"
              severity="success"
            />
            <FeatureItem
              icon="check_circle"
              label="Priority support"
              severity="success"
            />
            <FeatureItem
              icon="cancel"
              label="Cloud sync"
              severity="danger"
              tooltip="Optionally sync all extension data with your Word Replacer Max account"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

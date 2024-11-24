import { PopupAlertSeverity } from "@worm/types/src/popup";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

import MaterialIcon from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

type FeatureItemProps = {
  color: PopupAlertSeverity | "secondary";
  icon: string;
  label: string;
  tooltip?: string;
};

function FeatureItem({ icon, label, color, tooltip }: FeatureItemProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <MaterialIcon className={`text-${color}`} name={icon} size="lg" />
      <span>{label}</span>
      {tooltip && (
        <Tooltip title={tooltip}>
          <span className="badge border border-info bg-info-subtle text-info-emphasis text-uppercase">
            Coming Soon
          </span>
        </Tooltip>
      )}
    </div>
  );
}

export default function AccountDetails() {
  const { currentUser } = useAuth();
  const { account: lang } = useLanguage();

  return (
    <div data-testid="account-details">
      <div className="d-flex flex-column gap-2">
        <div>
          <label className="fw-medium" for="user-email-input">
            {lang.ACCOUNT_DETAILS_EMAIL_LABEL}
          </label>
          <div className="position-relative ms-2" style={{ maxWidth: 380 }}>
            <input
              className="form-control"
              disabled
              id="user-email-input"
              value={currentUser?.email}
            />
          </div>
        </div>
        <div>
          <div className="fw-medium">Features</div>
          <div className="d-flex flex-column gap-1 ms-2">
            <FeatureItem
              icon="check_circle"
              label="AI replacement suggestions"
              color="success"
            />
            <FeatureItem
              icon="check_circle"
              label="Priority support"
              color="success"
            />
            <FeatureItem
              icon="cancel"
              label="Cloud sync"
              color="secondary"
              tooltip="Optionally sync all extension data with your Word Replacer Max account"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

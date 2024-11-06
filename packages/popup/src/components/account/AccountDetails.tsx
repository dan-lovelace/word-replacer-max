import { cx } from "@worm/shared";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

import Alert from "../Alerts";
import Button from "../button/Button";

export default function AccountDetails() {
  const { currentUser } = useAuth();

  const { account: lang } = useLanguage();

  if (!currentUser) {
    return <></>;
  }

  const { emailVerified } = currentUser;

  return (
    <div data-testid="account-details">
      {!emailVerified && (
        <Alert
          className="mb-2 rounded-0"
          title={lang.EMAIL_NOT_VERIFIED_ALERT_TITLE}
        >
          {lang.EMAIL_NOT_VERIFIED_ALERT_BODY}
          <div className="mt-2">
            <Button className="btn btn-primary" startIcon="send">
              {lang.ACCOUNT_DETAILS_RESEND_EMAIL_VERIFICATION_BUTTON_TEXT}
            </Button>
          </div>
        </Alert>
      )}
      <div className="d-flex flex-column gap-2">
        <div>
          <label className="me-2 fw-medium" for="user-email-input">
            {lang.ACCOUNT_DETAILS_EMAIL_LABEL}
          </label>
          <div className="position-relative" style={{ maxWidth: 320 }}>
            <input
              className="form-control"
              disabled
              id="user-email-input"
              value={currentUser.email}
            />
            {emailVerified && (
              <span
                className={cx(
                  "position-absolute top-0 start-100 translate-middle badge rounded",
                  emailVerified ? "bg-success" : "bg-danger"
                )}
              >
                {lang.ACCOUNT_DETAILS_EMAIL_VERIFICATION_VERIFIED_TEXT}
                <span className="visually-hidden">email verification</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

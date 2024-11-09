import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

export default function AccountDetails() {
  const { currentUser } = useAuth();

  const { account: lang } = useLanguage();

  if (!currentUser) {
    return <></>;
  }

  const { emailVerified } = currentUser;

  return (
    <div data-testid="account-details">
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
          </div>
        </div>
      </div>
    </div>
  );
}

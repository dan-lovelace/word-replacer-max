import AccountDetails from "../components/account/AccountDetails";
import DangerZone from "../components/account/DangerZone";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { useLanguage } from "../lib/language";
import { useAuth } from "../store/Auth";

export default function Account() {
  const { currentUser } = useAuth();

  const { account: lang } = useLanguage();

  if (!currentUser) {
    return <></>;
  }

  return (
    <div
      className="container-fluid gx-0 d-flex flex-column gap-3"
      data-testid="account-container"
    >
      <div className="row">
        <div className={COPY_CONTAINER_COL_CLASS}>
          <div className="fw-bold fs-5">{lang.ACCOUNT_DETAILS_HEADING}</div>
          <AccountDetails />
        </div>
      </div>
      <div className="row">
        <div className={COPY_CONTAINER_COL_CLASS}>
          <div className="fw-bold fs-5 text-danger mb-1">
            {lang.DANGER_ZONE_HEADING}
          </div>
          <DangerZone />
        </div>
      </div>
    </div>
  );
}

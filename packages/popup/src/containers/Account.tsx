import AccountActions from "../components/account/AccountActions";
import AccountDetails from "../components/account/AccountDetails";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { useLanguage } from "../lib/language";

export default function Account() {
  const { account: lang } = useLanguage();

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
          <div className="fw-bold fs-5 mb-1">
            {lang.ACCOUNT_ACTIONS_HEADING}
          </div>
          <AccountActions />
        </div>
      </div>
    </div>
  );
}

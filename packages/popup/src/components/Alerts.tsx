import { PopupAlertSeverity } from "@worm/types";

import cx from "../lib/classnames";
import { PreactChildren } from "../lib/types";

type AlertProps = {
  children: PreactChildren;
  className?: string;
  severity?: PopupAlertSeverity;
  title?: string;
};

export default function Alert({
  children,
  className,
  severity = "info",
  title,
}: AlertProps) {
  return (
    <div className={cx("alert", `alert-${severity}`, className)} role="alert">
      {title && <h6 className="alert-heading fw-bold">{title}</h6>}
      <div className="d-flex align-items-center">{children}</div>
    </div>
  );
}

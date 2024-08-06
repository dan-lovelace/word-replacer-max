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
    <div
      className={cx("alert m-0", `alert-${severity}`, className)}
      role="alert"
    >
      {title && <div className="alert-heading fw-bold">{title}</div>}
      <div className="d-flex align-items-center">{children}</div>
    </div>
  );
}

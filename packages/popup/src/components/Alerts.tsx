import { ComponentProps } from "preact";

import { cx } from "@worm/shared";
import { PopupAlertSeverity } from "@worm/types";

import { PreactChildren } from "../lib/types";

type AlertProps = ComponentProps<"div"> & {
  children: PreactChildren;
  className?: string;
  severity?: PopupAlertSeverity;
  title?: string;
};

export default function Alert({
  children,
  severity = "info",
  title,
  ...rest
}: AlertProps) {
  return (
    <div
      {...rest}
      className={cx("alert m-0", `alert-${severity}`, rest.className)}
      role="alert"
    >
      {title && <div className="alert-heading fw-bold">{title}</div>}
      <div className="d-flex align-items-center">{children}</div>
    </div>
  );
}

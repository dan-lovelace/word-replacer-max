import { ComponentProps } from "preact";

import { cx } from "@worm/shared";
import { PopupAlertSeverity } from "@worm/types/src/popup";

import { PreactChildren } from "../lib/types";

type AlertProps = ComponentProps<"div"> & {
  children: PreactChildren;
  className?: string;
  severity?: PopupAlertSeverity;
  title?: string;
};

export const ALERT_SIZES = {
  sm: 600,
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
      <div>{children}</div>
    </div>
  );
}

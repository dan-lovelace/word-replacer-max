import { JSXInternal } from "preact/src/jsx";

import cx from "../../lib/classnames";

type ButtonProps = JSXInternal.HTMLAttributes<HTMLButtonElement> & {
  startIcon?: string;
};

export default function Button({
  children,
  className,
  startIcon,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(className ?? "btn btn-secondary")}
      type="button"
      {...rest}
    >
      <span className="d-flex align-items-center gap-1">
        {startIcon && (
          <span className="material-icons-sharp fs-sm">{startIcon}</span>
        )}
        {children}
      </span>
    </button>
  );
}

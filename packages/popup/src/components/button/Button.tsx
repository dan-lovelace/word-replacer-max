import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";

import { cx } from "@worm/shared";

import Tooltip from "../Tooltip";

export type ButtonProps = ComponentProps<"button"> & {
  disabledTooltip?: string;
  startIcon?: string;
};

export default function Button({
  children,
  className,
  disabledTooltip,
  startIcon,
  ...rest
}: ButtonProps) {
  const button = useMemo(
    () => (
      <button
        className={cx(className ?? "btn btn-secondary")}
        type="button"
        {...rest}
      >
        <span className="d-flex align-items-center gap-2">
          {startIcon && (
            <span className="material-icons-sharp fs-5">{startIcon}</span>
          )}
          {children}
        </span>
      </button>
    ),
    [children, className, startIcon, rest]
  );

  return useMemo(() => {
    if (disabledTooltip && rest.disabled) {
      return <Tooltip title={disabledTooltip}>{button}</Tooltip>;
    }

    return button;
  }, [button, disabledTooltip, rest.disabled]);
}

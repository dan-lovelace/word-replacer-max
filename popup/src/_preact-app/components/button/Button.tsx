import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";

import { cx } from "@web-extension/shared";

import MaterialIcon, { MaterialIconProps } from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

export type ButtonProps = ComponentProps<"button"> & {
  disabledTooltip?: string;
  startIcon?: string;
  startIconSize?: MaterialIconProps["size"];
};

export default function Button({
  children,
  className,
  disabledTooltip,
  startIcon,
  startIconSize = "md",
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
          {startIcon && <MaterialIcon name={startIcon} size={startIconSize} />}
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

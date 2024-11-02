import { useMemo } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

import MaterialIcon, { MaterialIconProps } from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

export type IconButtonProps = Omit<
  JSXInternal.HTMLAttributes<HTMLButtonElement>,
  "icon"
> & {
  disabledTooltip?: string;
  icon: MaterialIconProps["name"];
  iconProps?: Omit<MaterialIconProps, "default" | "name">;
};

export default function IconButton({
  className,
  icon,
  iconProps,
  disabledTooltip,
  ...rest
}: IconButtonProps) {
  const button = useMemo(
    () => (
      <button
        className={cx("btn btn-light bg-transparent border-0", className)}
        type="button"
        {...rest}
      >
        <MaterialIcon
          className={cx(
            "d-flex align-items-center justify-content-center",
            iconProps?.className
          )}
          name={icon}
          size={iconProps?.size ?? "lg"}
          {...iconProps}
        />
      </button>
    ),
    [className, icon, rest]
  );

  return useMemo(() => {
    if (disabledTooltip && rest.disabled) {
      return <Tooltip title={disabledTooltip}>{button}</Tooltip>;
    }

    return button;
  }, [button, disabledTooltip, rest.disabled]);
}

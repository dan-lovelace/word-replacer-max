import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";

import { cx } from "@worm/shared";

import MaterialIcon, { MaterialIconProps } from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

export type IconButtonProps = Omit<ComponentProps<"button">, "icon"> & {
  "data-testid"?: string;
  disabledTooltip?: string;
  icon: MaterialIconProps["name"];
  iconProps?: Omit<MaterialIconProps, "default" | "name">;
};

export const ICON_BUTTON_BASE_CLASS = "border-0 btn btn-light bg-transparent";

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
        className={cx(className ?? ICON_BUTTON_BASE_CLASS)}
        type="button"
        {...rest}
      >
        <MaterialIcon
          {...iconProps}
          className={cx(
            "d-flex align-items-center justify-content-center",
            iconProps?.className
          )}
          name={icon}
          size={iconProps?.size ?? "lg"}
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

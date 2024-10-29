import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

import { PreactChildren } from "../../lib/types";

import Tooltip from "../Tooltip";

export type IconButtonProps = Omit<
  JSXInternal.HTMLAttributes<HTMLButtonElement>,
  "icon"
> & {
  disabledTooltip?: string;
  icon: PreactChildren;
  iconProps?: ComponentProps<"span">;
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
        <span
          className={cx(
            "d-flex align-items-center justify-content-center material-icons-sharp",
            iconProps?.className
          )}
        >
          {icon}
        </span>
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

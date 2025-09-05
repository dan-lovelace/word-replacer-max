import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";

import { cx } from "@web-extension/shared";

import { PreactChildren } from "../../lib/types";

export type MaterialIconProps = Omit<
  ComponentProps<"span">,
  "name" | "size"
> & {
  name: PreactChildren;
  size?: "sm" | "md" | "lg";
};

export default function MaterialIcon({
  className,
  name,
  size = "md",
  ...rest
}: MaterialIconProps) {
  const sizeClassName = useMemo(() => {
    /**
     * NOTE: Bootstrap utility classes are intentionally not used for certain
     * sizes because they scale slightly depending on viewable width. The
     * exception being `fs-6` which does not have any scaling properties.
     */
    switch (size) {
      case "lg":
        return "fs-lg";
      case "md":
        return "fs-md";
      case "sm":
        return "fs-6";
      default:
        throw new Error("Invalid size provided");
    }
  }, [size]);

  return (
    <span
      {...rest}
      className={cx("material-icons-sharp", sizeClassName, className)}
    >
      {name}
    </span>
  );
}

import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";

import { cx } from "@worm/shared";

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
    switch (size) {
      case "lg":
        return "fs-4";
      case "md":
        return "fs-5";
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

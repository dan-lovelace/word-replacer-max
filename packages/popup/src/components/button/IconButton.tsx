import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

import { PreactChildren } from "../../lib/types";

type IconButtonProps = Omit<
  JSXInternal.HTMLAttributes<HTMLButtonElement>,
  "icon"
> & {
  icon: PreactChildren;
};

export default function IconButton({
  className,
  icon,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={cx(
        "material-icons-sharp",
        "btn btn-light bg-transparent border-0",
        "px-2",
        className
      )}
      type="button"
      {...rest}
    >
      {icon}
    </button>
  );
}

import { JSXInternal } from "preact/src/jsx";

import cx from "../lib/classnames";

type IconButtonProps = JSXInternal.HTMLAttributes<HTMLButtonElement> & {
  icon: string;
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
        "mx-1",
        className
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}

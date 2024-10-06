import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

type DropdownMenuProps = JSXInternal.HTMLAttributes<HTMLUListElement>;

export default function DropdownMenu({
  className,
  ...rest
}: DropdownMenuProps) {
  return (
    <ul
      className={cx("dropdown-menu shadow overflow-hidden", className)}
      style={{ minWidth: 260 }}
      {...rest}
    />
  );
}

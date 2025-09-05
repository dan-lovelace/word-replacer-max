import { JSXInternal } from "preact/src/jsx";

import { cx } from "@web-extension/shared";

type MenuItemContainerProps = JSXInternal.HTMLAttributes<HTMLDivElement> & {
  disableGutters?: boolean;
};

export default function MenuItemContainer({
  children,
  className,
  disableGutters = false,
  ...props
}: MenuItemContainerProps) {
  return (
    <div
      className={cx(
        "menu-item-container",
        "d-flex align-items-center text-nowrap",
        !disableGutters && "px-3 py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

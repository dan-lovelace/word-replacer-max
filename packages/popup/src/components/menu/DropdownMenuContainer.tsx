import { ComponentProps } from "preact";

import { cx } from "@worm/shared";

type MenuContainerProps = ComponentProps<"div">;

export default function DropdownMenuContainer(props: MenuContainerProps) {
  return <div {...props} className={cx("py-1", props.className)} />;
}

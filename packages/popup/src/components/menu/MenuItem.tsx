import "./Dropdown.scss";

import { ComponentProps } from "preact";
import { useMemo } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

import { useDropdown } from "./hooks/use-dropdown";
import MenuItemContainer from "./MenuItemContainer";

type MenuItemProps = ComponentProps<"button"> & {
  className?: string;
  dense?: boolean;
  linkProps?: ComponentProps<"a">;
  startIcon?: string;
};

export default function MenuItem({
  dense = false,
  linkProps,
  startIcon,
  onClick,
  ...props
}: MenuItemProps) {
  const { closeDropdown } = useDropdown();

  const handleClick = (
    event: JSXInternal.TargetedMouseEvent<HTMLButtonElement>
  ) => {
    onClick?.(event);
    closeDropdown();
  };

  const MemoizedComponent = useMemo(
    () => () => {
      const buttonElement = (
        <button
          {...props}
          className={cx(
            "wrm-menu-item",
            "flex-fill",
            "btn btn-link rounded-0 px-3",
            "text-body text-decoration-none text-start",
            dense ? "py-1" : "py-2",
            props.className
          )}
          onClick={handleClick}
        >
          <span className="d-flex align-items-center gap-3">
            {startIcon !== undefined && (
              <span className="material-icons-sharp fs-5">{startIcon}</span>
            )}
            {props.children}
          </span>
        </button>
      );

      return linkProps !== undefined ? (
        <a
          {...linkProps}
          className={cx(
            "d-flex flex-fill align-items-center",
            "text-decoration-none",
            props.disabled && "pe-none",
            linkProps.className
          )}
          disabled={props.disabled}
        >
          {buttonElement}
        </a>
      ) : (
        buttonElement
      );
    },
    [linkProps, props]
  );

  return (
    <MenuItemContainer disableGutters>
      <MemoizedComponent />
    </MenuItemContainer>
  );
}

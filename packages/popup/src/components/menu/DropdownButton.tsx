import { FC, useMemo, useState } from "preact/compat";

import {
  flip,
  offset,
  Placement,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

import { cx } from "@worm/shared";

import { PreactChildren } from "../../lib/types";

import Button from "../button/Button";

import { DropdownContext } from "./hooks/use-dropdown";

type DropdownButtonProps<T> = {
  className?: string;
  Component?: FC<T>;
  componentProps?: T;
  menuContent: PreactChildren;
  minWidth?: string | number;
  noFlip?: boolean;
  offset?: number;
  placement?: Placement;
};

export default function DropdownButton<T>({
  className,
  Component = Button,
  componentProps,
  menuContent,
  minWidth = 300,
  noFlip = false,
  offset: offsetDistance = 5,
  placement = "bottom-end",
}: DropdownButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const { context, refs, strategy, x, y } = useFloating({
    open: isOpen,
    middleware: [
      offset(offsetDistance),
      shift({ padding: 4 }),
      ...(noFlip ? [] : [flip()]),
    ],
    placement,
    onOpenChange: setIsOpen,
  });

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const MemoizedComponent = useMemo(() => Component, [Component]);

  return (
    <div className={cx("wrm-dropdown-button", className)}>
      <div
        className="d-flex h-100"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <MemoizedComponent
          {...(componentProps as T)}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        />
      </div>

      {isOpen && (
        <div
          className="bg-white rounded shadow overflow-hidden z-3"
          ref={refs.setFloating}
          style={{
            left: x ?? 0,
            minWidth,
            outline: "1px solid var(--bs-border-color)",
            position: strategy,
            top: y ?? 0,
          }}
          {...getFloatingProps()}
        >
          <DropdownContext.Provider value={{ closeDropdown }}>
            <div className="wrm-dropdown-button__menu-content">
              {menuContent}
            </div>
          </DropdownContext.Provider>
        </div>
      )}
    </div>
  );
}

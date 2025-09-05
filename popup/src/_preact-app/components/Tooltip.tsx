import { ComponentProps } from "preact";
import { useEffect, useRef } from "preact/hooks";

import { Tooltip as BSTooltip } from "bootstrap";

import { cx } from "@web-extension/shared";

type TooltipProps = ComponentProps<"span"> & {
  title: string;
};

export default function Tooltip({
  children,
  className,
  title,
  ...rest
}: TooltipProps) {
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!tooltipRef.current) return;

    const bsTooltip = new BSTooltip(tooltipRef.current);

    return () => {
      bsTooltip.dispose();
    };
  }, [tooltipRef]);

  return (
    <span
      className={cx(
        "d-inline-flex align-items-center user-select-none",
        className
      )}
      data-bs-toggle="tooltip"
      data-bs-title={title}
      ref={tooltipRef}
      {...rest}
    >
      {children}
    </span>
  );
}

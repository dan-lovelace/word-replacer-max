import { useEffect, useRef } from "preact/hooks";

import { Tooltip as BSTooltip } from "bootstrap";

import { PreactChildren } from "../lib/types";

type TooltipProps = {
  children: PreactChildren;
  title: string;
};

export default function Tooltip({ children, title }: TooltipProps) {
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
      className="d-inline-flex align-items-center user-select-none"
      data-bs-toggle="tooltip"
      data-bs-title={title}
      ref={tooltipRef}
    >
      {children}
    </span>
  );
}

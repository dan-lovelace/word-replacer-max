import { useState, useRef, useEffect } from "preact/hooks";

import { PreactChildren } from "../../lib/types";

interface SlideProps {
  children: PreactChildren;
  isOpen?: boolean;
}

const TRANSITION_DURATION_MS = 150;

export default function Slide({ isOpen, children }: SlideProps) {
  const [height, setHeight] = useState(isOpen ? "auto" : "0px");
  const [overflow, setOverflow] = useState("hidden");

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      setHeight("auto");
      setOverflow("visible");
    }, TRANSITION_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  const updateHeight = () => {
    if (!contentRef.current) return;

    setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
    setOverflow("hidden");
  };

  return (
    <div
      className="transition-slide"
      ref={contentRef}
      style={{
        maxHeight: height,
        opacity: isOpen ? 1 : 0,
        overflow,
        transition: `max-height ${TRANSITION_DURATION_MS}ms, opacity ${TRANSITION_DURATION_MS}ms`,
      }}
    >
      {children}
    </div>
  );
}

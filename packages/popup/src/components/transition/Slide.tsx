import { useState, useRef, useEffect } from "preact/hooks";

import { PreactChildren } from "../../lib/types";

interface SlideProps {
  children: PreactChildren;
  isOpen?: boolean;
}

export default function Slide({ isOpen, children }: SlideProps) {
  const [height, setHeight] = useState(isOpen ? "auto" : "0px");

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isOpen]);

  const updateHeight = () => {
    if (!contentRef.current) return;

    setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
  };

  return (
    <div
      className="transition-slide"
      ref={contentRef}
      style={{
        maxHeight: height,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.2s, opacity 0.2s",
      }}
    >
      {children}
    </div>
  );
}

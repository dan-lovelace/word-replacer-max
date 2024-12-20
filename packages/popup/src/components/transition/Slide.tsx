import { useEffect, useRef, useState } from "preact/hooks";

import { PreactChildren } from "../../lib/types";

interface SlideProps {
  children: PreactChildren;
  disableEnter?: boolean;
  isOpen?: boolean;
}

const TRANSITION_DURATION_MS = 90;
const TRANSITION_EASING = "ease-out";

export default function Slide({
  children,
  disableEnter = false,
  isOpen,
}: SlideProps) {
  const [height, setHeight] = useState(isOpen ? "auto" : "0px");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsTransitioning(true);

      return;
    }

    if (disableEnter) {
      // when disabling enter, set an explicit height first
      if (contentRef.current) {
        setHeight(`${contentRef.current.scrollHeight}px`);
      }

      setIsTransitioning(false);

      // now set to auto after a frame to ensure smooth transition
      requestAnimationFrame(() => {
        setHeight("auto");
      });

      return;
    }

    setIsTransitioning(true);

    const timeoutId = setTimeout(() => {
      setHeight("auto");
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [isOpen, disableEnter]);

  const updateHeight = () => {
    if (!contentRef.current) return;

    if (isOpen && disableEnter) {
      setHeight(`${contentRef.current.scrollHeight}px`);

      requestAnimationFrame(() => {
        setHeight("auto");
      });

      return;
    }

    setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
  };

  const getTransitionStyle = () => {
    if (!isTransitioning) return "none";

    return `max-height ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING}, opacity ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING}`;
  };

  return (
    <div
      className="transition-slide"
      ref={contentRef}
      style={{
        maxHeight: height,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: getTransitionStyle(),
      }}
    >
      {children}
    </div>
  );
}

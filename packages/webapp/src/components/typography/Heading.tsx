import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

type HeadingProps = JSXInternal.HTMLAttributes<HTMLButtonElement> & {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

const commonClass = "font-bold";

const variantMap: Record<HeadingProps["variant"], string> = {
  h1: cx("text-3xl", commonClass),
  h2: cx("text-2xl", commonClass),
  h3: cx("text-xl", commonClass),
  h4: cx("text-lg", commonClass),
  h5: cx("text-md", commonClass),
  h6: cx("text-sm", commonClass),
};

export default function Heading({ children, variant }: HeadingProps) {
  return <div className={variantMap[variant]}>{children}</div>;
}

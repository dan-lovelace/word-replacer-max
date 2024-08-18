import { JSXInternal } from "preact/src/jsx";

export type ButtonProps = JSXInternal.HTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
};

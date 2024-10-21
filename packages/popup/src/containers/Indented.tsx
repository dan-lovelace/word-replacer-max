import { JSXInternal } from "preact/src/jsx";

export function Indented({
  children,
  className,
  ...rest
}: JSXInternal.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ marginLeft: "2.5rem" }} {...rest}>
      {children}
    </div>
  );
}

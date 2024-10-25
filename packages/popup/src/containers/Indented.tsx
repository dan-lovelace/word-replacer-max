import { JSXInternal } from "preact/src/jsx";

type Props = Omit<JSXInternal.HTMLAttributes<HTMLDivElement>, "style"> & {
  style?: { [key: string]: string | number };
};

export function Indented({ children, className, style = {}, ...rest }: Props) {
  return (
    <div
      className={className}
      style={{ marginLeft: "2.5rem", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

import { VNode } from "preact";

type LayoutProps = {
  children: VNode;
};

export default function Layout({ children }: LayoutProps) {
  return <div className="layout">{children}</div>;
}

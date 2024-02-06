import { VNode } from "preact";

import Header from "./Header";

type LayoutProps = {
  children: VNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div class="container-fluid">
      <Header />
      {children}
    </div>
  );
}

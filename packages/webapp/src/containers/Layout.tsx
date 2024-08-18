import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";

import { ROUTES } from "../lib/routes";
import LoginButton from "../components/button/LoginButton";
import SignupButton from "../components/button/SignupButton";

type LayoutProps = JSXInternal.HTMLAttributes<HTMLDivElement>;

const navigation = [
  {
    id: "home",
    label: "Home",
    to: ROUTES.HOME,
  },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-full flex flex-col" id="layout">
      <header className="px-4 py-3 flex items-center gap-4">
        <a href={ROUTES.HOME}>
          <div className="h-10 p-1">
            <img
              alt="Word Replacer Max logo"
              className="h-full"
              src="/logo_128.png"
            />
          </div>
        </a>
        <div className="flex-1">
          {navigation.map((item) => (
            <span key={item.id}>
              <a className={cx("text-gray-700")} href={item.to}>
                {item.label}
              </a>
            </span>
          ))}
        </div>
        <div>
          <LoginButton />
          <SignupButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-4 py-3 text-center">
        Copyright &copy; 2024 Logic Now LLC, All Rights Reserved
      </footer>
    </div>
  );
}

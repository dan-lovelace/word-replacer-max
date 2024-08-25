import { browser } from "@worm/shared/src/browser";

import { PreactChildren } from "../lib/types";

export default function TabRefreshButton({
  children,
  onClick,
}: {
  children: PreactChildren;
  onClick: () => void;
}) {
  const handleClick = async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    browser.tabs.reload(tabs[0].id);

    onClick();
  };

  return (
    <button
      className="btn btn-link btn-sm p-0 text-nowrap"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

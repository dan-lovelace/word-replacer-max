import TabRefreshButton from "./TabRefreshButton";

import { useLanguage } from "../lib/language";
import { useConfig } from "../store/Config";

export function RefreshRequiredToast({ onClose }: { onClose: () => void }) {
  const { isPoppedOut } = useConfig();
  const language = useLanguage();

  return (
    <span className="d-flex align-items-center gap-1">
      {language.rules.REFRESH_REQUIRED}
      {!isPoppedOut && (
        /**
         * It's not possible to be sure which tab to refresh because the
         * extension's one is activated when this button is clicked. Let's just
         * hide it.
         */
        <TabRefreshButton onClick={onClose}>Refresh now</TabRefreshButton>
      )}
    </span>
  );
}

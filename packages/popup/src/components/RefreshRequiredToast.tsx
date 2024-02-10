import TabRefreshButton from "./TabRefreshButton";
import { useLanguage } from "../lib/language";

export function RefreshRequiredToast({ onClose }: { onClose: () => void }) {
  const language = useLanguage();

  return (
    <span className="d-flex align-items-center gap-2">
      {language.rules["REFRESH_REQUIRED"]}
      <TabRefreshButton onClick={onClose}>Refresh now</TabRefreshButton>
    </span>
  );
}

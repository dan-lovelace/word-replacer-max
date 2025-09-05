import { storageSetByKeys } from "@web-extension/shared/src/storage";

import { useConfig } from "../store/Config";

export default function HelpRedirect({ text = "contact support" }) {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  const handleClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = "support";

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <button className="btn btn-link btn-sm p-0 ms-1" onClick={handleClick}>
      {text}
    </button>
  );
}

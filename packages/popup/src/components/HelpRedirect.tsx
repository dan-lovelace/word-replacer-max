import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";

import { Config } from "../store/Config";

export default function HelpRedirect({ text = "contact support" }) {
  const {
    storage: { preferences },
  } = useContext(Config);

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

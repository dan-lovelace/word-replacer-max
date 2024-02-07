import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";
import { PopupTab } from "@worm/types";

import Debug from "../components/Debug";
import RuleRow from "../components/RuleRow";
import cx from "../lib/classnames";
import { Config } from "../store/Config";

const tabs: { identifier: PopupTab; label: string }[] = [
  {
    identifier: "rules",
    label: "Rules",
  },
  {
    identifier: "domains",
    label: "Domains",
  },
];

export default function Home() {
  const {
    storage: { matchers, preferences },
  } = useContext(Config);

  const handleClick = () => {
    storageSetByKeys({
      matchers: [
        ...(matchers ?? []),
        {
          active: true,
          identifier: new Date().getTime().toString(),
          queries: ["lorem"],
          queryPatterns: ["case"],
          replacement: "ipsum",
        },
      ],
    });
  };

  const handleTabChange = (newTab: PopupTab) => () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = newTab;

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <div>
      <ul className="nav nav-tabs">
        {tabs.map(({ identifier, label }) => (
          <li key={identifier} className="nav-item">
            <button
              className={cx(
                "nav-link",
                preferences?.activeTab === identifier && "active"
              )}
              onClick={handleTabChange(identifier)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
      <div className="container-fluid">
        {Boolean(matchers?.length) && (
          <div className="d-flex flex-column gap-2 py-2">
            {matchers?.map((matcher) => (
              <RuleRow
                key={matcher.identifier}
                matcher={matcher}
                matchers={matchers}
              />
            ))}
          </div>
        )}
      </div>
      <button className="btn btn-secondary" onClick={handleClick}>
        <span className="d-flex align-items-center">
          <i className="material-icons-sharp me-1">add</i> New
        </span>
      </button>
      <Debug />
    </div>
  );
}

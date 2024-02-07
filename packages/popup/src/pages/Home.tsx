import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";
import { PopupTab } from "@worm/types";

import Debug from "../components/Debug";
import DomainInput from "../components/DomainInput";
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

  const handleNewRuleClick = () => {
    storageSetByKeys({
      matchers: [
        {
          active: true,
          identifier: new Date().getTime().toString(),
          queries: [],
          queryPatterns: [],
          replacement: "",
        },
        ...(matchers ?? []),
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
      <div className="container-fluid py-2">
        {preferences?.activeTab === "domains" && <DomainInput />}
        {preferences?.activeTab === "rules" && (
          <div className="d-flex flex-column gap-2">
            <div className="ps-5">
              <button
                className="btn btn-secondary"
                onClick={handleNewRuleClick}
              >
                <span className="d-flex align-items-center">
                  <i className="material-icons-sharp me-1">add</i> New
                </span>
              </button>
            </div>
            {Boolean(matchers?.length) &&
              matchers?.map((matcher) => (
                <RuleRow
                  key={matcher.identifier}
                  matcher={matcher}
                  matchers={matchers}
                />
              ))}
          </div>
        )}
      </div>
      <Debug />
    </div>
  );
}

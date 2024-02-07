import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";
import { Matcher, PopupTab } from "@worm/types";

import Debug from "../components/Debug";
import ReplacementInput from "../components/ReplacementInput";
import QueryInput from "../components/QueryInput";
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

  const handleActiveChange = (identifier: string) => () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx].active = !newMatchers[matcherIdx].active;

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

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

  const handleMatcherInputChange = <K extends keyof Matcher>(
    identifier: string,
    key: K,
    newValue: Matcher[K]
  ) => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx][key] = newValue;

    storageSetByKeys({
      matchers: newMatchers,
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
            {matchers?.map(
              ({ active, identifier, queries, queryPatterns, replacement }) => (
                <div key={identifier} className="row d-flex">
                  <div className="col-auto form-check form-switch ps-3 pt-2">
                    <input
                      checked={active}
                      className="form-check-input m-0"
                      id={`active-check-${identifier}`}
                      role="switch"
                      type="checkbox"
                      onChange={handleActiveChange(identifier)}
                    />
                    <label
                      className="form-check-label visually-hidden"
                      for={`active-check-${identifier}`}
                    >
                      Active
                    </label>
                  </div>
                  <div className="col">
                    <QueryInput
                      identifier={identifier}
                      queries={queries}
                      queryPatterns={queryPatterns}
                      onChange={handleMatcherInputChange}
                    />
                  </div>
                  <div className="col-auto pt-2 px-0">
                    <i className="material-icons-sharp">swap_horiz</i>
                  </div>
                  <div className="col-auto">
                    <ReplacementInput
                      identifier={identifier}
                      replacement={replacement}
                      onChange={handleMatcherInputChange}
                    />
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <button className="btn">
                      <i className="material-icons-sharp">close</i>
                    </button>
                  </div>
                </div>
              )
            )}
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

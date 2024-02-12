import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";

import DomainInput from "../components/DomainInput";
import RuleRow from "../components/RuleRow";
import Support from "../components/Support";
import { Config } from "../store/Config";

export default function HomePage() {
  const {
    storage: { matchers, preferences },
  } = useContext(Config);

  const handleNewRuleClick = () => {
    storageSetByKeys({
      matchers: [
        ...(matchers ?? []),
        {
          active: true,
          identifier: new Date().getTime().toString(),
          queries: [],
          queryPatterns: [],
          replacement: "",
        },
      ],
    });
  };

  return (
    <div className="container-fluid py-2 flex-fill overflow-y-auto">
      {preferences?.activeTab === "domains" && <DomainInput />}
      {preferences?.activeTab === "rules" && (
        <div className="d-flex flex-column gap-2">
          {Boolean(matchers?.length) &&
            matchers?.map((matcher) => (
              <RuleRow
                key={matcher.identifier}
                matcher={matcher}
                matchers={matchers}
              />
            ))}
          <div className="ps-5">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleNewRuleClick}
            >
              <span className="d-flex align-items-center">
                <i className="material-icons-sharp me-1 fs-6">add</i> New rule
              </span>
            </button>
          </div>
        </div>
      )}
      {preferences?.activeTab === "support" && <Support />}
    </div>
  );
}

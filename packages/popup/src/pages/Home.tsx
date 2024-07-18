import { useContext } from "preact/hooks";

import { v4 as uuidv4 } from "uuid";

import { storageSetByKeys } from "@worm/shared";

import DomainInput from "../components/DomainInput";
import Options from "../components/Options";
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
          identifier: uuidv4(),
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
      {preferences?.activeTab === "options" && <Options />}
      {preferences?.activeTab === "rules" && (
        <>
          <div className="row gx-2 gy-2">
            {Boolean(matchers?.length) &&
              matchers?.map((matcher) => (
                <div
                  key={matcher.identifier}
                  className="rule-row-wrapper col-12 col-xxl-6 position-relative"
                >
                  <RuleRow matcher={matcher} matchers={matchers} />
                </div>
              ))}
          </div>
          <div className="ps-5 pt-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleNewRuleClick}
            >
              <span className="d-flex align-items-center">
                <i className="material-icons-sharp me-1 fs-6">add</i> New rule
              </span>
            </button>
          </div>
        </>
      )}
      {preferences?.activeTab === "support" && <Support />}
    </div>
  );
}

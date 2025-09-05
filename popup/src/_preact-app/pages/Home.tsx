import { cx } from "@web-extension/shared";

import DomainInput from "../components/domain-input/DomainInput";
import RuleList from "../components/rules/RuleList";
import Account from "../containers/Account";
import Options from "../containers/Options";
import Sharing from "../containers/Sharing";
import Support from "../containers/Support";
import { useConfig } from "../store/Config";

export default function HomePage() {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  const isRulesList = preferences?.activeTab === "rules";

  return (
    <div
      className={cx(
        "container-fluid flex-fill overflow-y-auto",
        !isRulesList && "pb-2"
      )}
      data-testid="home-page"
    >
      {preferences?.activeTab === "account" && <Account />}
      {preferences?.activeTab === "domains" && <DomainInput />}
      {preferences?.activeTab === "options" && <Options />}
      {preferences?.activeTab === "sharing" && <Sharing />}
      {isRulesList && <RuleList />}
      {preferences?.activeTab === "support" && <Support />}
    </div>
  );
}

import DomainInput from "../components/domain-input/DomainInput";
import RuleList from "../components/rules/RuleList";
import Support from "../components/Support";
import Account from "../containers/Account";
import Options from "../containers/Options";
import { useConfig } from "../store/Config";

export default function HomePage() {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  return (
    <div
      className="container-fluid py-2 flex-fill overflow-y-auto"
      data-testid="home-page"
    >
      {preferences?.activeTab === "account" && <Account />}
      {preferences?.activeTab === "domains" && <DomainInput />}
      {preferences?.activeTab === "options" && <Options />}
      {preferences?.activeTab === "rules" && <RuleList />}
      {preferences?.activeTab === "support" && <Support />}
    </div>
  );
}

import DomainInput from "../components/domain-input/DomainInput";
import Account from "../containers/Account";
import Options from "../containers/Options";
import Rules from "../containers/Rules";
import Sharing from "../containers/Sharing";
import Support from "../containers/Support";
import { useConfig } from "../store/Config";

export default function HomePage() {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();

  return (
    <div
      className="d-flex flex-column pb-2 flex-fill overflow-y-auto"
      data-testid="home-page"
    >
      {preferences?.activeTab === "account" && <Account />}
      {preferences?.activeTab === "domains" && <DomainInput />}
      {preferences?.activeTab === "options" && <Options />}
      {preferences?.activeTab === "sharing" && <Sharing />}
      {preferences?.activeTab === "rules" && <Rules />}
      {preferences?.activeTab === "support" && <Support />}
    </div>
  );
}

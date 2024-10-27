import { useConfig } from "../../store/Config";

import Alert from "../Alerts";
import RuleRow from "../rules/RuleRow";

import AddNewRule from "./AddNewRule";

export default function RuleList() {
  const {
    storage: {
      sync: { matchers },
    },
  } = useConfig();

  if (!Boolean(matchers?.length)) {
    return (
      <div className="row">
        <div className="col-12 col-lg-8 col-xxl-6">
          <Alert title="No rules">
            Your rules list is empty.{" "}
            <AddNewRule className="btn btn-link alert-link p-0 mx-1">
              Click here
            </AddNewRule>{" "}
            to create your first replacement.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row gx-3 gy-2">
        {matchers?.map((matcher) => (
          <div
            key={matcher.identifier}
            className="rule-row-wrapper col-12 col-xxl-6 position-relative"
          >
            <div className="container-fluid gx-1">
              <RuleRow matcher={matcher} matchers={matchers} />
            </div>
          </div>
        ))}
      </div>
      <div className="ps-5 pt-2">
        <AddNewRule />
      </div>
    </>
  );
}

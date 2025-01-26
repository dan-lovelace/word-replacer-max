import { useMemo } from "preact/hooks";

import { getActiveMatchers } from "@worm/shared/src/browser/matchers";
import { StorageMatcher } from "@worm/types/src/rules";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import Alert, { ALERT_SIZES } from "../Alerts";
import RuleGroupsModal from "../rule-groups/RuleGroupsModal";
import RuleGroupsToolbar from "../rule-groups/RuleGroupsToolbar";
import RuleRow from "../rules/RuleRow";

import AddNewRule from "./AddNewRule";

export default function RuleList() {
  const { hasAccess } = useAuth();
  const {
    storage: {
      local: { authIdToken },
      sync,
      sync: { matchers },
    },
  } = useConfig();
  const { rules: lang } = useLanguage();

  // Zero-state banner rendered when no rules exist
  if (!Boolean(matchers?.length)) {
    return (
      <div className="row">
        <div className="col-12 col-lg-8 col-xxl-6">
          <Alert
            title={lang.EMPTY_RULES_LIST_ALERT_TITLE}
            style={{ maxWidth: ALERT_SIZES.sm }}
            data-testid="empty-rules-list-alert"
          >
            {lang.EMPTY_RULES_LIST_ALERT_BODY}
            <div className="mt-3">
              <AddNewRule className="btn btn-primary btn-sm" text="Add rule" />
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const canGroupRules = useMemo(
    () => hasAccess("feat:ruleGroups"),
    [authIdToken]
  );

  const renderedMatchers: StorageMatcher[] | undefined = useMemo(
    () => getActiveMatchers(sync),
    [sync]
  );

  return (
    <>
      {canGroupRules && <RuleGroupsToolbar />}
      <div className="row gx-3 gy-2" data-testid="rule-list-wrapper">
        {renderedMatchers?.map((matcher) => (
          <div
            key={matcher.identifier}
            className="rule-row-wrapper col-12 col-xxl-6 position-relative"
          >
            <div className="container-fluid gx-1">
              <RuleRow matcher={matcher} matchers={renderedMatchers} />
            </div>
          </div>
        ))}
      </div>
      <div
        className="pt-2"
        style={{ paddingLeft: 43 }}
        data-testid="rule-list-actions"
      >
        <AddNewRule />
      </div>
      <RuleGroupsModal />
    </>
  );
}

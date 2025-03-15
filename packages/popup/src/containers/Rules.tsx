import { cx } from "@worm/shared";

import Alert, { ALERT_SIZES } from "../components/Alerts";
import RuleGroupsModal from "../components/rule-groups/RuleGroupsModal";
import RuleGroupsToolbar from "../components/rule-groups/RuleGroupsToolbar";
import AddNewRule from "../components/rules/AddNewRule";
import RuleList from "../components/rules/RuleList";
import { useLanguage } from "../lib/language";
import { useConfig } from "../store/Config";

export default function Rules() {
  const {
    matchers,
    storage: {
      sync: { ruleGroups },
    },
  } = useConfig();
  const { rules: lang } = useLanguage();

  const canGroupRules = Boolean(ruleGroups?.active);

  return (
    <>
      {canGroupRules && <RuleGroupsToolbar />}
      <div
        className={cx(
          "d-flex flex-column h-100",
          canGroupRules ? "pt-1" : "pt-0"
        )}
      >
        {matchers?.length ? (
          <div className="flex-fill">
            <RuleList />
          </div>
        ) : (
          <div className="row">
            <div className="col-12 col-lg-8 col-xxl-6">
              <Alert
                title={lang.EMPTY_RULES_LIST_ALERT_TITLE}
                style={{ maxWidth: ALERT_SIZES.sm }}
                data-testid="empty-rules-list-alert"
              >
                {lang.EMPTY_RULES_LIST_ALERT_BODY}
              </Alert>
            </div>
          </div>
        )}
        <div className="pt-2" data-testid="rule-list-actions">
          <AddNewRule />
        </div>
        <RuleGroupsModal />
      </div>
    </>
  );
}

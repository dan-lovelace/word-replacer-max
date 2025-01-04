import { useMemo, useRef } from "preact/hooks";

import { getMatcherGroups } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { generateMatcherGroup } from "../../lib/rule-groups";
import { useConfig } from "../../store/Config";

import Button from "../button/Button";

import RuleGroupRow from "./RuleGroupRow";

export default function RuleGroupsModal() {
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);

  const {
    storage: { sync },
  } = useConfig();

  const handleNewClick = () => {
    let newGroupNumber = 1;

    while (
      Object.values(ruleGroups ?? {}).some(
        (group) => group.name === `Group ${newGroupNumber}`
      )
    ) {
      newGroupNumber++;
    }

    storageSetByKeys(
      generateMatcherGroup({
        name: `Group ${newGroupNumber}`,
      })
    );
  };

  const ruleGroups = useMemo(() => getMatcherGroups(sync), [sync]);

  return (
    <div
      className="modal fade z-modal"
      id="rule-groups-modal"
      aria-hidden="true"
      aria-labelledby="rule-groups-modal-label"
      data-testid="rule-groups-modal"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="rule-groups-modal-label">
              Manage groups
            </h1>
            <button
              className="btn-close"
              ref={hideModalButtonRef}
              type="button"
              aria-label="Close"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="modal-body">
            <div
              className="d-flex flex-column gap-1"
              data-testid="rule-groups-list"
            >
              {ruleGroups &&
                Object.keys(ruleGroups).map((key) => (
                  <RuleGroupRow key={key} data={ruleGroups[key]} />
                ))}
            </div>
            <div className="mt-2" data-testid="rule-groups-actions">
              <Button startIcon="add" onClick={handleNewClick}>
                New group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

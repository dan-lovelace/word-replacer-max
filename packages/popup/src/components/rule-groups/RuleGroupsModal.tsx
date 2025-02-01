import { useMemo, useRef } from "preact/hooks";

import { getMatcherGroups, sortMatcherGroups } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { generateMatcherGroup } from "../../lib/rule-groups";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Button from "../button/Button";

import RuleGroupRow from "./RuleGroupRow";

export default function RuleGroupsModal() {
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);

  const {
    storage: { sync },
  } = useConfig();
  const { showToast } = useToast();

  const handleNewClick = () => {
    let newGroupNumber = 1;

    while (
      Object.values(sortedGroups ?? {}).some(
        (group) => group.name === `Group ${newGroupNumber}`
      )
    ) {
      newGroupNumber++;
    }

    storageSetByKeys(
      generateMatcherGroup({
        name: `Group ${newGroupNumber}`,
        sortIndex:
          Math.max(
            ...Object.values(sortedGroups ?? {}).map(
              (group) => group.sortIndex ?? 0
            )
          ) + 1,
      }),
      {
        onError: (message) => {
          showToast({
            message,
            options: { severity: "danger" },
          });
        },
      }
    );
  };

  const sortedGroups = useMemo(
    () => sortMatcherGroups(Object.values(getMatcherGroups(sync) ?? {})),
    [sync]
  );

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
              {sortedGroups.map((group) => (
                <RuleGroupRow key={group.identifier} data={group} />
              ))}
            </div>
            <div className="mt-2" data-testid="rule-groups-actions">
              <Button
                startIcon="add"
                onClick={handleNewClick}
                data-testid="add-group-button"
              >
                New group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

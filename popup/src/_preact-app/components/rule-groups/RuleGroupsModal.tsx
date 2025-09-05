import { useMemo, useRef } from "preact/hooks";

import { cx } from "@web-extension/shared";
import {
  getMatcherGroups,
  sortMatcherGroups,
} from "@web-extension/shared/src/browser";
import { storageSetByKeys } from "@web-extension/shared/src/storage";

import { generateMatcherGroup } from "../../lib/rule-groups";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";

import RuleGroupRow from "./RuleGroupRow";

const AddGroupButton = ({
  className,
  handleNewClick,
}: {
  className?: string;
  handleNewClick: () => void;
}) => (
  <Button
    className={cx("btn btn-sm", className ?? "btn-primary")}
    startIcon="add"
    onClick={handleNewClick}
    data-testid="add-group-button"
  >
    Add group
  </Button>
);

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

  const groupsExist = sortedGroups.length > 0;

  return (
    <div
      className="modal fade"
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
              {groupsExist ? (
                sortedGroups.map((group) => (
                  <RuleGroupRow key={group.identifier} data={group} />
                ))
              ) : (
                <Alert severity="info" title="Create your first group">
                  Add groups to quickly switch between sets of replacements.
                  <div className="mt-3">
                    <AddGroupButton handleNewClick={handleNewClick} />
                  </div>
                </Alert>
              )}
            </div>
            <div className="mt-2" data-testid="rule-groups-actions">
              {groupsExist && (
                <AddGroupButton
                  className="btn-secondary"
                  handleNewClick={handleNewClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

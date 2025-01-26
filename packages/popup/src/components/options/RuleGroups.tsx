import { ComponentProps } from "preact";
import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { Indented } from "../../containers/Indented";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

type ReplacementGroupsProps = ComponentProps<"div"> & {};

const INPUT_ID = "rule-groups-enabled-checkbox";

export default function RuleGroups({}: ReplacementGroupsProps) {
  const { hasAccess } = useAuth();
  const {
    storage: {
      sync: { ruleGroups },
    },
  } = useConfig();

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newGroups = Object.assign({}, ruleGroups);

    newGroups.active = event.currentTarget.checked;

    storageSetByKeys({
      ruleGroups: newGroups,
    });
  };

  const isActive = Boolean(ruleGroups?.active);

  if (!hasAccess("feat:ruleGroups")) {
    return <></>;
  }

  return (
    <div data-testid="rule-groups">
      <div
        className="form-check form-switch ps-0 d-flex align-items-center gap-2"
        data-testid="rule-groups-input-wrapper"
      >
        <input
          checked={isActive}
          className="form-check-input m-0"
          id={INPUT_ID}
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
          data-testid="rule-groups-toggle-button"
        />
        <label
          className="form-check-label user-select-none fw-medium"
          for={INPUT_ID}
        >
          Rule groups
        </label>
      </div>
      <Indented data-testid="rule-groups-description">
        <div className="fs-sm">
          Group your rules into categories and easily switch between them.
        </div>
      </Indented>
    </div>
  );
}

import { useMemo } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";
import {
  getMatcherGroups,
  sortMatcherGroups,
  STORAGE_MATCHER_GROUP_PREFIX,
} from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";

import RuleGroupColor from "./RuleGroupColor";

export default function RuleGroupsToolbar() {
  const {
    storage: {
      sync,
      sync: { ruleGroups },
    },
  } = useConfig();
  const { showRefreshToast } = useToast();

  const handleChange =
    (identifier: string) =>
    (event: JSXInternal.TargetedMouseEvent<HTMLInputElement>) => {
      const storageKey = `${STORAGE_MATCHER_GROUP_PREFIX}${identifier}`;
      const existingGroups = getMatcherGroups(sync) ?? {};

      if (event.ctrlKey || event.metaKey) {
        const newActive = !Boolean(existingGroups[storageKey]?.active ?? false);

        storageSetByKeys(
          {
            [storageKey]: {
              ...existingGroups[storageKey],
              active: newActive,
            },
          },
          {
            onSuccess() {
              showRefreshToast(!newActive);
            },
          }
        );
      } else {
        const newGroups = Object.keys(existingGroups).reduce(
          (acc, key) => ({
            ...acc,
            [key]: {
              ...existingGroups[key],
              active:
                key === storageKey
                  ? !Boolean(existingGroups[key].active)
                  : false,
            },
          }),
          {} as typeof existingGroups
        );

        storageSetByKeys(newGroups, {
          onSuccess() {
            showRefreshToast();
          },
        });
      }
    };

  if (!ruleGroups?.active) {
    return <></>;
  }

  const sortedGroups = useMemo(
    () => sortMatcherGroups(Object.values(getMatcherGroups(sync) ?? {})),
    [sync]
  );

  return (
    <div
      className="bg-white d-flex align-items-center gap-2 position-sticky mx-n1 py-2 top-0 z-3"
      data-testid="rule-groups-toolbar"
    >
      <IconButton
        className={cx(ICON_BUTTON_BASE_CLASS, "align-self-start")}
        icon="workspaces"
        iconProps={{
          className: "text-secondary",
          size: "sm",
        }}
        title="Rule groups"
        style={{
          height: 23,
          marginLeft: 2,
          marginRight: 1,
          padding: "0px 10px",
        }}
        data-bs-toggle="modal"
        data-bs-target="#rule-groups-modal"
        data-testid="rule-groups-button"
      />
      <div className="flex-fill">
        <div className="d-flex flex-wrap gap-1" role="group">
          {sortedGroups.map(({ active = false, color, identifier, name }) => {
            const inputId = `rule-group__${identifier}`;

            if (!name.length) return false;

            return (
              <Fragment key={identifier}>
                <input
                  checked={active}
                  className="btn-check"
                  id={inputId}
                  type="checkbox"
                  onClick={handleChange(identifier)}
                />
                <label
                  className={cx(
                    "btn btn-light btn-sm py-0 d-flex align-items-center gap-2 text-nowrap"
                  )}
                  for={inputId}
                  data-testid="rule-group-toggle"
                >
                  <RuleGroupColor color={color} />
                  <span>{name}</span>
                </label>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

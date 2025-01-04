import { useEffect, useMemo, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

import { cx } from "@worm/shared";
import { getMatcherGroups } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { useConfig } from "../../store/Config";

import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";

export default function RuleGroupsToolbar() {
  const [isOptionHeld, setIsOptionHeld] = useState(false);

  const {
    storage: {
      sync,
      sync: { ruleGroups },
    },
  } = useConfig();

  useEffect(() => {
    const optionKeys = ["Control", "Meta"];

    const keyDownListener = ({ key }: KeyboardEvent) => {
      if (!optionKeys.includes(key)) return;

      setIsOptionHeld(true);
    };

    const keyUpListener = ({ key }: KeyboardEvent) => {
      if (!optionKeys.includes(key)) return;

      setIsOptionHeld(false);
    };

    document.documentElement.addEventListener("keydown", keyDownListener);
    document.documentElement.addEventListener("keyup", keyUpListener);

    return () => {
      document.documentElement.removeEventListener("keydown", keyDownListener);
      document.documentElement.removeEventListener("keyup", keyUpListener);
    };
  }, []);

  const handleChange = (identifier: string) => () => {
    const existingGroups = getMatcherGroups(sync) ?? {};

    if (isOptionHeld) {
      storageSetByKeys({
        [identifier]: {
          ...existingGroups[identifier],
          active: !Boolean(existingGroups[identifier]?.active ?? false),
        },
      });
    } else {
      const newGroups = Object.keys(existingGroups).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...existingGroups[key],
            active:
              key === identifier ? !Boolean(existingGroups[key].active) : false,
          },
        }),
        {} as typeof existingGroups
      );

      storageSetByKeys(newGroups);
    }
  };

  const handleIsFilteredClick = () => {
    const newRuleGroups = Object.assign({}, ruleGroups);

    newRuleGroups.isFiltered = !Boolean(ruleGroups?.isFiltered);

    storageSetByKeys({
      ruleGroups: newRuleGroups,
    });
  };

  if (!ruleGroups?.active) {
    return <></>;
  }

  const { ruleGroupsArray, selectedCount } = useMemo(() => {
    const matcherGroups = getMatcherGroups(sync);
    const matcherGroupValues = Object.values(matcherGroups ?? {});
    const matcherGroupSelections = matcherGroupValues.filter(
      (group) => group.active
    ).length;

    return {
      ruleGroupsArray: matcherGroupValues,
      selectedCount: matcherGroupSelections,
    };
  }, [sync]);

  return (
    <div
      className="bg-white d-flex align-items-center gap-2 position-sticky mb-3 mt-n2 mx-n1 top-0 z-2"
      data-testid="rule-groups"
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
          height: 32,
          marginLeft: 1,
          marginRight: 2,
          padding: "var(--bs-btn-padding-y) 10px",
        }}
        data-bs-toggle="modal"
        data-bs-target="#rule-groups-modal"
        data-testid="rule-groups-button"
      />
      <div className="flex-fill">
        <div className="d-flex flex-wrap gap-1" role="group">
          {ruleGroupsArray.map(
            ({ active = false, color, identifier, name }) => {
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
                      "btn btn-light btn-sm d-flex align-items-center gap-2 text-nowrap"
                    )}
                    for={inputId}
                  >
                    <span
                      style={{
                        backgroundColor: color,
                        borderRadius: "100%",
                        height: 10,
                        outline: "1px solid var(--bs-border-color)",
                        width: 10,
                      }}
                    />
                    {name}
                  </label>
                </Fragment>
              );
            }
          )}
        </div>
      </div>
      <div
        className="align-self-start"
        style={{
          marginRight: 1,
          opacity: selectedCount > 0 ? 1 : 0,
          transition: "opacity 150ms ease-in-out",
        }}
      >
        <IconButton
          icon={ruleGroups?.isFiltered ? "filter_alt" : "filter_alt_off"}
          iconProps={{
            className: "text-secondary",
            size: "sm",
          }}
          style={{ height: 32 }}
          title={
            ruleGroups?.isFiltered
              ? `Filtering by selected group${selectedCount === 1 ? "" : "s"}`
              : "Showing all rules"
          }
          onClick={handleIsFilteredClick}
        />
      </div>
    </div>
  );
}

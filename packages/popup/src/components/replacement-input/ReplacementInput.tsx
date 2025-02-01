import { Ref } from "preact";
import { useMemo, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx, isReplacementEmpty } from "@worm/shared";
import {
  getMatcherGroups,
  STORAGE_MATCHER_GROUP_PREFIX,
} from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";

import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import IconButton, {
  ICON_BUTTON_BASE_CLASS,
  IconButtonProps,
} from "../button/IconButton";
import DropdownButton from "../menu/DropdownButton";
import DropdownMenuContainer from "../menu/DropdownMenuContainer";
import MenuItem from "../menu/MenuItem";
import MenuItemContainer from "../menu/MenuItemContainer";
import RuleGroupColor from "../rule-groups/RuleGroupColor";
import Tooltip from "../Tooltip";

import ReplacementSuggest from "./ReplacementSuggest";

type ReplacementInputProps = Pick<
  Matcher,
  | "active"
  | "identifier"
  | "queries"
  | "replacement"
  | "useGlobalReplacementStyle"
> & {
  disabled: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["replacement"]
  ) => void;
};

export const INPUT_BUTTON_WIDTH = 32;

const INPUT_WIDTH_BASE = 250;

export default function ReplacementInput({
  active,
  disabled,
  identifier,
  inputRef,
  queries,
  replacement,
  useGlobalReplacementStyle,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);

  const { hasAccess } = useAuth();
  const {
    storage: {
      local: { authIdToken },
      sync,
      sync: { matchers, replacementStyle, replacementSuggest, ruleGroups },
    },
  } = useConfig();
  const { showRefreshToast, showToast } = useToast();

  const handleAddToGroupClick = (groupIdentifier: string) => () => {
    const storageKey = `${STORAGE_MATCHER_GROUP_PREFIX}${groupIdentifier}`;
    const group = getMatcherGroups(sync)?.[storageKey];

    if (!group) {
      return showToast({
        message: "Unable to find group",
        options: { severity: "danger" },
      });
    }

    group.matchers = [...(group.matchers ?? []), identifier];

    storageSetByKeys({
      [storageKey]: group,
    });
  };

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    updateReplacement();
  };

  const handleRemoveFromGroupClick = (groupIdentifier: string) => () => {
    const storageKey = `${STORAGE_MATCHER_GROUP_PREFIX}${groupIdentifier}`;
    const group = getMatcherGroups(sync)?.[storageKey];

    if (!group) {
      return showToast({
        message: "Unable to find group",
        options: { severity: "danger" },
      });
    }

    group.matchers = group.matchers?.filter(
      (matcherIdentifier) => identifier !== matcherIdentifier
    );

    storageSetByKeys(
      {
        [storageKey]: group,
      },
      {
        onSuccess() {
          showRefreshToast(active && group.active);
        },
      }
    );
  };

  const handleReplacementStyleChange = () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (!newMatchers[matcherIdx]) return;

    newMatchers[matcherIdx].useGlobalReplacementStyle = !Boolean(
      newMatchers[matcherIdx].useGlobalReplacementStyle
    );

    showRefreshToast(
      active && Boolean(queries.length) && !isReplacementEmpty(replacement)
    );

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  const updateReplacement = (override?: string) => {
    const updatedValue = override ?? value;

    if (updatedValue === replacement) return;

    showRefreshToast(active && Boolean(queries.length));

    onChange(identifier, "replacement", updatedValue);
  };

  const { availableGroups, includedGroups } = useMemo(() => {
    const values = Object.values(getMatcherGroups(sync) ?? {});

    const _availableGroups = values.filter(
      (group) => !group.matchers?.includes(identifier)
    );
    const _includedGroups = values.filter((group) =>
      group.matchers?.includes(identifier)
    );

    return {
      availableGroups: _availableGroups,
      includedGroups: _includedGroups,
    };
  }, [sync]);

  const canGroupRules = useMemo(
    () => ruleGroups?.active && hasAccess("feat:ruleGroups"),
    [authIdToken, ruleGroups?.active]
  );

  const canSuggest = useMemo(
    () => replacementSuggest?.active && hasAccess("api:post:Suggest"),
    [authIdToken, replacementSuggest?.active]
  );

  const inputWidth =
    INPUT_WIDTH_BASE -
    ((canSuggest ? INPUT_BUTTON_WIDTH - 1 : 0) +
      (replacementStyle?.active ? INPUT_BUTTON_WIDTH - 1 : 0) +
      (ruleGroups?.active ? INPUT_BUTTON_WIDTH - 1 : 0));

  return (
    <>
      <form
        className="flex-fill border rounded"
        onSubmit={handleFormSubmit}
        data-testid="replacement-input-form"
      >
        <div className="input-group" role="group">
          <input
            className={cx(
              "form-control border-0",
              (canSuggest || replacementStyle?.active || ruleGroups?.active) &&
                "rounded-end-0"
            )}
            disabled={disabled}
            enterkeyhint="enter"
            ref={inputRef}
            type="text"
            value={value}
            onBlur={handleFormSubmit}
            onInput={handleTextChange}
            style={{
              width: inputWidth,

              /**
               * FIX: When certain child classes do not exist within Bootstrap's
               * `input-group`, the input's border radii are removed so we re-set
               * them here.
               */
              borderBottomRightRadius: "var(--bs-border-radius)",
              borderTopRightRadius: "var(--bs-border-radius)",
            }}
            data-testid="replacement-text-input"
          />
          <div className={cx(!canSuggest && "d-none")}>
            <ReplacementSuggest
              active={active}
              disabled={disabled}
              identifier={identifier}
              queries={queries}
              replacement={replacement}
              value={value}
              onReplacementChange={onChange}
              setValue={setValue}
            />
          </div>
          {replacementStyle?.active && (
            <div class="d-flex">
              <IconButton
                className={cx(ICON_BUTTON_BASE_CLASS, "px-2")}
                disabled={disabled}
                icon={
                  useGlobalReplacementStyle
                    ? "format_color_text"
                    : "format_color_reset"
                }
                iconProps={{
                  className: "text-secondary",
                  size: "sm",
                }}
                title={`Replacement style ${
                  useGlobalReplacementStyle ? "enabled" : "disabled"
                }`}
                style={{ width: INPUT_BUTTON_WIDTH }}
                onClick={handleReplacementStyleChange}
                data-testid="replacement-style-button"
              />
            </div>
          )}
          {canGroupRules && (
            <DropdownButton<IconButtonProps>
              offset={0}
              componentProps={{
                className: cx(ICON_BUTTON_BASE_CLASS, "px-2"),
                icon: "more_vert",
                iconProps: {
                  className: "text-secondary",
                },
                style: {
                  width: INPUT_BUTTON_WIDTH,
                },
                "aria-label": "Rule groups dropdown toggle",
                "data-testid": "rule-groups-dropdown-toggle",
              }}
              Component={IconButton}
              menuContent={
                ruleGroups?.active && (
                  <>
                    <MenuItemContainer className="border-bottom">
                      Add to group
                    </MenuItemContainer>
                    <DropdownMenuContainer>
                      {availableGroups.length ? (
                        availableGroups.map(
                          (group) =>
                            !group.matchers?.includes(identifier) && (
                              <MenuItem
                                key={group.identifier}
                                onClick={handleAddToGroupClick(
                                  group.identifier
                                )}
                              >
                                <RuleGroupColor color={group.color} />
                                {group.name}
                              </MenuItem>
                            )
                        )
                      ) : (
                        <div className="px-1">
                          <Alert severity="info">
                            {!includedGroups.length
                              ? "No groups exist"
                              : "No more groups available"}
                          </Alert>
                        </div>
                      )}
                    </DropdownMenuContainer>
                  </>
                )
              }
            />
          )}
        </div>
        <Button className="visually-hidden" disabled={disabled} type="submit">
          Save
        </Button>
      </form>
      {canGroupRules && (
        <div className="d-flex gap-1 py-2" data-testid="included-groups-list">
          {includedGroups.map((group) => (
            <Tooltip
              key={group.identifier}
              title={group.name}
              data-testid="rule-group-tooltip"
            >
              <Button
                className="btn btn-light bg-transparent p-0"
                disabled={disabled}
                title="Click to remove from group"
                onClick={handleRemoveFromGroupClick(group.identifier)}
                data-testid="remove-from-group-button"
              >
                <RuleGroupColor color={group.color} />
              </Button>
            </Tooltip>
          ))}
        </div>
      )}
    </>
  );
}

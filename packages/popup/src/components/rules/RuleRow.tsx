import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { cx } from "@worm/shared";
import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser";
import {
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";
import MaterialIcon from "../icon/MaterialIcon";
import QueryInput from "../query-input/QueryInput";
import ReplacementInput from "../replacement-input/ReplacementInput";

type RuleRowProps = {
  matcher: Matcher;
  matchers: Matcher[];
  disabled?: boolean;
};

export default function RuleRow({
  matcher: {
    active,
    identifier,
    queries,
    queryPatterns,
    replacement,
    useGlobalReplacementStyle,
  },
  matchers,
  disabled = false,
}: RuleRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const confirmingDeleteRef = useRef<boolean>();
  const queriesInputRef = useRef<HTMLInputElement>(null);
  const replacementInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  confirmingDeleteRef.current = isConfirmingDelete;

  useEffect(() => {
    if (!preferences?.focusRule) return;

    const { focusRule } = preferences;

    if (
      focusRule.matcher !== identifier ||
      !queriesInputRef.current ||
      !replacementInputRef.current
    ) {
      return;
    }

    // scroll to and focus the new row's replacement input field
    switch (focusRule.field) {
      case "queries": {
        queriesInputRef.current.scrollIntoView();
        queriesInputRef.current.focus();
        break;
      }

      case "replacement": {
        replacementInputRef.current.scrollIntoView();
        replacementInputRef.current.focus();
        break;
      }
    }

    // unset focused rule in storage
    const newPreferences = Object.assign({}, preferences);
    newPreferences.focusRule.matcher = "";
    storageSetByKeys({
      preferences: newPreferences,
    });
  }, [preferences]);

  const clickawayListener = useCallback((event: MouseEvent) => {
    if (
      confirmingDeleteRef.current === true &&
      (event.target as HTMLElement)?.getAttribute("data-dismiss") !== "delete"
    ) {
      setIsConfirmingDelete(false);
    }
  }, []);

  useEffect(() => {
    if (isConfirmingDelete) {
      document.documentElement.addEventListener("click", clickawayListener);
    } else {
      document.documentElement.removeEventListener("click", clickawayListener);
    }
  }, [isConfirmingDelete]);

  const handleActiveChange = (identifier: string) => () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (!newMatchers[matcherIdx]) {
      return;
    }

    newMatchers[matcherIdx].active = !newMatchers[matcherIdx].active;

    if (!newMatchers[matcherIdx].active) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleMatcherInputChange = <K extends keyof Matcher>(
    identifier: string,
    key: K,
    newValue: Matcher[K]
  ) => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (!newMatchers[matcherIdx]) {
      return;
    }

    newMatchers[matcherIdx][key] = newValue;

    storageSetByKeys(
      {
        matchers: newMatchers,
      },
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

  const handleDeleteClick = () => {
    const queriesExist = Boolean(queries.length);

    if (!queriesExist || isConfirmingDelete) {
      document.documentElement.removeEventListener("click", clickawayListener);

      if (active && queriesExist) {
        showToast({
          message: language.rules.REFRESH_REQUIRED,
          options: { showRefresh: true },
        });
      }

      storageSetByKeys({
        matchers: matchers.filter(
          (matcher) => matcher.identifier !== identifier
        ),
      });
      storageRemoveByKeys([`${STORAGE_MATCHER_PREFIX}${identifier}`]);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div
      className={cx("row", disabled && "pe-none flex-fill")}
      data-testid="rule-row"
      style={{
        marginLeft: "-14px",
      }}
    >
      {!disabled && (
        <div
          className="col-auto form-check form-switch pe-0 pt-2"
          style={{ paddingLeft: 11 }}
        >
          <input
            checked={active}
            className="form-check-input m-0"
            data-testid="active-toggle"
            id={`active-check-${identifier}`}
            role="switch"
            title={active ? "Rule enabled" : "Rule disabled"}
            type="checkbox"
            onChange={handleActiveChange(identifier)}
          />
          <label
            className="form-check-label visually-hidden"
            for={`active-check-${identifier}`}
          >
            Active
          </label>
        </div>
      )}
      <div className="col">
        <QueryInput
          active={active}
          disabled={disabled}
          identifier={identifier}
          inputRef={queriesInputRef}
          queries={queries}
          queryPatterns={queryPatterns}
          replacement={replacement}
          onChange={handleMatcherInputChange}
        />
      </div>
      <div className="col-auto px-0" style={{ paddingTop: 11 }}>
        <MaterialIcon className="pe-none" name="swap_horiz" />
      </div>
      <div className="col-auto">
        <ReplacementInput
          active={active}
          disabled={disabled}
          identifier={identifier}
          queries={queries}
          inputRef={replacementInputRef}
          replacement={replacement}
          useGlobalReplacementStyle={useGlobalReplacementStyle}
          onChange={handleMatcherInputChange}
        />
      </div>
      {!disabled && (
        <div className="rule-row-actions col-auto ps-0">
          <IconButton
            className={cx(
              "px-2",
              isConfirmingDelete
                ? "btn btn-danger border-0"
                : ICON_BUTTON_BASE_CLASS
            )}
            icon={isConfirmingDelete ? "delete" : "close"}
            iconProps={{
              size: "sm",
            }}
            title={isConfirmingDelete ? "Confirm delete rule" : "Delete rule"}
            onBlur={() => clickawayListener(new MouseEvent(""))}
            onClick={handleDeleteClick}
            data-dismiss="delete"
            data-testid="rule-row__delete-button"
          />
        </div>
      )}
    </div>
  );
}

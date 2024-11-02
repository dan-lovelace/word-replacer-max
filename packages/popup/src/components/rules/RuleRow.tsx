import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { cx } from "@worm/shared";
import { STORAGE_MATCHER_PREFIX } from "@worm/shared/src/browser";
import {
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";
import { Matcher } from "@worm/types";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
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
  const replacementInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  confirmingDeleteRef.current = isConfirmingDelete;

  useEffect(() => {
    if (!preferences?.focusRule) return;

    const { focusRule } = preferences;

    if (focusRule !== identifier || !replacementInputRef.current) {
      return;
    }

    // scroll to and focus the new row's replacement input field
    replacementInputRef.current.scrollIntoView();
    replacementInputRef.current.focus();

    // unset focused rule in storage
    const newPreferences = Object.assign({}, preferences);
    newPreferences.focusRule = "";
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

    if (matcherIdx < 0) return;

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

    if (matcherIdx < 0) return;

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
            title={active ? "Rule Enabled" : "Rule Disabled"}
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
          <button
            data-dismiss="delete"
            className={cx(
              "btn",
              isConfirmingDelete
                ? "btn-danger"
                : "btn-light bg-transparent border-0"
            )}
            title={isConfirmingDelete ? "Confirm" : "Delete Rule"}
            onBlur={() => clickawayListener(new MouseEvent(""))}
            onClick={handleDeleteClick}
          >
            <span data-dismiss="delete" className="d-flex align-items-center">
              <MaterialIcon
                name={isConfirmingDelete ? "delete" : "close"}
                size="sm"
                data-dismiss="delete"
              />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

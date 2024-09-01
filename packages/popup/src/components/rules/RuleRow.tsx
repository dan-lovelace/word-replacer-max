import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import {
  STORAGE_MATCHER_PREFIX,
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared";
import { Matcher } from "@worm/types";

import QueryInput from "../QueryInput";
import { RefreshRequiredToast } from "../RefreshRequiredToast";
import ReplacementInput from "../ReplacementInput";
import ToastMessage from "../ToastMessage";

import cx from "../../lib/classnames";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

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
  const {
    storage: { preferences },
  } = useConfig();
  const confirmingDeleteRef = useRef<boolean>();
  const replacementInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { hideToast, showToast } = useToast();

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
      showToast({ children: <RefreshRequiredToast onClose={hideToast} /> });
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
            children: <ToastMessage message={message} severity="danger" />,
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
        showToast({ children: <RefreshRequiredToast onClose={hideToast} /> });
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
    >
      {!disabled && (
        <div className="col-auto form-check form-switch ps-3 pe-0 pt-2">
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
      <div className="col-auto pt-2 px-0">
        <i className="material-icons-sharp">swap_horiz</i>
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
              <span data-dismiss="delete" className="material-icons-sharp fs-6">
                {isConfirmingDelete ? "delete" : "close"}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

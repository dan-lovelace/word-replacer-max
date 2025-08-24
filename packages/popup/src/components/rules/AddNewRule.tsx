import { v4 as uuidv4 } from "uuid";

import {
  getActiveMatcherGroups,
  getSortIndexOffset,
  STORAGE_MATCHER_GROUP_PREFIX,
} from "@worm/shared/src/browser";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { StorageMatcher, StorageMatcherGroup } from "@worm/types/src/rules";
import { SyncStoragePreferences } from "@worm/types/src/storage";

import { PreactChildren } from "../../lib/types";
import { useConfig } from "../../store/Config";

import MaterialIcon from "../icon/MaterialIcon";

type AddNewRuleProps = {
  children?: PreactChildren;
  className?: string;
  text?: string;
};

export default function AddNewRule({
  children,
  className,
  text = "New rule",
}: AddNewRuleProps) {
  const {
    matchers,
    storage: {
      sync,
      sync: { preferences, ruleGroups },
    },
    updateMatchers,
  } = useConfig();

  const handleNewRuleClick = async () => {
    const activeGroups = getActiveMatcherGroups(sync);
    const newIdentifier = uuidv4();

    const focusRule: SyncStoragePreferences["focusRule"] = {
      field: "queries",
      matcher: newIdentifier,
    };
    const focusPreferences = Object.assign({}, preferences, {
      focusRule,
    });

    let newRuleGroups: Record<string, StorageMatcherGroup> = {};
    if (ruleGroups?.active && activeGroups.length) {
      /**
       * Add the new rule to all active groups so it is visible upon creation.
       */
      newRuleGroups = activeGroups.reduce(
        (acc, val) => ({
          ...acc,
          [`${STORAGE_MATCHER_GROUP_PREFIX}${val.identifier}`]: {
            ...val,
            matchers: [...(val.matchers ?? []), newIdentifier],
          },
        }),
        {}
      );
    }

    await storageSetByKeys({
      ...newRuleGroups,
      preferences: focusPreferences,
    });

    const newMatcher: StorageMatcher = {
      active: true,
      identifier: newIdentifier,
      queries: [],
      queryPatterns: [],
      replacement: "",
      sortIndex: getSortIndexOffset(matchers),
      useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
    };

    updateMatchers([...(matchers ?? []), newMatcher]);
  };

  return (
    <button
      className={className ?? "btn btn-secondary btn-sm"}
      onClick={handleNewRuleClick}
      data-testid="add-new-rule-button"
    >
      <span className="d-flex align-items-center">
        {children ?? (
          <>
            <MaterialIcon className="me-2" name="add" size="sm" />
            {text}
          </>
        )}
      </span>
    </button>
  );
}

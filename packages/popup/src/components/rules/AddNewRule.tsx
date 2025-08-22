import { v4 as uuidv4 } from "uuid";

import {
  getActiveMatcherGroups,
  STORAGE_MATCHER_GROUP_PREFIX,
} from "@worm/shared/src/browser";
import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { storageSetByKeys } from "@worm/shared/src/storage";
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

    if (ruleGroups?.active && activeGroups.length) {
      /**
       * Groups are enabled and at least one is active. We need to return the
       * user to the full list of rules which means deactivating all groups,
       * then focusing the new row since it could initially be rendered
       * off-screen.
       */
      const deactivatedGroups = activeGroups.reduce(
        (acc, val) => ({
          ...acc,
          [`${STORAGE_MATCHER_GROUP_PREFIX}${val.identifier}`]: {
            ...val,
            active: false,
          },
        }),
        {}
      );

      await storageSetByKeys({
        ...deactivatedGroups,
        preferences: focusPreferences,
        ruleGroups: Object.assign({}, ruleGroups, { isFiltered: false }),
      });
    } else {
      await storageSetByKeys({
        preferences: focusPreferences,
      });
    }

    updateMatchers([
      ...(matchers ?? []),
      {
        active: true,
        identifier: newIdentifier,
        queries: [],
        queryPatterns: [],
        replacement: "",
        useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
      },
    ]);
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

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

import { useToast } from "../alert/useToast";
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
    storage: {
      sync,
      sync: { preferences, matchers, ruleGroups },
    },
  } = useConfig();
  const { showToast } = useToast();

  const handleNewRuleClick = async () => {
    const activeGroups = getActiveMatcherGroups(sync);
    const newIdentifier = uuidv4();

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

      const focusRule: SyncStoragePreferences["focusRule"] = {
        field: "queries",
        matcher: newIdentifier,
      };

      await storageSetByKeys({
        ...deactivatedGroups,
        preferences: Object.assign({}, preferences, {
          focusRule,
        }),
        ruleGroups: Object.assign({}, ruleGroups, { isFiltered: false }),
      });
    }

    storageSetByKeys(
      {
        matchers: [
          ...(matchers ?? []),
          {
            active: true,
            identifier: newIdentifier,
            queries: [],
            queryPatterns: [],
            replacement: "",
            useGlobalReplacementStyle: DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE,
          },
        ],
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

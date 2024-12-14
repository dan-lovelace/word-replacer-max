import { v4 as uuidv4 } from "uuid";

import { DEFAULT_USE_GLOBAL_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { storageSetByKeys } from "@worm/shared/src/storage";

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
      sync: { matchers },
    },
  } = useConfig();
  const { showToast } = useToast();

  const handleNewRuleClick = () => {
    storageSetByKeys(
      {
        matchers: [
          ...(matchers ?? []),
          {
            active: true,
            identifier: uuidv4(),
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

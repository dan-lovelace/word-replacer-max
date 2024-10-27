import { v4 as uuidv4 } from "uuid";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { PreactChildren } from "../../lib/types";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";

type AddNewRuleProps = {
  children?: PreactChildren;
  className?: string;
};

export default function AddNewRule({ children, className }: AddNewRuleProps) {
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
            useGlobalReplacementStyle: true,
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
      data-testid="add-new-rule-button"
      onClick={handleNewRuleClick}
    >
      <span className="d-flex align-items-center">
        {children ?? (
          <>
            <i className="material-icons-sharp me-1 fs-6">add</i> New rule
          </>
        )}
      </span>
    </button>
  );
}

import { v4 as uuidv4 } from "uuid";

import { storageSetByKeys } from "@worm/shared";

import ToastMessage from "../ToastMessage";

import { PreactChildren } from "../../lib/types";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

type AddNewRuleProps = {
  children?: PreactChildren;
  className?: string;
};

export default function AddNewRule({ children, className }: AddNewRuleProps) {
  const {
    storage: { matchers },
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
            replacementStyle: { useGlobal: true },
          },
        ],
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

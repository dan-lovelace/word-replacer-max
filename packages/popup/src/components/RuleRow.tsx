import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";
import { Matcher } from "@worm/types";

import QueryInput from "./QueryInput";
import ReplacementInput from "./ReplacementInput";
import cx from "../lib/classnames";

type RuleRowProps = {
  matcher: Matcher;
  matchers: Matcher[];
};

export default function RuleRow({
  matcher: { active, identifier, queries, queryPatterns, replacement },
  matchers,
}: RuleRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmingDeleteRef = useRef<boolean>();
  confirmingDeleteRef.current = isConfirmingDelete;

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

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      document.documentElement.removeEventListener("click", clickawayListener);

      storageSetByKeys({
        matchers: matchers.filter(
          (matcher) => matcher.identifier !== identifier
        ),
      });
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div key={identifier} className="row d-flex">
      <div className="col-auto form-check form-switch ps-3 pt-2">
        <input
          checked={active}
          className="form-check-input m-0"
          id={`active-check-${identifier}`}
          role="switch"
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
      <div className="col">
        <QueryInput
          identifier={identifier}
          queries={queries}
          queryPatterns={queryPatterns}
          onChange={handleMatcherInputChange}
        />
      </div>
      <div className="col-auto pt-2 px-0">
        <i className="material-icons-sharp">swap_horiz</i>
      </div>
      <div className="col-auto">
        <ReplacementInput
          identifier={identifier}
          replacement={replacement}
          onChange={handleMatcherInputChange}
        />
      </div>
      <div className="col-auto">
        <button
          data-dismiss="delete"
          className={cx(
            "btn delete-button",
            isConfirmingDelete && "btn-danger"
          )}
          onClick={handleDeleteClick}
        >
          <span data-dismiss="delete" className="d-flex align-items-center">
            <i data-dismiss="delete" className="material-icons-sharp fs-6">
              {isConfirmingDelete ? "delete" : "close"}
            </i>
          </span>
        </button>
      </div>
    </div>
  );
}

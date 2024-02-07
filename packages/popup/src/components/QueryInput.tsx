import { Fragment, VNode } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Matcher, QueryPattern } from "@worm/types";

import caseIcon from "../icons/case";
import regexIcon from "../icons/regex";
import wholeWordIcon from "../icons/whole-word";
import cx from "../lib/classnames";

type QueryInputProps = Pick<
  Matcher,
  "identifier" | "queries" | "queryPatterns"
> & {
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["queries"]
  ) => void;
};

const queryPatternMetadata: {
  icon: VNode;
  title: string;
  value: QueryPattern;
}[] = [
  {
    icon: caseIcon,
    title: "Match Case",
    value: "case",
  },
  {
    icon: wholeWordIcon,
    title: "Match Whole Word",
    value: "wholeWord",
  },
  {
    icon: regexIcon,
    title: "Use Regular Expression",
    value: "regex",
  },
];

export default function QueryInput({
  identifier,
  queries,
  queryPatterns,
  onChange,
}: QueryInputProps) {
  const [value, setValue] = useState("");

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (!value || value.length === 0) return;

    if (!queries.includes(value)) {
      onChange(identifier, "queries", [...queries, value]);
    }

    setValue("");
  };

  const handlePatternChange = (pattern: QueryPattern) => () => {
    const newPatterns = [...queryPatterns];
    const patternIdx = newPatterns.findIndex((p) => p === pattern);

    if (patternIdx < 0) {
      newPatterns.push(pattern);
    } else {
      newPatterns.splice(patternIdx, 1);
    }

    onChange(identifier, "queryPatterns", newPatterns);
  };

  const handleRemoveClick = (query: string) => () => {
    onChange(
      identifier,
      "queries",
      queries.filter((q) => q !== query)
    );
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  return (
    <div>
      <form className="d-flex flex-fill" onSubmit={handleFormSubmit}>
        <div className="flex-fill border rounded rounded-end-0">
          <input
            className="form-control border-0 rounded-end-0"
            enterkeyhint="enter"
            placeholder="Search for..."
            type="text"
            value={value}
            onBlur={handleFormSubmit}
            onInput={handleTextChange}
          />
          <button className="visually-hidden" type="submit">
            Add
          </button>
          {Boolean(queries.length) && (
            <div className="d-flex align-items-start flex-wrap gap-1 p-1">
              {queries.map((query, idx) => (
                <span
                  key={idx}
                  className="d-flex align-items-center badge fs-6 rounded-pill text-bg-light flex-fill-0 pe-0"
                >
                  {query}
                  <button
                    className="bg-transparent border-0"
                    onClick={handleRemoveClick(query)}
                  >
                    <span className="d-flex align-items-center">
                      <i className="material-icons-sharp fs-6">close</i>
                    </span>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          aria-label="Query Patterns"
          className="query-patterns btn-group align-self-start"
          role="group"
        >
          {queryPatternMetadata.map(({ icon, title, value }, idx) => (
            <Fragment key={value}>
              <input
                checked={queryPatterns.includes(value)}
                className={cx("btn-check px-0 py-2")}
                id={identifier + value}
                type="checkbox"
                onClick={handlePatternChange(value)}
              />
              <label
                className={cx(
                  "btn btn-outline-primary d-flex align-items-center",
                  idx === 0 && "rounded-start-0"
                )}
                for={identifier + value}
                title={title}
              >
                {icon}
              </label>
            </Fragment>
          ))}
        </div>
      </form>
    </div>
  );
}

import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx, isReplacementEmpty } from "@worm/shared";
import { Matcher, QueryPattern } from "@worm/types";

import caseIcon from "../../icons/case";
import regexIcon from "../../icons/regex";
import wholeWordIcon from "../../icons/whole-word";
import { useLanguage } from "../../lib/language";
import { PreactChildren } from "../../lib/types";

import { useToast } from "../alert/useToast";
import Chip from "../Chip";

import "./query-input.scss";

type QueryInputProps = Pick<
  Matcher,
  "active" | "identifier" | "queries" | "queryPatterns" | "replacement"
> & {
  disabled: boolean;
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["queries"]
  ) => void;
};

const queryPatternMetadata: {
  icon: PreactChildren;
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
  active,
  disabled,
  identifier,
  queries,
  queryPatterns,
  replacement,
  onChange,
}: QueryInputProps) {
  const [value, setValue] = useState("");

  const language = useLanguage();
  const { showToast } = useToast();

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

      if (!isReplacementEmpty(replacement)) {
        showToast({
          message: language.rules.REFRESH_REQUIRED,
          options: { showRefresh: true },
        });
      }
    } else {
      newPatterns.splice(patternIdx, 1);
    }

    onChange(identifier, "queryPatterns", newPatterns);
  };

  const handleRemoveClick = (query: string) => () => {
    if (active && !isReplacementEmpty(replacement)) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

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

  const queriesExist = Boolean(queries.length);

  return (
    <form
      className="d-flex flex-fill"
      id="query-input"
      onSubmit={handleFormSubmit}
    >
      <div
        className={cx(
          "flex-fill border rounded",
          queriesExist && "rounded-end-0"
        )}
      >
        <input
          className={cx(
            "form-control border-0",
            queriesExist && "rounded-end-0"
          )}
          disabled={disabled}
          enterkeyhint="enter"
          placeholder="Search for..."
          type="text"
          value={value}
          onBlur={handleFormSubmit}
          onInput={handleTextChange}
        />
        <button className="visually-hidden" disabled={disabled} type="submit">
          Add
        </button>
        {queriesExist && (
          <div className="d-flex align-items-start flex-wrap gap-1 p-1">
            {queries.map((query, idx) => (
              <Chip
                key={idx}
                disabled={disabled}
                identifier={query}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>
        )}
      </div>
      <div
        aria-label="Query Patterns"
        className={cx(
          "query-patterns btn-group-vertical align-self-start",
          queriesExist && "queries-exist"
        )}
        role="group"
      >
        {queryPatternMetadata.map(({ icon, title, value }, idx) => {
          const inputId = `${identifier}__${value}`;

          return (
            <Fragment key={value}>
              <input
                checked={queryPatterns.includes(value)}
                className="btn-check"
                disabled={disabled || !queriesExist}
                id={inputId}
                type="checkbox"
                onClick={handlePatternChange(value)}
              />
              <label
                className={cx(
                  "btn btn-outline-primary d-flex align-items-center py-0",
                  (idx === 0 || idx === queryPatternMetadata.length - 1) &&
                    "rounded-start-0"
                )}
                for={inputId}
                title={title}
              >
                {icon}
              </label>
            </Fragment>
          );
        })}
      </div>
    </form>
  );
}

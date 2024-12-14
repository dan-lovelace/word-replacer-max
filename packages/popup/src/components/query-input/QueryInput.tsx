import { Fragment } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx, isReplacementEmpty } from "@worm/shared";
import { QUERY_PASTE_DELIMITER } from "@worm/shared/src/strings";
import { QueryPattern } from "@worm/types/src/replace";
import { Matcher } from "@worm/types/src/rules";

import caseIcon from "../../icons/case";
import regexIcon from "../../icons/regex";
import wholeWordIcon from "../../icons/whole-word";
import { useLanguage } from "../../lib/language";
import { PreactChildren } from "../../lib/types";

import { useToast } from "../alert/useToast";
import Chip from "../Chip";

const INPUT_HEIGHT_BASE = 78;

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
    title: "Match case",
    value: "case",
  },
  {
    icon: wholeWordIcon,
    title: "Match whole word",
    value: "wholeWord",
  },
  {
    icon: regexIcon,
    title: "Use regular expression",
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
  const [inputHeight, setInputHeight] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isShiftHeld, setIsShiftHeld] = useState(false);

  const language = useLanguage();
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!inputContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInputHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(inputContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const keyDownListener = ({ key }: KeyboardEvent) => {
      if (key !== "Shift") return;

      setIsShiftHeld(true);
    };

    const keyUpListener = ({ key }: KeyboardEvent) => {
      if (key !== "Shift") return;

      setIsShiftHeld(false);
    };

    document.documentElement.addEventListener("keydown", keyDownListener);
    document.documentElement.addEventListener("keyup", keyUpListener);

    return () => {
      document.documentElement.removeEventListener("keydown", keyDownListener);
      document.documentElement.removeEventListener("keyup", keyUpListener);
    };
  }, []);

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    if (!inputValue || inputValue.length === 0) return;

    if (!queries.includes(inputValue)) {
      onChange(identifier, "queries", [...queries, inputValue]);
    }

    setInputValue("");
  };

  const handlePaste = (
    event: JSXInternal.TargetedClipboardEvent<HTMLInputElement>
  ) => {
    const { clipboardData } = event;

    if (!clipboardData) {
      return showToast({
        message: language.rules.RULES_CLIPBOARD_PASTE_ERROR,
        options: { severity: "danger" },
      });
    }

    const pasteText = clipboardData.getData("text");
    const parsed = pasteText
      .split(QUERY_PASTE_DELIMITER)
      .map((line) => line.trim())
      .filter(Boolean);

    if (parsed.length < 2 || isShiftHeld) {
      /**
       * Ignore custom paste handling if no newlines exist or Shift is held.
       */
      return;
    }

    event.preventDefault();

    const newQueries = parsed.filter((query) => !queries.includes(query));

    onChange(identifier, "queries", [...queries, ...newQueries]);
    setInputValue("");
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
    setInputValue(event.currentTarget.value);
  };

  return (
    <form
      className="d-flex flex-fill"
      id="query-input"
      onSubmit={handleFormSubmit}
      data-testid="query-input"
    >
      <div
        className="flex-fill border rounded-start"
        ref={inputContainerRef}
        style={{
          borderBottomRightRadius:
            inputHeight > INPUT_HEIGHT_BASE ? "var(--bs-border-radius)" : 0,
        }}
      >
        <div
          style={{
            borderRadius: "var(--bs-border-radius) 0 0 var(--bs-border-radius)",
            outlineColor: Boolean(queries.length)
              ? "transparent"
              : "var(--bs-border-color)",
            outlineStyle: "solid",
            outlineWidth: 1,
            transition: "outline 150ms",
          }}
        >
          <input
            className="form-control border-0 rounded-end-0"
            disabled={disabled}
            enterkeyhint="enter"
            placeholder="Search for..."
            type="text"
            value={inputValue}
            onBlur={handleFormSubmit}
            onInput={handleTextChange}
            onPaste={handlePaste}
            data-testid="query-input__input"
          />
        </div>
        <button className="visually-hidden" disabled={disabled} type="submit">
          Add
        </button>
        <div className="d-flex align-items-start flex-wrap gap-1 p-1">
          {queries.map((query) => (
            <Chip
              key={query}
              disabled={disabled}
              identifier={query}
              onRemove={handleRemoveClick}
              data-testid="query-input__chip"
            />
          ))}
        </div>
      </div>
      <div
        aria-label="Query Patterns"
        className="query-patterns btn-group-vertical align-self-start"
        role="group"
        style={{
          height: INPUT_HEIGHT_BASE - 1,
          marginLeft: -1,
          marginTop: 1,
        }}
      >
        {queryPatternMetadata.map(({ icon, title, value }, idx) => {
          const inputId = `${identifier}__${value}`;

          return (
            <Fragment key={value}>
              <input
                checked={queryPatterns.includes(value)}
                className="btn-check"
                disabled={disabled}
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

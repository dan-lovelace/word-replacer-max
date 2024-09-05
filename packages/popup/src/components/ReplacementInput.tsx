import { Ref } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { isReplacementEmpty } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types";

import { useLanguage } from "../lib/language";
import { useConfig } from "../store/Config";

import { useToast } from "./alert/useToast";
import Button from "./button/Button";

type ReplacementInputProps = Pick<
  Matcher,
  | "active"
  | "identifier"
  | "queries"
  | "replacement"
  | "useGlobalReplacementStyle"
> & {
  disabled: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["replacement"]
  ) => void;
};

export default function ReplacementInput({
  active,
  disabled,
  identifier,
  inputRef,
  queries,
  replacement,
  useGlobalReplacementStyle,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);

  const {
    storage: { matchers, replacementStyle: globalReplacementStyle },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const handleActiveChange = () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx].useGlobalReplacementStyle = !Boolean(
      newMatchers[matcherIdx].useGlobalReplacementStyle
    );

    if (active && Boolean(queries.length) && !isReplacementEmpty(replacement)) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (value === replacement) return;

    if (active && Boolean(queries.length)) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

    onChange(identifier, "replacement", value);
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  return (
    <form className="flex-fill border rounded" onSubmit={handleFormSubmit}>
      <div className="input-group">
        <input
          className="form-control border-0"
          disabled={disabled}
          enterkeyhint="enter"
          ref={inputRef}
          size={globalReplacementStyle?.active ? 11 : 15}
          type="text"
          value={value}
          onBlur={handleFormSubmit}
          onInput={handleTextChange}
        />
        {globalReplacementStyle?.active && (
          <Button
            className="btn btn-outline-secondary border-0 bg-transparent text-secondary"
            title={
              useGlobalReplacementStyle
                ? "Replacement Style Enabled"
                : "Replacement Style Disabled"
            }
            onClick={handleActiveChange}
          >
            <span className="d-flex align-items-center">
              <span className="material-icons-sharp fs-6">
                {useGlobalReplacementStyle
                  ? "format_color_text"
                  : "format_color_reset"}
              </span>
            </span>
          </Button>
        )}
      </div>
      <Button className="visually-hidden" type="submit">
        Add
      </Button>
    </form>
  );
}

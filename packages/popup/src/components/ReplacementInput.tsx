import { Ref } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared";
import { Matcher } from "@worm/types";

import { useConfig } from "../store/Config";
import { useToast } from "../store/Toast";

import { RefreshRequiredToast } from "./RefreshRequiredToast";

type ReplacementInputProps = Pick<
  Matcher,
  "active" | "identifier" | "queries" | "replacement" | "replacementStyle"
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
  replacementStyle,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);

  const {
    storage: { matchers, replacementStyle: globalReplacementStyle },
  } = useConfig();
  const { hideToast, showToast } = useToast();

  const handleActiveChange = () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx].replacementStyle = {
      ...newMatchers[matcherIdx].replacementStyle,
      useGlobal: !Boolean(newMatchers[matcherIdx].replacementStyle?.useGlobal),
    };

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
      showToast({ children: <RefreshRequiredToast onClose={hideToast} /> });
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
          <button
            className="btn btn-outline-secondary border-0 bg-transparent text-secondary"
            title={
              replacementStyle?.useGlobal
                ? "Replacement Style Enabled"
                : "Replacement Style Disabled"
            }
            onClick={handleActiveChange}
          >
            <span className="d-flex align-items-center">
              <span className="material-icons-sharp fs-6">
                {replacementStyle?.useGlobal
                  ? "format_color_text"
                  : "format_color_reset"}
              </span>
            </span>
          </button>
        )}
      </div>
      <button className="visually-hidden" type="submit">
        Add
      </button>
    </form>
  );
}

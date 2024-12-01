import { Ref } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx, isReplacementEmpty } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";

import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Button from "../button/Button";
import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";

import ReplacementSuggest from "./ReplacementSuggest";

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

const INPUT_BUTTON_WIDTH = 31;
const INPUT_WIDTH_BASE = 250;

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

  const { hasAccess } = useAuth();
  const {
    storage: {
      sync: { matchers, replacementStyle, replacementSuggest },
    },
  } = useConfig();
  const { showRefreshToast } = useToast();

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    updateReplacement();
  };

  const handleReplacementStyleChange = () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (!newMatchers[matcherIdx]) return;

    newMatchers[matcherIdx].useGlobalReplacementStyle = !Boolean(
      newMatchers[matcherIdx].useGlobalReplacementStyle
    );

    showRefreshToast(
      active && Boolean(queries.length) && !isReplacementEmpty(replacement)
    );

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  const updateReplacement = (override?: string) => {
    const updatedValue = override ?? value;

    if (updatedValue === replacement) return;

    showRefreshToast(active && Boolean(queries.length));

    onChange(identifier, "replacement", updatedValue);
  };

  const canSuggest =
    replacementSuggest?.active && hasAccess("api:post:Suggest");
  const inputWidth =
    INPUT_WIDTH_BASE -
    ((canSuggest ? INPUT_BUTTON_WIDTH : 0) +
      (replacementStyle?.active ? INPUT_BUTTON_WIDTH : 0));

  return (
    <form
      className="flex-fill border rounded"
      onSubmit={handleFormSubmit}
      data-testid="replacement-input-form"
    >
      <div className="input-group" role="group">
        <input
          className="form-control border-0"
          disabled={disabled}
          enterkeyhint="enter"
          ref={inputRef}
          type="text"
          value={value}
          onBlur={handleFormSubmit}
          onInput={handleTextChange}
          style={{
            width: inputWidth,
          }}
          data-testid="replacement-text-input"
        />
        <div className={cx(!canSuggest && "d-none")}>
          <ReplacementSuggest
            active={active}
            disabled={disabled}
            identifier={identifier}
            queries={queries}
            replacement={replacement}
            value={value}
            onReplacementChange={onChange}
            setValue={setValue}
          />
        </div>
        {replacementStyle?.active && (
          <IconButton
            className={cx(ICON_BUTTON_BASE_CLASS, "px-2")}
            disabled={disabled}
            icon={
              useGlobalReplacementStyle
                ? "format_color_text"
                : "format_color_reset"
            }
            iconProps={{
              className: "text-secondary",
              size: "sm",
            }}
            title={`Replacement style ${
              useGlobalReplacementStyle ? "enabled" : "disabled"
            }`}
            onClick={handleReplacementStyleChange}
            data-testid="replacement-style-button"
          />
        )}
      </div>
      <Button className="visually-hidden" disabled={disabled} type="submit">
        Save
      </Button>
    </form>
  );
}

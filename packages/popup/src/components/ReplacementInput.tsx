import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Matcher } from "@worm/types";

import { RefreshRequiredToast } from "./RefreshRequiredToast";
import { useToast } from "../store/Toast";

type ReplacementInputProps = Pick<
  Matcher,
  "active" | "identifier" | "queries" | "replacement"
> & {
  disabled: boolean;
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
  queries,
  replacement,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);
  const { hideToast, showToast } = useToast();

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
      <input
        className="form-control border-0"
        disabled={disabled}
        enterkeyhint="enter"
        size={15}
        type="text"
        value={value}
        onBlur={handleFormSubmit}
        onInput={handleTextChange}
      />
      <button className="visually-hidden" type="submit">
        Add
      </button>
    </form>
  );
}

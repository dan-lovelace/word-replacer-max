import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Matcher } from "@worm/types";

type ReplacementInputProps = Pick<Matcher, "identifier" | "replacement"> & {
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["replacement"]
  ) => void;
};

export default function ReplacementInput({
  identifier,
  replacement,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    onChange(identifier, "replacement", value);
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  return (
    <form className="position-relative flex-fill" onSubmit={handleFormSubmit}>
      <input
        className="form-control w-100"
        enterkeyhint="enter"
        size={12}
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

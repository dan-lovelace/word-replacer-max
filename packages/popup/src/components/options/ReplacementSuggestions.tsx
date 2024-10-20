import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { Indented } from "../../containers/Indented";
import { useConfig } from "../../store/Config";

import Slide from "../transition/Slide";

export default function ReplacementSuggestions() {
  const {
    storage: { replacementSuggest },
  } = useConfig();
  const isActive = Boolean(replacementSuggest?.active);

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newReplacementSuggestion = Object.assign({}, replacementSuggest);

    newReplacementSuggestion.active = event.currentTarget.checked;

    storageSetByKeys({
      replacementSuggest: newReplacementSuggestion,
    });
  };

  const inputId = "replacement-suggestion-enabled-checkbox";

  return (
    <>
      <div
        className="form-check form-switch ps-0 d-flex align-items-center gap-2"
        data-testid="replacement-suggestions-input-wrapper"
      >
        <input
          checked={isActive}
          className="form-check-input m-0"
          data-testid="replacement-suggestions-toggle-button"
          id={inputId}
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
        />
        <label
          className="form-check-label user-select-none fw-medium"
          for={inputId}
        >
          Replacement suggestions
        </label>
      </div>
      <Slide isOpen={!isActive}>
        <Indented data-testid="replacement-suggestions-description">
          <p className="fs-sm">
            Use the power of generative AI to suggest replacements for your
            words and phrases.
          </p>
        </Indented>
      </Slide>
      <Slide isOpen={isActive}>
        <Indented
          className="py-1"
          data-testid="replacement-suggestions-options"
        >
          Usage
        </Indented>
      </Slide>
    </>
  );
}

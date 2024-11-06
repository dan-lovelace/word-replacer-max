import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { Indented } from "../../containers/Indented";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import Slide from "../transition/Slide";

import ApiUsage from "./ApiUsage";

export default function ReplacementSuggestions() {
  const { hasAccess } = useAuth();
  const {
    storage: {
      sync: { replacementSuggest },
    },
  } = useConfig();

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
  const isActive = Boolean(replacementSuggest?.active);

  if (!hasAccess("api:post:Suggest")) {
    return <></>;
  }

  return (
    <div className="replacement-suggestions">
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
            Looking for the right words? Get AI suggestions in your preferred
            style.
          </p>
        </Indented>
      </Slide>
      <Slide isOpen={isActive}>
        <Indented
          className="py-1"
          data-testid="replacement-suggestions-options"
          style={{ height: 56 }}
        >
          <ApiUsage />
        </Indented>
      </Slide>
    </div>
  );
}

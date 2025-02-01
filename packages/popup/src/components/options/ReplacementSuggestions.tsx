import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";

import { Indented } from "../../containers/Indented";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import Slide from "../transition/Slide";

import ApiUsage from "./ApiUsage";

const INPUT_ID = "replacement-suggestion-enabled-checkbox";

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
          id={INPUT_ID}
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
        />
        <label
          className="form-check-label user-select-none fw-medium"
          for={INPUT_ID}
        >
          Replacement suggestions
        </label>
      </div>
      <Slide isOpen={!isActive}>
        <Indented data-testid="replacement-suggestions-description">
          <div className="fs-sm">
            Need help finding the right words? Get replacement recommendations
            in your preferred style.
          </div>
        </Indented>
      </Slide>
      <Slide isOpen={isActive}>
        <Indented
          className="py-1"
          style={{ minHeight: 56 }}
          data-testid="replacement-suggestions-options"
        >
          <ApiUsage />
        </Indented>
      </Slide>
    </div>
  );
}

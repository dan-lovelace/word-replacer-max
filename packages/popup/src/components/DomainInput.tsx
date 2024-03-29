import { useContext, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared";
import { DomainEffect } from "@worm/types";

import Chip from "./Chip";
import { Config } from "../store/Config";

export default function DomainInput() {
  const [value, setValue] = useState("");
  const {
    storage: { domainList, preferences },
  } = useContext(Config);

  const handleEffectChange = (effect: DomainEffect) => () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.domainListEffect = effect;

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (!value || value.length === 0) return;

    if (!domainList?.includes(value)) {
      storageSetByKeys({
        domainList: [...(domainList || []), value],
      });
    }

    setValue("");
  };

  const handleRemoveClick = (domain: string) => () => {
    storageSetByKeys({
      domainList: domainList?.filter((d) => d !== domain),
    });
  };

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex align-items-center gap-3">
        <div>Effect:</div>
        <div className="form-check m-0">
          <input
            checked={preferences?.domainListEffect === "allow"}
            className="form-check-input"
            id="allowRadio"
            name="allow"
            type="radio"
            onChange={handleEffectChange("allow")}
          />
          <label className="form-check-label" for="allowRadio">
            Allow
          </label>
        </div>
        <div className="form-check m-0">
          <input
            checked={preferences?.domainListEffect === "deny"}
            className="form-check-input"
            id="denyRadio"
            name="deny"
            type="radio"
            onChange={handleEffectChange("deny")}
          />
          <label className="form-check-label" for="denyRadio">
            Deny
          </label>
        </div>
      </div>
      <form className="position-relative flex-fill" onSubmit={handleFormSubmit}>
        {Boolean(domainList?.length) && (
          <div className="d-flex align-items-start flex-wrap gap-1 pb-2">
            {domainList?.map((domain, idx) => (
              <Chip
                key={idx}
                identifier={domain}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>
        )}
        <input
          className="form-control w-100"
          enterkeyhint="enter"
          placeholder="Add domain..."
          type="text"
          value={value}
          onBlur={handleFormSubmit}
          onInput={handleTextChange}
        />
        <button className="visually-hidden" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}

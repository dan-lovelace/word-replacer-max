import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { formatDomainInput } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { DomainEffect } from "@worm/types/src/popup";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Chip from "../Chip";
import Slide from "../transition/Slide";

export default function DomainInput() {
  const [value, setValue] = useState("");

  const {
    storage: {
      sync: { domainList, preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

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

    if (!value.trim().length) return;

    const formatted = formatDomainInput(value);

    if (!formatted) {
      showToast({
        message: "Invalid domain. Check your input and try again.",
        options: {
          severity: "danger",
        },
      });

      return;
    }

    if (!domainList?.includes(formatted)) {
      storageSetByKeys(
        {
          domainList: [...(domainList || []), formatted],
        },
        {
          onError: (message) => {
            showToast({
              message,
              options: { severity: "danger" },
            });
          },
        }
      );
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
    <div className="container-fluid gx-0 d-flex flex-column pt-2">
      <div className="row mb-2">
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center gap-2">
            <div>Effect:</div>
            <div className="d-flex gap-3">
              <div className="form-check m-0">
                <input
                  checked={preferences?.domainListEffect === "allow"}
                  className="form-check-input"
                  id="allowRadio"
                  name="allow"
                  type="radio"
                  onChange={handleEffectChange("allow")}
                />
                <label
                  className="form-check-label"
                  for="allowRadio"
                  data-testid="allow-radio-button"
                >
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
                <label
                  className="form-check-label"
                  for="denyRadio"
                  data-testid="deny-radio-button"
                >
                  Deny
                </label>
              </div>
            </div>
          </div>
          <Slide isOpen={preferences?.domainListEffect === "allow"}>
            <Alert
              className="mt-2"
              severity="warning"
              title={language.domains.ALLOWLIST_ALERT_TITLE}
              data-testid="allow-alert"
            >
              {language.domains.ALLOWLIST_ALERT_BODY}
            </Alert>
          </Slide>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-lg-8">
          <form
            className="position-relative flex-fill"
            onSubmit={handleFormSubmit}
          >
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
              placeholder={language.domains.ADD_DOMAIN_FORM_INPUT_PLACEHOLDER}
              type="text"
              style={{ maxWidth: "400px" }}
              value={value}
              onBlur={handleFormSubmit}
              onInput={handleTextChange}
              data-testid="add-domain-input"
            />
            <button className="visually-hidden" type="submit">
              {language.domains.ADD_DOMAIN_FORM_SUBMIT_BUTTON_TEXT}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

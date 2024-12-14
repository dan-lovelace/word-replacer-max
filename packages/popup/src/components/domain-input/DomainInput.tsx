import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";
import { DomainEffect } from "@worm/types/src/popup";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert, { ALERT_SIZES } from "../Alerts";
import Chip from "../Chip";
import MaterialIcon from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

export default function DomainInput() {
  const [value, setValue] = useState("");

  const {
    storage: {
      sync: { domainList, preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const addNewDomain = (hostname?: string) => {
    if (!hostname || hostname.length === 0) return;

    if (!domainList?.includes(hostname)) {
      storageSetByKeys(
        {
          domainList: [...(domainList || []), hostname],
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
  };

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

    addNewDomain(value);
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

  const { domains: lang } = language;
  const domainsExist = Boolean(domainList?.length);
  const isDenying = preferences?.domainListEffect === "deny";

  return (
    <div className="container-fluid gx-0 d-flex flex-column gap-3">
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="fw-bold fs-5 mb-1">{lang.DOMAINS_LIST_HEADING}</div>
          <form
            className="position-relative flex-fill"
            onSubmit={handleFormSubmit}
          >
            <div className="pb-2">
              {!domainsExist && (
                <Alert
                  title={lang.EMPTY_DOMAINS_LIST_ALERT_TITLE}
                  style={{ maxWidth: ALERT_SIZES.sm, transition: "all 90ms" }}
                  severity={isDenying ? "success" : "warning"}
                >
                  {isDenying
                    ? lang.EMPTY_DOMAINS_LIST_ALERT_BODY_DENY
                    : lang.EMPTY_DOMAINS_LIST_ALERT_BODY_ALLOW}
                </Alert>
              )}
              {domainsExist && (
                <div className="d-flex align-items-start flex-wrap gap-1">
                  {domainList?.map((domain, idx) => (
                    <Chip
                      key={`domain-${idx}`}
                      identifier={domain}
                      onRemove={handleRemoveClick}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              className="form-control w-100"
              enterkeyhint="enter"
              placeholder={lang.ADD_DOMAIN_FORM_INPUT_PLACEHOLDER}
              type="text"
              style={{ maxWidth: "400px" }}
              value={value}
              onBlur={handleFormSubmit}
              onInput={handleTextChange}
            />
            <button className="visually-hidden" type="submit">
              {lang.ADD_DOMAIN_FORM_SUBMIT_BUTTON_TEXT}
            </button>
          </form>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="fw-bold fs-5">{lang.REPLACEMENT_SCOPE_HEADING}</div>
          <div className="fs-sm mb-2">{lang.REPLACEMENT_SCOPE_SUB_HEADING}</div>
          <div className="d-flex flex-column gap-2">
            <div className="form-check d-flex align-items-center m-0">
              <div>
                <input
                  checked={isDenying}
                  className="form-check-input"
                  id="denyRadio"
                  name="deny"
                  type="radio"
                  onChange={handleEffectChange("deny")}
                />
                <label className="form-check-label" for="denyRadio">
                  <span className="fw-medium">
                    {lang.LIST_EFFECT_BLOCKLIST_NAME}
                  </span>{" "}
                  - {lang.LIST_EFFECT_BLOCKLIST_LABEL}
                </label>
              </div>
              &nbsp;
              <Tooltip title={lang.LIST_EFFECT_BLOCKLIST_DESCRIPTION}>
                <MaterialIcon
                  className="text-body-tertiary"
                  name="info"
                  size="sm"
                />
              </Tooltip>
            </div>
            <div className="form-check d-flex align-items-center m-0">
              <div>
                <input
                  checked={!isDenying}
                  className="form-check-input"
                  id="allowRadio"
                  name="allow"
                  type="radio"
                  onChange={handleEffectChange("allow")}
                />
                <label className="form-check-label" for="allowRadio">
                  <span className="fw-medium">
                    {lang.LIST_EFFECT_ALLOWLIST_NAME}
                  </span>{" "}
                  - {lang.LIST_EFFECT_ALLOWLIST_LABEL}
                </label>
              </div>
              &nbsp;
              <Tooltip title={lang.LIST_EFFECT_ALLOWLIST_DESCRIPTION}>
                <MaterialIcon
                  className="text-body-tertiary"
                  name="info"
                  size="sm"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

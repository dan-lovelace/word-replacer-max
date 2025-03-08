import { ComponentProps } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Modal } from "bootstrap";

import { browser } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { StorageProvider } from "@worm/types/src/storage";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";

type RuleSyncProps = ComponentProps<"div"> & {};

const INPUT_ID = "rule-sync-enabled-checkbox";

const providerInfo: Record<StorageProvider, { href: string }> = {
  local: {
    href: "https://developer.chrome.com/docs/extensions/reference/api/storage#property-local",
  },
  session: {
    href: "https://developer.chrome.com/docs/extensions/reference/api/storage#property-session",
  },
  sync: {
    href: "https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync",
  },
};

export default function RuleSync({}: RuleSyncProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [nextValue, setNextValue] = useState<boolean>();

  const {
    storage: {
      sync: { preferences, ruleSync },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const modalRef = useRef<Modal>();

  useEffect(() => {
    const modalElement = document.getElementById("sync-confirm-modal");

    if (!modalElement) {
      throw new Error("Unable to find modal element");
    }

    const closeListener = () => {
      setIsConfirmed(false);
    };

    modalElement.addEventListener("hide.bs.modal", closeListener);

    const modal = new Modal(modalElement);

    modalRef.current = modal;

    return () => {
      modalElement.removeEventListener("hide.bs.modal", closeListener);
      modal.dispose();
    };
  }, []);

  const getSyncUrl = () => {
    const { manifest_version } = browser.runtime.getManifest();

    if (manifest_version === 2) {
      return "https://www.mozilla.org/en-US/firefox/features/sync/";
    }

    return "https://support.google.com/chrome/answer/185277";
  };

  const handleActiveClick = (
    event: JSXInternal.TargetedMouseEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const newValue = ruleSync?.provider === "local" ? true : false;
    setNextValue(newValue);

    modalRef.current?.show();
  };

  const handleIsConfirmedChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setIsConfirmed(event.currentTarget.checked);
  };

  const handleProceedClick = () => {
    // TODO: migrate rules to new storage

    const newRuleSync = Object.assign({}, ruleSync);
    newRuleSync.provider = nextValue ? "sync" : "local";

    storageSetByKeys(
      {
        ruleSync: newRuleSync,
      },
      {
        onError(message) {
          showToast({
            message,
            options: { severity: "danger" },
          });
        },
        onSuccess() {
          modalRef.current?.hide();
        },
      }
    );
  };

  const handleVisitSharingClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = "sharing";

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const isActive = Boolean(ruleSync?.provider === "sync");
  const prevProvider: StorageProvider = nextValue ? "local" : "sync";
  const nextProvider: StorageProvider = nextValue ? "sync" : "local";

  return (
    <>
      <div data-testid="rule-sync">
        <div
          className="form-check form-switch ps-0 d-flex align-items-center gap-2"
          data-testid="rule-sync-input-wrapper"
        >
          <input
            checked={isActive}
            className="form-check-input m-0"
            id={INPUT_ID}
            role="switch"
            type="checkbox"
            onClick={handleActiveClick}
            data-testid="rule-sync-toggle-button"
          />
          <label
            className="form-check-label user-select-none fw-medium"
            for={INPUT_ID}
          >
            Rule sync
          </label>
        </div>
        <Indented data-testid="rule-sync-description">
          <div className="fs-sm">
            Use your browser's{" "}
            <a href={getSyncUrl()} target="_blank">
              sync feature
            </a>{" "}
            to keep your rules up to date on all your devices. You should only
            disable this if you're getting alerts about exceeding storage
            capacity.
          </div>
        </Indented>
      </div>

      <div
        aria-hidden="true"
        aria-labelledby="sync-confirm-modal-label"
        className="modal fade z-modal"
        data-testid="sync-confirm-modal"
        data-bs-backdrop="static"
        id="sync-confirm-modal"
        tabindex={-1}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="sync-confirm-modal-label">
                {language.ruleSync.warningModal.HEADING}
              </h1>
              <button
                aria-label="Close"
                className="btn-close"
                data-bs-dismiss="modal"
                type="button"
              ></button>
            </div>
            <div className="modal-body">
              <p>
                You are switching from{" "}
                <a href={providerInfo[prevProvider].href} target="_blank">
                  {prevProvider}
                </a>{" "}
                to{" "}
                <a href={providerInfo[nextProvider].href} target="_blank">
                  {nextProvider}
                </a>{" "}
                storage for your rules.{" "}
                {nextProvider === "local"
                  ? language.ruleSync.warningModal.ALERT_BODY_LOCAL
                  : language.ruleSync.warningModal.ALERT_BODY_SYNC}
              </p>

              <Alert
                severity="danger"
                title={language.ruleSync.warningModal.ALERT_TITLE}
              >
                <p>
                  When changing storage types, it is possible to lose your rules
                  forever. We recommend exporting your rules{" "}
                  <span
                    className="text-primary text-decoration-underline"
                    role="button"
                    onClick={handleVisitSharingClick}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    on the sharing tab
                  </span>{" "}
                  before proceeding.
                </p>

                <div className="form-check">
                  <label
                    className="user-select-none"
                    for="confirmation-checkbox"
                  >
                    {language.ruleSync.warningModal.CONFIRM_CHECKBOX_LABEL}
                  </label>
                  <input
                    checked={isConfirmed}
                    className="form-check-input"
                    id="confirmation-checkbox"
                    type="checkbox"
                    onChange={handleIsConfirmedChange}
                    data-testid="confirmation-checkbox"
                  />
                </div>
              </Alert>
            </div>
            <div className="modal-footer">
              <Button
                data-bs-dismiss="modal"
                data-testid="sync-confirm-modal-cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="btn btn-primary"
                disabled={!isConfirmed}
                onClick={handleProceedClick}
              >
                Proceed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

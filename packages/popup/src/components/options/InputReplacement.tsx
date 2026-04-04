import { useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Modal } from "bootstrap";

import {
  getCommandShortcut,
  openShortcutSettings,
  parseShortcutKeys,
  ShortcutKey,
} from "@worm/shared/src/browser";
import { DEFAULT_INPUT_REPLACE } from "@worm/shared/src/replace/lib/input-replace";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { InputReplacementMode } from "@worm/types/src/replace";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Alert from "../Alerts";
import Button from "../button/Button";
import TextButton from "../button/TextButton";
import Slide from "../transition/Slide";

type ConfirmState = "idle" | "confirmed" | "confirming";

const MODAL_ID = "real-time-confirm";

export default function InputReplacement() {
  const [confirmStatus, setConfirmStatus] = useState<ConfirmState>("idle");
  const [shortcutKeys, setShortcutKeys] = useState<ShortcutKey[]>([]);

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const { showRefreshToast } = useToast();

  const hideModalButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<Modal>();

  const isActive = !!preferences?.inputReplacement?.active;
  const shortcutExists = shortcutKeys.length > 0;

  useEffect(() => {
    getCommandShortcut("input-replacement").then((shortcut) => {
      setShortcutKeys(parseShortcutKeys(shortcut));
    });
  }, []);

  useEffect(() => {
    const modalElement = document.getElementById(MODAL_ID);

    if (!modalElement) {
      throw new Error("Unable to find modal element");
    }

    const closeListener = () => {
      setConfirmStatus("idle");
    };

    modalElement.addEventListener("hide.bs.modal", closeListener);

    const modal = new Modal(modalElement);

    modalRef.current = modal;

    return () => {
      modalElement.removeEventListener("hide.bs.modal", closeListener);
      modal.dispose();
    };
  }, []);

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newPreferences = Object.assign({}, preferences);
    const newInputReplacement = Object.assign(
      {},
      newPreferences.inputReplacement
    );
    const newValue = event.currentTarget.checked;

    newInputReplacement.active = newValue;

    if (!newValue) {
      // reset to default mode when disabling
      newInputReplacement.mode = DEFAULT_INPUT_REPLACE.mode;
    }

    newPreferences.inputReplacement = newInputReplacement;

    storageSetByKeys({ preferences: newPreferences });
    showRefreshToast();
  };

  const handleConfirm = () => {
    updateMode("real-time");
    modalRef.current?.hide();

    showRefreshToast();
  };

  const handleConfirmChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setConfirmStatus(event.currentTarget.checked ? "confirmed" : "confirming");
  };

  const handleModeChange = (newMode: InputReplacementMode) => () => {
    updateMode(newMode);
  };

  const handleRealTimeClick = (event: MouseEvent) => {
    if (preferences?.inputReplacement?.mode !== "real-time") {
      event.preventDefault();
      modalRef.current?.show();
    }
  };

  const updateMode = (newMode: InputReplacementMode) => {
    const newPreferences = Object.assign({}, preferences);
    const newInputReplacement = Object.assign(
      {},
      newPreferences.inputReplacement
    );

    newInputReplacement.mode = newMode;
    newPreferences.inputReplacement = newInputReplacement;

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <>
      <div className="input-replacement">
        <div
          className="form-check form-switch ps-0 d-flex align-items-center gap-2"
          data-testid="input-replacement-input-wrapper"
        >
          <input
            checked={isActive}
            className="form-check-input m-0"
            data-testid="input-replacement-toggle-button"
            id="input-replacement-enabled-checkbox"
            role="switch"
            type="checkbox"
            onChange={handleActiveChange}
          />
          <label
            className="form-check-label user-select-none fw-medium"
            for="input-replacement-enabled-checkbox"
          >
            Replace text where I type
          </label>
        </div>
        <Slide isOpen={!isActive}>
          <Indented data-testid="input-replacement-description">
            <div className="fs-sm">
              By default, replacements only run on page text. Turn this on to
              also replace text in search boxes, forms, and other inputs.
            </div>
          </Indented>
        </Slide>
        <Slide isOpen={isActive}>
          <Indented className="py-1" data-testid="input-replacement-options">
            <div className="d-flex flex-column gap-1">
              <div
                className="border rounded form-check m-0 pe-3 py-2"
                style={{ paddingLeft: "2.5rem" }}
              >
                <input
                  checked={preferences?.inputReplacement?.mode === "on-demand"}
                  className="form-check-input"
                  id="onDemandRadio"
                  name="on-demand"
                  type="radio"
                  onChange={handleModeChange("on-demand")}
                />
                <label
                  className="form-check-label"
                  for="onDemandRadio"
                  data-testid="on-demand-radio-button"
                >
                  When I press a key combination
                </label>
                <div className="fs-sm">
                  <div className="mb-3">
                    Replacements run only when you trigger them manually.
                  </div>
                  <div className="d-flex align-items-center gap-2 fs-sm">
                    <div className="d-flex align-items-center gap-1">
                      <span>Shortcut:</span>
                      {shortcutExists ? (
                        <>
                          {shortcutKeys.map((key) => (
                            <kbd key={key}>{key}</kbd>
                          ))}
                        </>
                      ) : (
                        <span className="text-muted fst-italic">None</span>
                      )}
                    </div>
                    <TextButton onClick={openShortcutSettings}>
                      {shortcutExists ? "Change" : "Set a shortcut"}
                    </TextButton>
                  </div>
                </div>
              </div>
              <div
                className="border rounded form-check m-0 pe-3 py-2"
                style={{ paddingLeft: "2.5rem" }}
              >
                <input
                  checked={preferences?.inputReplacement?.mode === "real-time"}
                  className="form-check-input"
                  id="realTimeRadio"
                  name="real-time"
                  type="radio"
                  onChange={handleModeChange("real-time")}
                  onClick={handleRealTimeClick}
                />
                <label
                  className="form-check-label"
                  for="realTimeRadio"
                  data-testid="real-time-radio-button"
                >
                  All the time <strong>(unstable)</strong>
                </label>
                <div className="fs-sm">
                  Replacements run in real time on page load and every
                  keystroke.
                </div>
              </div>
            </div>
          </Indented>
        </Slide>
      </div>

      <div
        aria-hidden="true"
        aria-labelledby="real-time-confirm-label"
        className="modal fade"
        data-testid="real-time-confirm"
        id={MODAL_ID}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="real-time-confirm-label">
                Confirmation
              </h1>
              <button
                aria-label="Close"
                className="btn-close"
                data-bs-dismiss="modal"
                ref={hideModalButtonRef}
                type="button"
              />
            </div>
            <div className="modal-body">
              <Alert
                severity="danger"
                title="Important: Review before enabling"
                data-testid="input-replacment-confirmation-alert"
              >
                <p>
                  Replacements apply instantly as you type. This feature is not
                  stable and may lead to the text cursor moving around
                  unexpectedly.
                </p>
                <p>
                  Additionally, it could result in the submission of false or
                  incorrect data in things like web forms, emails and
                  spreadsheets.
                </p>

                <div className="form-check">
                  <label
                    className="user-select-none"
                    htmlFor="input-replacement-confirmation-checkbox"
                  >
                    I understand and accept the risks
                  </label>
                  <input
                    checked={confirmStatus === "confirmed"}
                    className="form-check-input"
                    id="input-replacement-confirmation-checkbox"
                    type="checkbox"
                    onChange={handleConfirmChange}
                    data-testid="input-replacement-confirmation-checkbox"
                  />
                </div>
              </Alert>
            </div>
            <div className="modal-footer">
              <Button
                data-bs-dismiss="modal"
                data-testid="input-replacement-confirm-modal-cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="btn btn-primary"
                disabled={confirmStatus !== "confirmed"}
                onClick={handleConfirm}
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

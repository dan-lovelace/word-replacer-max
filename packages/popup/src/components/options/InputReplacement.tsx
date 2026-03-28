import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import {
  getCommandShortcut,
  openShortcutSettings,
  parseShortcutKeys,
  ShortcutKey,
} from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { InputReplacementMode } from "@worm/types/src/replace";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import TextButton from "../button/TextButton";
import Slide from "../transition/Slide";

export default function InputReplacement() {
  const [shortcutKeys, setShortcutKeys] = useState<ShortcutKey[]>([]);

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const isActive = !!preferences?.inputReplacement?.enabled;

  useEffect(() => {
    getCommandShortcut("input-replacement").then((shortcut) => {
      setShortcutKeys(parseShortcutKeys(shortcut));
    });
  }, []);

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newPreferences = Object.assign({}, preferences);
    const newInputReplacement = Object.assign(
      {},
      newPreferences.inputReplacement
    );

    newInputReplacement.enabled = event.currentTarget.checked;
    newPreferences.inputReplacement = newInputReplacement;

    storageSetByKeys({ preferences: newPreferences });

    showToast({
      message: language.rules.REFRESH_REQUIRED,
      options: { showRefresh: true },
    });
  };

  const handleModeChange = (newMode: InputReplacementMode) => () => {
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
          Replace text in fields I type into
        </label>
      </div>
      <Slide isOpen={!isActive}>
        <Indented data-testid="input-replacement-description">
          <div className="fs-sm">
            By default, replacements only run on page text. Turn this on to also
            replace text in search boxes, forms, and other inputs.
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
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center gap-1">
                    Shortcut:
                    {shortcutKeys.length > 0 ? (
                      <>
                        {shortcutKeys.map((key) => (
                          <kbd key={key}>{key}</kbd>
                        ))}
                      </>
                    ) : (
                      <span>No shortcut set</span>
                    )}
                  </div>
                  ·
                  <TextButton onClick={openShortcutSettings}>
                    Change in shortcuts
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
              />
              <label
                className="form-check-label"
                for="realTimeRadio"
                data-testid="real-time-radio-button"
              >
                Immediately as I type
              </label>
              <div className="fs-sm">
                Replacements run in real time on every keystroke.
              </div>
            </div>
          </div>
        </Indented>
      </Slide>
    </div>
  );
}

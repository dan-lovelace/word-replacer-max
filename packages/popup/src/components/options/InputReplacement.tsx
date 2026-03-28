import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared/src/storage";
import { InputReplacementMode } from "@worm/types/src/replace";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Slide from "../transition/Slide";

export default function InputReplacement() {
  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const isActive = !!preferences?.inputReplacement?.enabled;

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
          Input replacement
        </label>
      </div>
      <Slide isOpen={!isActive}>
        <Indented data-testid="input-replacement-description">
          <div className="fs-sm">
            By default, the extension will not run replacements on any elements
            you type into. Turn this on to see options for real-time and
            on-demand input replacement.
          </div>
        </Indented>
      </Slide>
      <Slide isOpen={isActive}>
        <Indented className="py-1" data-testid="input-replacement-options">
          <div className="fs-sm mb-1">
            When would you like input replacements to run?
          </div>
          <div className="form-check">
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
              Only when I press a hotkey
            </label>
          </div>
          <div className="form-check">
            <input
              checked={preferences?.inputReplacement?.mode === "realtime"}
              className="form-check-input"
              id="realtimeRadio"
              name="realtime"
              type="radio"
              onChange={handleModeChange("realtime")}
            />
            <label
              className="form-check-label"
              for="realtimeRadio"
              data-testid="realtime-radio-button"
            >
              Immediately as I type
            </label>
          </div>
        </Indented>
      </Slide>
    </div>
  );
}

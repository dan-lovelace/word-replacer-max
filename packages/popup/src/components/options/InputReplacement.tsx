import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import {
  getCommandShortcut,
  openShortcutSettings,
  parseShortcutKeys,
  ShortcutKey,
} from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import TextButton from "../button/TextButton";

export default function InputReplacement() {
  const [shortcutKeys, setShortcutKeys] = useState<ShortcutKey[]>([]);

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const isActive = !!preferences?.inputReplacement.active;
  const shortcutExists = shortcutKeys.length > 0;

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

    newInputReplacement.active = event.currentTarget.checked;
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
          Replace text where you type
        </label>
      </div>
      <Indented data-testid="input-replacement-description">
        <div className="fs-sm">
          Replacements don't run automatically in text fields or rich-text
          editors. Use a keyboard shortcut to apply them on demand.
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 fs-sm">
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
      </Indented>
    </div>
  );
}

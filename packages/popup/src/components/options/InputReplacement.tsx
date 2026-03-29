import { useEffect, useState } from "preact/hooks";

import {
  getCommandShortcut,
  openShortcutSettings,
  parseShortcutKeys,
  ShortcutKey,
} from "@worm/shared/src/browser";

import { Indented } from "../../containers/Indented";

import TextButton from "../button/TextButton";

export default function InputReplacement() {
  const [shortcutKeys, setShortcutKeys] = useState<ShortcutKey[]>([]);

  const shortcutExists = shortcutKeys.length > 0;

  useEffect(() => {
    getCommandShortcut("input-replacement").then((shortcut) => {
      setShortcutKeys(parseShortcutKeys(shortcut));
    });
  }, []);

  return (
    <div className="input-replacement">
      <Indented data-testid="input-replacement-description">
        <div className="fw-medium">Replace text where you type</div>
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

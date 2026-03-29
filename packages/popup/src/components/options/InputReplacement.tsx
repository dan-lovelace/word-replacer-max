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

  useEffect(() => {
    getCommandShortcut("input-replacement").then((shortcut) => {
      setShortcutKeys(parseShortcutKeys(shortcut));
    });
  }, []);

  return (
    <div className="input-replacement">
      <Indented data-testid="input-replacement-description">
        <div className="fw-medium">Input replacement hotkey</div>
        <div className="fs-sm">
          Replace text in fields you type into using a keyboard shortcut.
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 fs-sm">
          <div className="d-flex align-items-center gap-1">
            <span>Shortcut:</span>
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
          <TextButton onClick={openShortcutSettings}>
            Change in shortcuts
          </TextButton>
        </div>
      </Indented>
    </div>
  );
}

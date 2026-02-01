import { ChangeEvent, useState } from "preact/compat";

import {
  allColorModes,
  DEFAULT_COLOR_MODE,
  getSystemColorMode,
  updateDocumentColorMode,
} from "@worm/shared/src/color";
import { localStorageProvider } from "@worm/shared/src/storage";
import { LocalStorage, ColorMode as TColorMode } from "@worm/types/src/storage";

import { Indented } from "../../containers/Indented";
import { useConfig } from "../../store/Config";

export default function ColorMode() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    storage: {
      local: { colorMode: savedValue },
    },
  } = useConfig();

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.currentTarget.value as TColorMode;
    const newStorage: LocalStorage = {
      colorMode: newValue,
    };

    setIsLoading(true);

    await localStorageProvider.set(newStorage).finally(() => {
      updateDocumentColorMode(
        newValue === "system" ? getSystemColorMode() : newValue
      );

      setIsLoading(false);
    });
  };

  const selectValue = savedValue || DEFAULT_COLOR_MODE;

  return (
    <div data-testid="color-mode">
      <Indented data-testid="color-mode-description">
        <div className="form-check-label user-select-none fw-medium mb-1">
          Color mode
        </div>
        <select
          aria-label="Color mode"
          className="form-select w-auto"
          disabled={isLoading}
          value={selectValue}
          style={{ minWidth: 170 }}
          onChange={handleChange}
        >
          {allColorModes.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Indented>
    </div>
  );
}

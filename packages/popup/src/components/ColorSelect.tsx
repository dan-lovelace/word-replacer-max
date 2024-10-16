import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";
import { systemColors } from "@worm/shared/src/replace/lib/style";
import { SystemColor } from "@worm/types";

import Button from "./button/Button";

interface ColorSelectProps extends JSXInternal.HTMLAttributes<HTMLDivElement> {
  name: string;
  value?: string;
  onColorChange: (color: string) => void;
  onInputChange: (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => void;
}

export default function ColorSelect({
  className,
  name,
  value,
  onColorChange,
  onInputChange,
  ...rest
}: ColorSelectProps) {
  const [selectedColor, setSelectedColor] = useState(value);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleInputChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setSelectedColor(event.currentTarget.value);
    onInputChange(event);
  };

  return (
    <div
      className={cx("input-group", className)}
      data-testid="color-select"
      {...rest}
    >
      <div className="dropdown">
        <Button
          aria-expanded={false}
          className="btn btn-outline-primary rounded-end-0 h-100"
          data-bs-toggle="dropdown"
          data-testid="color-select-dropdown-button"
          id={`dropdown-button-${name}`}
        >
          <div
            className="border rounded"
            style={{
              backgroundColor: selectedColor,
              height: 20,
              width: 40,
            }}
          />
        </Button>
        <ul
          aria-labelledby={`dropdown-button-${name}`}
          className="dropdown-menu shadow"
          data-testid="color-select-dropdown-menu"
          style={{ minWidth: "unset" }}
        >
          {(Object.keys(systemColors) as SystemColor[]).map((color, index) => (
            <li key={index}>
              <Button
                className="dropdown-item text-center"
                data-testid="color-select-dropdown-menu-option"
                onClick={() => handleColorSelect(systemColors[color])}
              >
                <span
                  className="border rounded"
                  style={{
                    backgroundColor: systemColors[color],
                    height: 20,
                    width: 40,
                  }}
                />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <input
        className="form-control"
        data-testid="color-select-custom-input"
        placeholder="#000000"
        size={8}
        type="text"
        value={selectedColor}
        onChange={handleInputChange}
      />
    </div>
  );
}

import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { ReplacementStyle } from "@worm/types";

import cx from "../lib/classnames";

import Button from "./button/Button";

type ColorPickProps = {
  className?: boolean | string;
  name: string;
  value?: string;
  onColorChange: (color: string) => void;
  onInputChange: (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => void;
};

const systemColors = [
  "#FFFF00",
  "#ADD8E6",
  "#00FF00",
  "#FF6600",
  "#00FFFF",
  "#800080",
  "#DC143C",
  "#FFD700",
  "#FF1493",
  "#008080",
  "#ffffff",
  "#000000",
];

export default function ColorPick({
  className,
  name,
  value,
  onColorChange,
  onInputChange,
}: ColorPickProps) {
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
    <div className={cx("input-group", className)}>
      <input
        className="form-control"
        placeholder="#000000"
        size={8}
        type="text"
        value={selectedColor}
        onChange={handleInputChange}
      />
      <div className="dropdown">
        <Button
          aria-expanded={false}
          className="btn btn-outline-primary rounded-start-0 h-100"
          data-bs-toggle="dropdown"
          data-test-id="color-pick-dropdown-button"
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
          data-testid="color-pick-dropdown-menu"
          style={{ minWidth: "unset" }}
        >
          {systemColors.map((color, index) => (
            <li key={index}>
              <Button
                className="dropdown-item text-center"
                onClick={() => handleColorSelect(color)}
              >
                <span
                  className="border rounded"
                  style={{
                    backgroundColor: color,
                    height: 20,
                    width: 40,
                  }}
                />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

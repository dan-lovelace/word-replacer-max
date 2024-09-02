import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import cx from "../lib/classnames";

import Button from "./button/Button";

type ColorPickProps = {
  className?: boolean | string;
  name: string;
  value?: string;
  onChange: (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => void;
};

const systemColors = [
  "#0d6efd",
  "#1a8754",
  "#dc3545",
  "#fbc108",
  "#34caf0",
  "#ffffff",
  "#000000",
];

export default function ColorPick({
  className,
  name,
  value,
  onChange,
}: ColorPickProps) {
  const [selectedColor, setSelectedColor] = useState(value);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleInputChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setSelectedColor(event.currentTarget.value);
    onChange(event);
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
                    color: "#fff",
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

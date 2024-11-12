import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";
import { systemColors } from "@worm/shared/src/replace/lib/style";
import { SystemColor } from "@worm/types";

import DropdownButton from "./menu/DropdownButton";
import DropdownMenuContainer from "./menu/DropdownMenuContainer";
import MenuItem from "./menu/MenuItem";

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
      <DropdownButton
        className="d-flex"
        minWidth="unset"
        noFlip
        offset={2}
        placement="bottom-start"
        componentProps={{
          className: "btn btn-outline-primary rounded-end-0 h-100",
          children: (
            <div
              className="border rounded"
              style={{
                backgroundColor: selectedColor,
                height: 20,
                width: 40,
              }}
            />
          ),
          "data-testid": "color-select-dropdown-button",
        }}
        menuContent={
          <DropdownMenuContainer data-testid="color-select-dropdown-menu">
            {(Object.keys(systemColors) as SystemColor[]).map(
              (color, index) => (
                <MenuItem
                  className="text-center"
                  dense
                  key={color}
                  onClick={() => handleColorSelect(systemColors[color])}
                  data-testid="color-select-dropdown-menu-option"
                >
                  <span
                    className="border rounded"
                    style={{
                      backgroundColor: systemColors[color],
                      height: 20,
                      width: 40,
                    }}
                  />
                </MenuItem>
              )
            )}
          </DropdownMenuContainer>
        }
      />
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

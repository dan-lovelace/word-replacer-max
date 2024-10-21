import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";
import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { ReplacementStyle, ReplacementStyleOption } from "@worm/types";

import { Indented } from "../../containers/Indented";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import ColorSelect from "../ColorSelect";
import Slide from "../transition/Slide";

function ColorInput({
  label,
  name,
  option,
  replacementStyle,
  handleColorChange,
  handleInputChange,
  handleOptionChange,
}: {
  label: string;
  name: keyof Pick<NonNullable<ReplacementStyle>, "backgroundColor" | "color">;
  option: ReplacementStyleOption;
  replacementStyle?: ReplacementStyle;
  handleColorChange: <T extends keyof ReplacementStyle>(
    name: T
  ) => (color: string) => void;
  handleInputChange: <T extends keyof ReplacementStyle>(
    name: T
  ) => (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => void;
  handleOptionChange: <T extends ReplacementStyleOption>(
    option: T
  ) => (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => void;
}) {
  return (
    <div
      className="d-flex align-items-center"
      data-testid={`color-input-${name}`}
    >
      <div className="form-check">
        <label
          className="form-label mb-0 user-select-none"
          style={{ minWidth: 160 }}
        >
          <input
            className="form-check-input"
            data-testid={`color-input-checkbox-${name}`}
            name={option}
            type="checkbox"
            checked={replacementStyle?.options?.includes(option)}
            onChange={handleOptionChange(option)}
          />
          {label}
        </label>
      </div>
      <ColorSelect
        className={cx(
          !replacementStyle?.options?.includes(option) && "invisible"
        )}
        data-testid={`color-input-color-select-${name}`}
        name={name}
        value={replacementStyle?.[name] ?? DEFAULT_REPLACEMENT_STYLE?.[name]}
        onColorChange={handleColorChange(name)}
        onInputChange={handleInputChange(name)}
      />
    </div>
  );
}

function DecoratorInput({
  icon,
  option,
  replacementStyle,
  title,
  handleOptionChange,
}: {
  icon: string;
  option: ReplacementStyleOption;
  replacementStyle?: ReplacementStyle;
  title: string;
  handleOptionChange: <T extends ReplacementStyleOption>(
    option: T
  ) => (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => void;
}) {
  const id = `options-${option}-input`;

  return (
    <>
      <input
        checked={replacementStyle?.options?.includes(option)}
        className="btn-check form-control"
        id={id}
        name={option}
        type="checkbox"
        onChange={handleOptionChange(option)}
      />
      <label
        className="btn btn-outline-primary d-flex align-items-center"
        for={id}
        title={title}
      >
        <span className="material-icons-sharp fs-6">{icon}</span>
      </label>
    </>
  );
}

export default function ReplacementStyles() {
  const {
    storage: { replacementStyle },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const isActive = Boolean(replacementStyle?.active);

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newReplacementStyle = Object.assign({}, replacementStyle);

    newReplacementStyle.active = event.currentTarget.checked;

    storageSetByKeys({
      replacementStyle: newReplacementStyle,
    });

    showToast({
      message: language.rules.REFRESH_REQUIRED,
      options: { showRefresh: true },
    });
  };

  const handleColorChange =
    <T extends keyof ReplacementStyle>(name: T) =>
    (color: string) => {
      const newReplacementStyle = Object.assign({}, replacementStyle);

      newReplacementStyle[name] = color as ReplacementStyle[T];

      updateStorage(newReplacementStyle);
    };

  const handleInputChange =
    <T extends keyof ReplacementStyle>(name: T) =>
    (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
      const newReplacementStyle = Object.assign({}, replacementStyle);

      newReplacementStyle[name] = event.currentTarget
        .value as ReplacementStyle[T];

      updateStorage(newReplacementStyle);
    };

  const handleOptionChange =
    <T extends ReplacementStyleOption>(option: T) =>
    (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
      const newReplacementStyle = Object.assign({}, replacementStyle);

      if (event.currentTarget.checked) {
        newReplacementStyle.options?.push(option);
      } else {
        newReplacementStyle.options = newReplacementStyle.options?.filter(
          (o) => o !== option
        );
      }

      updateStorage(newReplacementStyle);
    };

  const updateStorage = (newReplacementStyle: ReplacementStyle) => {
    storageSetByKeys({
      replacementStyle: newReplacementStyle,
    });

    if (isActive) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }
  };

  return (
    <>
      <div
        className="form-check form-switch ps-0 d-flex align-items-center gap-2"
        data-testid="replacement-styles-input-wrapper"
      >
        <input
          checked={isActive}
          className="form-check-input m-0"
          data-testid="replacement-styles-toggle-button"
          id="highlight-enabled-checkbox"
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
        />
        <label
          className="form-check-label user-select-none fw-medium"
          for="highlight-enabled-checkbox"
        >
          Styled replacements
        </label>
      </div>
      <Slide isOpen={!isActive}>
        <Indented data-testid="replacement-styles-description">
          <p className="fs-sm">
            Apply styles like bold, underline, and background color to all
            replaced text. Styles may be turned off for individual replacements
            as needed.
          </p>
        </Indented>
      </Slide>
      <Slide isOpen={isActive}>
        <Indented className="py-1" data-testid="replacement-styles-options">
          <div
            aria-label="Text Decorators"
            className="btn-group my-2"
            data-testid="text-decorators"
            role="group"
          >
            <DecoratorInput
              icon="format_bold"
              option="bold"
              replacementStyle={replacementStyle}
              title="Bold"
              handleOptionChange={handleOptionChange}
            />
            <DecoratorInput
              icon="format_italic"
              option="italic"
              replacementStyle={replacementStyle}
              title="Italic"
              handleOptionChange={handleOptionChange}
            />
            <DecoratorInput
              icon="format_underline"
              option="underline"
              replacementStyle={replacementStyle}
              title="Underline"
              handleOptionChange={handleOptionChange}
            />
            <DecoratorInput
              icon="format_strikethrough"
              option="strikethrough"
              replacementStyle={replacementStyle}
              title="Strikethrough"
              handleOptionChange={handleOptionChange}
            />
          </div>

          <div
            className="container gx-0"
            data-testid="replacement-styles-color-inputs"
          >
            <div className="row mb-1">
              <div className="col-auto">
                <ColorInput
                  label="Background color"
                  name="backgroundColor"
                  option="backgroundColor"
                  replacementStyle={replacementStyle}
                  handleColorChange={handleColorChange}
                  handleInputChange={handleInputChange}
                  handleOptionChange={handleOptionChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-auto">
                <ColorInput
                  label="Text color"
                  name="color"
                  option="color"
                  replacementStyle={replacementStyle}
                  handleColorChange={handleColorChange}
                  handleInputChange={handleInputChange}
                  handleOptionChange={handleOptionChange}
                />
              </div>
            </div>
          </div>
        </Indented>
      </Slide>
    </>
  );
}

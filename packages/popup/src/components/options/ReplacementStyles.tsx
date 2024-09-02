import { JSXInternal } from "preact/src/jsx";

import { storageSetByKeys } from "@worm/shared";
import { DEFAULT_REPLACEMENT_STYLE } from "@worm/shared/src/replace/lib/style";
import { ReplacementStyle, ReplacementStyleOption } from "@worm/types";

import { useLanguage } from "../../lib/language";
import { PreactChildren } from "../../lib/types";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import ColorPick from "../ColorPick";
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
    <>
      <div className="form-check">
        <label
          className="form-label mb-0 user-select-none"
          style={{ minWidth: 160 }}
        >
          <input
            className="form-check-input"
            type="checkbox"
            checked={replacementStyle?.options?.includes(option)}
            onChange={handleOptionChange(option)}
          />
          {label}
        </label>
      </div>
      <ColorPick
        className={!replacementStyle?.options?.includes(option) && "invisible"}
        name={name}
        value={replacementStyle?.[name] ?? DEFAULT_REPLACEMENT_STYLE?.[name]}
        onColorChange={handleColorChange(name)}
        onInputChange={handleInputChange(name)}
      />
    </>
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

function IndentedContent({
  children,
  className,
}: {
  children: PreactChildren;
  className?: string;
}) {
  return (
    <div className={className} style={{ marginLeft: "2.5rem" }}>
      {children}
    </div>
  );
}

export default function ReplacementStyles() {
  const {
    storage: { replacementStyle },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

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

    if (replacementStyle?.active) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }
  };

  return (
    <>
      <div className="form-check form-switch ps-0 d-flex align-items-center gap-2">
        <input
          checked={replacementStyle?.active}
          className="form-check-input m-0"
          data-testid="active-toggle"
          id="highlight-enabled-checkbox"
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
        />
        <label
          className="form-check-label user-select-none"
          for="highlight-enabled-checkbox"
        >
          Styled replacements
        </label>
      </div>
      {!replacementStyle?.active && (
        <IndentedContent>
          <p className="fs-sm">
            Apply styles like bold, underline, and background color to all
            replaced text. Styles may be turned off for individual replacements
            as needed.
          </p>
        </IndentedContent>
      )}
      <Slide isOpen={replacementStyle?.active}>
        <IndentedContent className="py-1">
          <div
            aria-label="Text Decorators"
            className="btn-group my-2"
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

          <div className="container gx-0">
            <div className="row mb-1">
              <div className="col-auto d-flex gap-2 align-items-center">
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
              <div className="col-auto d-flex gap-2 align-items-center">
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
        </IndentedContent>
      </Slide>
    </>
  );
}

import { JSXInternal } from "preact/src/jsx";

import { DEFAULT_REPLACEMENT_STYLE, storageSetByKeys } from "@worm/shared";
import { ReplacementStyle, ReplacementStyleOption } from "@worm/types";

import cx from "../../lib/classnames";
import { PreactChildren } from "../../lib/types";
import { useConfig } from "../../store/Config";

import Slide from "../transition/Slide";

function ColorInput({
  label,
  name,
  option,
  replacementStyle,
  handleInputChange,
  handleOptionChange,
}: {
  label: string;
  name: keyof Pick<ReplacementStyle, "backgroundColor" | "color">;
  option: ReplacementStyleOption;
  replacementStyle?: ReplacementStyle;
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
      <label
        className={cx(
          "form-label mb-0",
          !replacementStyle?.options?.includes(option) && "invisible"
        )}
      >
        <input
          class="form-control form-control-color"
          name={name}
          title={`Select a ${label}`}
          type="color"
          value={replacementStyle?.[name] ?? DEFAULT_REPLACEMENT_STYLE[name]}
          onChange={handleInputChange(name)}
        />
      </label>
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

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newReplacementStyle = Object.assign({}, replacementStyle);

    newReplacementStyle.active = event.currentTarget.checked;

    storageSetByKeys({
      replacementStyle: newReplacementStyle,
    });
  };

  const handleInputChange =
    <T extends keyof ReplacementStyle>(name: T) =>
    (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
      const newReplacementStyle = Object.assign({}, replacementStyle);

      newReplacementStyle[name] = event.currentTarget
        .value as ReplacementStyle[T];

      storageSetByKeys({
        replacementStyle: newReplacementStyle,
      });
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

      storageSetByKeys({
        replacementStyle: newReplacementStyle,
      });
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
      <Slide isOpen={replacementStyle?.active}>
        <IndentedContent className="py-1">
          <p className="fs-sm">
            Replaced text will show up in your browser with the following
            styles. You may disable these settings for individual rules in the
            Rules list.
          </p>
          <div
            aria-label="Text Decorators"
            className="btn-group mb-2"
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

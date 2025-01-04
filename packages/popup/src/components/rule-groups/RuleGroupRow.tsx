import { ComponentProps } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { cx } from "@worm/shared";
import {
  storageRemoveByKeys,
  storageSetByKeys,
} from "@worm/shared/src/storage";
import { MatcherGroup } from "@worm/types/src/rules";

import { useLanguage } from "../../lib/language";

import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";
import ColorSelect from "../ColorSelect";

type RuleGroupRowProps = ComponentProps<"div"> & { data: MatcherGroup };

export default function RuleGroupRow({ data }: RuleGroupRowProps) {
  const { color, identifier, name } = data;

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState<
    Pick<MatcherGroup, "color" | "name">
  >({
    color,
    name,
  });

  const language = useLanguage();
  const confirmingDeleteRef = useRef<boolean>();
  confirmingDeleteRef.current = isConfirmingDelete;

  useEffect(() => {
    if (isConfirmingDelete) {
      document.documentElement.addEventListener("click", clickawayListener);
    } else {
      document.documentElement.removeEventListener("click", clickawayListener);
    }
  }, [isConfirmingDelete]);

  const clickawayListener = useCallback((event: MouseEvent) => {
    if (
      confirmingDeleteRef.current === true &&
      (event.target as HTMLElement)?.getAttribute("data-dismiss") !== "delete"
    ) {
      setIsConfirmingDelete(false);
    }
  }, []);

  const handleColorChange = (newColor: string) => {
    const newData: MatcherGroup = {
      ...data,
      color: newColor,
    };

    storageSetByKeys({
      [identifier]: newData,
    });
  };

  const handleColorInputChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newData: MatcherGroup = {
      ...data,
      color: event.currentTarget.value,
    };

    storageSetByKeys({
      [identifier]: newData,
    });
  };

  const handleDeleteClick = () => {
    const isConfirmable = Boolean(formData.name?.length);

    if (!isConfirmable || isConfirmingDelete) {
      document.documentElement.removeEventListener("click", clickawayListener);

      storageRemoveByKeys([identifier]);

      return;
    }

    setIsConfirmingDelete(true);
  };

  const handleFormChange = ({
    currentTarget: { name, value },
  }: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const newData: MatcherGroup = {
      ...data,
      ...formData,
    };

    storageSetByKeys({
      [identifier]: newData,
    });
  };

  return (
    <div data-testid="rule-group-row">
      <form
        className="d-flex align-items-center gap-2"
        onSubmit={handleFormSubmit}
      >
        <div className="flex-fill">
          <input
            autocomplete="off"
            className="form-control"
            name="name"
            placeholder={
              language.ruleGroups.NEW_GROUP_FORM_NAME_INPUT_PLACERHOLDER
            }
            type="text"
            value={formData.name}
            onBlur={handleFormSubmit}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <ColorSelect
            name="color"
            value={formData.color}
            onColorChange={handleColorChange}
            onInputChange={handleColorInputChange}
          />
        </div>
        <div className="d-flex">
          <IconButton
            className={cx(
              "px-2",
              isConfirmingDelete
                ? "btn btn-danger border-0"
                : ICON_BUTTON_BASE_CLASS
            )}
            icon={isConfirmingDelete ? "delete" : "close"}
            iconProps={{ size: "sm" }}
            onBlur={() => clickawayListener(new MouseEvent(""))}
            onClick={handleDeleteClick}
            style={{ minHeight: 40 }}
            data-dismiss="delete"
          />
        </div>
        <button className="btn btn-secondary visually-hidden" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}

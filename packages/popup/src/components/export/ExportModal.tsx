import { useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { Matcher } from "@worm/types/src/rules";

import { SelectedRule } from "../../lib/types";
import { useConfig } from "../../store/Config";

import Alert from "../Alerts";
import Button from "../button/Button";
import RuleRow from "../rules/RuleRow";

import ExportButton from "./ExportButton";

function refineMatchers(
  matchers?: Matcher[],
  selectedRules?: SelectedRule[]
): SelectedRule[] | undefined {
  return matchers?.map((matcher) => {
    let isSelected = true;
    const selectedIdx =
      selectedRules?.findIndex(
        (selected) => selected.identifier === matcher.identifier
      ) ?? -1;

    if (selectedRules && selectedRules[selectedIdx]) {
      isSelected = selectedRules[selectedIdx].isSelected;
    }

    return {
      ...matcher,
      isSelected,
    };
  });
}

export default function ExportModal() {
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>();

  const { matchers } = useConfig();
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedRules(refineMatchers(matchers, selectedRules));
  }, [matchers]);

  const handleSelectAllChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const input = event.target as HTMLInputElement;
    const { checked } = input;

    if (!selectedRules) return;

    const newSelected = [...selectedRules].map((rule) => ({
      ...rule,
      isSelected: checked,
    }));

    setSelectedRules(newSelected);
  };

  const handleSelectionChange =
    (identifier: string) =>
    (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
      const input = event.target as HTMLInputElement;
      const { checked } = input;
      const selectedIdx =
        selectedRules?.findIndex(
          (matcher) => matcher.identifier === identifier
        ) ?? -1;

      const newSelected = [...(selectedRules ?? [])];

      if (!selectedRules || selectedIdx < 0 || !newSelected[selectedIdx]) {
        return;
      }

      newSelected[selectedIdx].isSelected = checked;

      setSelectedRules(newSelected);
    };

  const stopExporting = () => {
    setSelectedRules(refineMatchers(matchers));

    if (hideModalButtonRef.current) {
      hideModalButtonRef.current.click();
    }
  };

  return (
    <div
      aria-hidden="true"
      aria-labelledby="export-modal-label"
      className="modal fade z-modal"
      data-testid="export-modal"
      id="export-modal"
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="export-modal-label">
              Choose rules to export
            </h1>
            <button
              aria-label="Close"
              className="btn-close"
              data-bs-dismiss="modal"
              ref={hideModalButtonRef}
              type="button"
            ></button>
          </div>
          <div className="modal-body">
            <div className="d-flex flex-column gap-2">
              {Boolean(matchers?.length) ? (
                <>
                  <div className="form-check">
                    <input
                      checked={selectedRules?.every((rule) => rule.isSelected)}
                      className="form-check-input"
                      id="select-all-checkbox"
                      type="checkbox"
                      onChange={handleSelectAllChange}
                    />
                    <label
                      className="form-check-label ms-2"
                      for="select-all-checkbox"
                    >
                      Select all
                    </label>
                  </div>
                  {matchers?.map((matcher) => (
                    <div key={matcher.identifier} className="d-flex gap-2">
                      <div className="form-check mt-1">
                        <input
                          checked={
                            selectedRules?.find(
                              (rule) => rule.identifier === matcher.identifier
                            )?.isSelected
                          }
                          className="form-check-input"
                          id={`matcher-${matcher.identifier}`}
                          type="checkbox"
                          onChange={handleSelectionChange(matcher.identifier)}
                        />
                        <label
                          className="form-check-label ms-2 visually-hidden"
                          for={`matcher-${matcher.identifier}`}
                        >
                          Include
                        </label>
                      </div>
                      <RuleRow disabled matcher={matcher} />
                    </div>
                  ))}
                </>
              ) : (
                <Alert title="No rules">
                  You don't have any rules to export.
                </Alert>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <Button
              data-bs-dismiss="modal"
              data-testid="export-modal-cancel-button"
            >
              Cancel
            </Button>
            <ExportButton
              selectedRules={selectedRules}
              stopExporting={stopExporting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

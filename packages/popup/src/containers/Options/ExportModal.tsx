import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import { logDebug, storageSetByKeys } from "@worm/shared";
import {
  ApiShareRequest,
  ApiShareResponse,
  Matcher,
  SchemaExport,
} from "@worm/types";
import { Dropdown } from "bootstrap";

import Alert from "../../components/Alerts";
import Button from "../../components/button/Button";
import RuleRow from "../../components/rules/RuleRow";
import ToastMessage from "../../components/ToastMessage";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

type SelectedRule = Matcher & {
  isSelected: boolean;
};

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

    if (selectedRules && selectedIdx > -1) {
      isSelected = selectedRules[selectedIdx].isSelected;
    }

    return {
      ...matcher,
      isSelected,
    };
  });
}

export default function ExportModal() {
  const {
    storage: { matchers, preferences },
  } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>();
  const selectedCount = useMemo(
    () => selectedRules?.filter((s) => s.isSelected).length ?? 0,
    [selectedRules]
  );
  const language = useLanguage();
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setSelectedRules(refineMatchers(matchers, selectedRules));
  }, [matchers]);

  const closeDropdown = () => {
    const target = document.getElementById("export-modal-dropdown-button");
    if (!target) return;

    const element = new Dropdown(target);
    element.hide();
  };

  const handleExportFile = () => {
    if (!selectedRules) return;

    closeDropdown();
    const selectedMatchers = matchers?.filter(
      (matcher) =>
        selectedRules.find(
          (selection) => selection.identifier === matcher.identifier
        )?.isSelected
    );
    const schemaExport: SchemaExport = {
      version: 1,
      data: {
        matchers: selectedMatchers,
      },
    };
    const href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(schemaExport, null, 2)
    )}`;
    const anchor = document.createElement("a");
    const filename = `WordReplacerMax_Rules_${new Date().getTime()}.json`;

    anchor.setAttribute("href", href);
    anchor.setAttribute("download", filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    stopExporting();
    showToast({
      children: (
        <div className="d-flex align-items-center gap-2">
          <i className="material-icons-sharp fs-6 text-success">check</i>
          <div>
            Your{" "}
            {(selectedMatchers?.length ?? 0) > 1 ? "rules were" : "rule was"}{" "}
            exported successfully as {filename}
          </div>
        </div>
      ),
    });
  };

  const handleExportLink = async () => {
    if (!selectedRules) return;

    const requestBody: ApiShareRequest = {
      matchers: selectedRules.filter((selectedRule) => selectedRule.isSelected),
    };

    closeDropdown();
    setIsLoading(true);
    const result = await fetch("https://api.wordreplacermax.com/share", {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
      .catch()
      .finally(() => {
        setIsLoading(false);
      });
    const json: ApiShareResponse = await result.json();

    if (!result.ok) {
      logDebug(json.error?.value);

      return showToast({
        children: (
          <ToastMessage
            message={json.error?.message ?? JSON.stringify(json)}
            severity="danger"
          />
        ),
      });
    }

    if (!json.data?.value?.url) {
      return showToast({
        children: (
          <ToastMessage
            message={language.options.GENERATE_SHARE_LINK_FAILED}
            severity="danger"
          />
        ),
      });
    }

    const newPreferences = Object.assign({}, preferences);
    const newExportLinks = [
      ...(newPreferences.exportLinks || []),
      {
        identifier: new Date().getTime(),
        url: json.data.value.url,
      },
    ];
    newPreferences.exportLinks = newExportLinks;

    storageSetByKeys({
      preferences: newPreferences,
    });

    stopExporting();
    showToast({
      children: (
        <ToastMessage message={String(json.data?.message)} severity="success" />
      ),
    });
  };

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

      if (!selectedRules || selectedIdx < 0) return;

      const newSelected = [...selectedRules];
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
                      <RuleRow disabled matcher={matcher} matchers={matchers} />
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
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              ref={hideModalButtonRef}
            >
              Cancel
            </button>
            <div className="dropdown">
              <Button
                aria-expanded={false}
                className="btn btn-primary"
                data-bs-toggle="dropdown"
                disabled={selectedCount === 0 || isLoading}
                id="export-modal-dropdown-button"
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    Exporting
                  </>
                ) : (
                  <>
                    Export{" "}
                    {selectedCount > 0
                      ? `${selectedCount} rule${selectedCount > 1 ? "s" : ""}`
                      : "selected"}
                  </>
                )}
              </Button>
              <ul className="dropdown-menu shadow">
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={handleExportLink}
                  >
                    <span className="d-flex align-items-center gap-3">
                      <span className="material-icons-sharp">link</span> Create
                      shareable link
                    </span>
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={handleExportFile}
                  >
                    <span className="d-flex align-items-center gap-3">
                      <span className="material-icons-sharp">download</span>{" "}
                      Download file locally
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

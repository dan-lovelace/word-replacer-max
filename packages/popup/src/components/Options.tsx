import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion, logDebug, storageSetByKeys } from "@worm/shared";
import type { Matcher, SchemaExport } from "@worm/types";

import FileInput from "./FileInput";
import HelpRedirect from "./HelpRedirect";
import RuleRow from "./RuleRow";

import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { Config } from "../store/Config";
import { useToast } from "../store/Toast";

type SelectedRule = Matcher & {
  isSelected: boolean;
};

function refineMatchers(
  matchers?: Matcher[],
  selectedRules?: SelectedRule[]
): SelectedRule[] | undefined {
  return matchers?.map((matcher) => {
    let isSelected = false;
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

export default function Options() {
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>();
  const {
    storage: { matchers },
  } = useContext(Config);
  const selectedCount = useMemo(
    () => selectedRules?.filter((s) => s.isSelected).length ?? 0,
    [selectedRules]
  );
  const { showToast } = useToast();
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedRules(refineMatchers(matchers, selectedRules));
  }, [matchers]);

  const handleExport = () => {
    if (!selectedRules) return;

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

  const handleImport = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const { files } = input;

    if (!files || files.length !== 1) {
      return;
    }

    const [file] = files;
    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const { result } = fileReader;

      try {
        const parsedJson = JSON.parse(String(result));
        const schema = getSchemaByVersion(parsedJson.version);
        const rulesExport = schema.parse(parsedJson);
        const {
          data: { matchers: importedMatchers },
        } = rulesExport;

        if (!importedMatchers || !Boolean(importedMatchers.length)) {
          return;
        }

        const enrichedMatchers: Matcher[] = importedMatchers.map(
          (matcher: Matcher) => ({
            ...matcher,
            identifier: uuidv4(),
            active: true,
          })
        );

        storageSetByKeys({
          matchers: [...(matchers ?? []), ...enrichedMatchers],
        });

        showToast({
          children: (
            <div className="d-flex align-items-center gap-2">
              <i className="material-icons-sharp fs-6 text-success">check</i>
              <div>
                {enrichedMatchers.length} rule
                {enrichedMatchers.length > 1 ? "s" : ""} imported successfully.
              </div>
            </div>
          ),
        });
      } catch (err) {
        logDebug("`handleImport`", err);
        logDebug("Received file contents", result);
        showToast({
          children: (
            <div className="d-flex align-items-center">
              It looks like your export file is corrupted. Please{" "}
              <HelpRedirect />.
            </div>
          ),
        });
      }
    };

    fileReader.readAsText(file);
    input.value = ""; // clear value to allow uploading same file more than once
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
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-4">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold">Export</div>
            <div className="fs-sm mb-2">
              Export your rules to a local file, enabling you to transfer and
              share them anywhere. You have the option to export all your rules
              or only a selected subset.
            </div>
            <button
              className="btn btn-secondary"
              data-bs-toggle="modal"
              data-bs-target="#export-modal"
              type="button"
            >
              <span className="d-flex align-items-center gap-1">
                <i className="material-icons-sharp fs-sm">upload</i>
                Export
              </span>
            </button>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold">Import</div>
            <div className="fs-sm mb-2">
              Easily add to your existing settings by importing new rules. This
              process is safe &ndash; it won't overwrite your current data, but
              simply adds the new rules to what you already have.
            </div>
            <div className="d-flex gap-2">
              <FileInput onChange={handleImport} />
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        aria-labelledby="export-modal-label"
        className="modal fade"
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
                        checked={selectedRules?.every(
                          (rule) => rule.isSelected
                        )}
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
                        <RuleRow
                          disabled
                          matcher={matcher}
                          matchers={matchers}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="alert alert-info" role="alert">
                    You don't have any rules to export
                  </div>
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
              <button
                className="btn btn-primary"
                disabled={selectedCount === 0}
                type="button"
                onClick={handleExport}
              >
                Export{" "}
                {selectedCount > 0
                  ? `${selectedCount} rule${selectedCount > 1 ? "s" : ""}`
                  : "selected"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion, logDebug, storageSetByKeys } from "@worm/shared";
import type { Matcher, SchemaExport } from "@worm/types";

import FileUpload from "./FileUpload";
import HelpRedirect from "./HelpRedirect";
import RuleRow from "./RuleRow";
import { Config } from "../store/Config";
import { useToast } from "../store/Toast";

type Selection = Matcher & {
  isSelected: boolean;
};

export default function Options() {
  const [selected, setSelected] = useState<Selection[]>();
  const {
    storage: { matchers },
  } = useContext(Config);
  const selectedCount = useMemo(
    () => selected?.filter((s) => s.isSelected).length ?? 0,
    [selected]
  );
  const { showToast } = useToast();
  const hideModalButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelected(
      matchers?.map((matcher) => {
        let isSelected = false;
        const selectedIdx =
          selected?.findIndex(
            (selected) => selected.identifier === matcher.identifier
          ) ?? -1;

        if (selected && selectedIdx > -1) {
          isSelected = selected[selectedIdx].isSelected;
        }

        return {
          ...matcher,
          isSelected,
        };
      })
    );
  }, matchers);

  const handleExport = () => {
    const schemaExport: SchemaExport = {
      version: 1,
      data: {
        matchers: matchers?.filter(
          (matcher) =>
            selected?.find(
              (selection) => selection.identifier === matcher.identifier
            )?.isSelected
        ),
      },
    };
    const href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(schemaExport, null, 2)
    )}`;
    const anchor = document.createElement("a");

    anchor.setAttribute("href", href);
    anchor.setAttribute(
      "download",
      `WordReplacerMax_Rules_${new Date().getTime()}.json`
    );
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    if (hideModalButtonRef.current) {
      hideModalButtonRef.current.click();
      setSelected(undefined);
    }
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

    if (!selected) return;

    const newSelected = [...selected].map((s) => ({
      ...s,
      isSelected: checked,
    }));

    setSelected(newSelected);
  };

  const handleSelectionChange =
    (identifier: string) =>
    (event: JSXInternal.TargetedEvent<HTMLInputElement, Event>) => {
      const input = event.target as HTMLInputElement;
      const { checked } = input;
      const selectedIdx =
        selected?.findIndex((matcher) => matcher.identifier === identifier) ??
        -1;

      if (!selected || selectedIdx < 0) return;

      const newSelected = [...selected];
      newSelected[selectedIdx].isSelected = checked;

      setSelected(newSelected);
    };

  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-4">
        <div className="row">
          <div className="col col-sm-8">
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
          <div className="col col-sm-8">
            <div className="fw-bold">Import</div>
            <div className="fs-sm mb-2">
              Easily add to your existing settings by importing new rules. This
              process is safe &ndash; it won't overwrite your current data, but
              simply adds the new rules to what you already have.
            </div>
            <div className="d-flex gap-2">
              <FileUpload onChange={handleImport} />
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        aria-labelledby="export-modalLabel"
        className="modal fade"
        id="export-modal"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="export-modalLabel">
                Choose rules to export
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column gap-2">
                {Boolean(matchers?.length) ? (
                  <>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="select-all-checkbox"
                        onChange={handleSelectAllChange}
                        checked={selected?.every((s) => s.isSelected)}
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
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id={`matcher-${matcher.identifier}`}
                            onChange={handleSelectionChange(matcher.identifier)}
                            checked={
                              selected?.find(
                                (s) => s.identifier === matcher.identifier
                              )?.isSelected
                            }
                          />
                          <label
                            className="form-check-label ms-2 visually-hidden"
                            for={`matcher-${matcher.identifier}`}
                          >
                            Include
                          </label>
                        </div>
                        <RuleRow
                          key={matcher.identifier}
                          matcher={matcher}
                          matchers={matchers}
                          isSelecting
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
                type="button"
                className="btn btn-primary"
                disabled={selectedCount === 0}
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

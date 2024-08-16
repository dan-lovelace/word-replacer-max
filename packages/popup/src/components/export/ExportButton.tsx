import { useMemo, useState } from "preact/hooks";

import { Dropdown } from "bootstrap";

import { logDebug, storageSetByKeys } from "@worm/shared";
import { ApiShareRequest, ApiShareResponse, SchemaExport } from "@worm/types";

import { useLanguage } from "../../lib/language";
import { SelectedRule } from "../../lib/types";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

import Button from "../button/Button";
import ToastMessage from "../ToastMessage";

type ExportButtonProps = {
  selectedRules?: SelectedRule[];
  stopExporting: () => void;
};

export default function ExportButton({
  selectedRules,
  stopExporting,
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    storage: { exportLinks, matchers },
  } = useConfig();
  const language = useLanguage();
  const selectedCount = useMemo(
    () => selectedRules?.filter((s) => s.isSelected).length ?? 0,
    [selectedRules]
  );
  const { showToast } = useToast();

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
        <ToastMessage
          message={
            <>
              Your{" "}
              {(selectedMatchers?.length ?? 0) > 1 ? "rules were" : "rule was"}{" "}
              exported successfully as {filename}
            </>
          }
          severity="success"
        />
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
    const result = await fetch(`${import.meta.env.VITE_API_ORIGIN}/share`, {
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

    const newExportLinks = [
      ...(exportLinks || []),
      {
        identifier: new Date().getTime(),
        url: json.data.value.url,
      },
    ];

    storageSetByKeys(
      {
        exportLinks: newExportLinks,
      },
      {
        onError: (message) => {
          showToast({
            children: <ToastMessage message={message} severity="danger" />,
          });
        },
        onSuccess: () => {
          stopExporting();
          showToast({
            children: (
              <ToastMessage
                message="Success! Your link is ready on the Options page."
                severity="success"
              />
            ),
          });
        },
      }
    );
  };

  return (
    <div className="dropdown">
      <Button
        aria-expanded={false}
        className="btn btn-primary"
        data-bs-toggle="dropdown"
        data-testid="export-modal-dropdown-button"
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
      <ul
        className="dropdown-menu shadow"
        data-testid="export-modal-dropdown-menu"
      >
        <li>
          <button
            className="dropdown-item"
            data-testid="export-modal-dropdown-menu-create-link-button"
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
            data-testid="export-modal-dropdown-menu-create-file-button"
            type="button"
            onClick={handleExportFile}
          >
            <span className="d-flex align-items-center gap-3">
              <span className="material-icons-sharp">download</span> Download
              file locally
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}

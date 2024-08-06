import { VNode } from "preact";
import { useContext, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { logDebug } from "@worm/shared";

import ExportLink from "./ExportLink";
import ExportModal from "./ExportModal";
import FileImport from "./FileImport";

import Button from "../../components/button/Button";
import ToastMessage from "../../components/ToastMessage";
import { COPY_CONTAINER_COL_CLASS } from "../../lib/classnames";
import importMatchers from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { Config } from "../../store/Config";
import { useToast } from "../../store/Toast";

function ColumnContent({ children }: { children: VNode | VNode[] }) {
  return <>{children}</>;
}

export default function Options() {
  const {
    storage: { matchers },
  } = useContext(Config);
  const language = useLanguage();
  const [importLink, setImportLink] = useState("");
  const [isImportingLink, setIsImportingLink] = useState(false);
  const { showToast } = useToast();

  const handleCancelImportClick = () => {
    setIsImportingLink(false);
  };

  const handleImportClick = () => {
    setIsImportingLink(true);
  };

  const handleImportLinkChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setImportLink(event.currentTarget.value);
  };

  const handleImportSubmit = async (
    event: JSXInternal.TargetedSubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      new URL(importLink);
    } catch (error) {
      return showToast({
        children: (
          <ToastMessage
            message={language.options.INVALID_IMPORT_LINK}
            severity="danger"
          />
        ),
      });
    }

    try {
      const response = await fetch(importLink);
      const json = await response.json();

      if (!response.ok) {
        const message = "Error fetching import link";

        logDebug(message, json);
        throw new Error(message);
      }

      importMatchers(json, matchers, {
        onError: (message) => {
          showToast({
            children: <ToastMessage message={message} severity="danger" />,
          });
        },
        onSuccess: () => {
          showToast({
            children: (
              <ToastMessage
                message="Link imported successfully"
                severity="success"
              />
            ),
          });
        },
      });
    } catch (error) {
      showToast({
        children: (
          <ToastMessage
            message={language.options.CORRUPTED_IMPORT_CONTENT}
            severity="danger"
          />
        ),
      });
    }
  };

  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-4">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Export</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Create a convenient shareable web link or export your rules to a
                local file. You can opt to export all your rules or only a
                chosen subset for easy sharing.
              </div>
              <Button
                data-bs-toggle="modal"
                data-bs-target="#export-modal"
                startIcon="upload"
                type="button"
              >
                Export
              </Button>
              <ExportLink />
            </ColumnContent>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Import</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Easily add to your existing settings by importing new rules.
                This process is safe &ndash; it won't overwrite your current
                data, but simply adds the new rules to what you already have.
              </div>
              {isImportingLink ? (
                <>
                  <form className="input-group" onSubmit={handleImportSubmit}>
                    <input
                      className="form-control"
                      placeholder="Paste your link here"
                      type="text"
                      value={importLink}
                      onChange={handleImportLinkChange}
                    />
                    <Button className="btn btn-outline-primary" type="submit">
                      Import
                    </Button>
                    <Button
                      className="btn btn-outline-primary"
                      onClick={handleCancelImportClick}
                    >
                      Cancel
                    </Button>
                  </form>
                </>
              ) : (
                <div className="d-flex gap-2">
                  <Button startIcon="link" onClick={handleImportClick}>
                    Import from link
                  </Button>
                  <FileImport />
                </div>
              )}
            </ColumnContent>
          </div>
        </div>
      </div>
      <ExportModal />
    </>
  );
}

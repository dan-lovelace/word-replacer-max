import { Dispatch, StateUpdater, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { logDebug } from "@web-extension/shared";

import { importMatchersJSON } from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Button from "../button/Button";
import Spinner from "../progress/Spinner";

type LinkImportProps = {
  setIsImportingLink: Dispatch<StateUpdater<boolean>>;
};

export default function LinkImport({ setIsImportingLink }: LinkImportProps) {
  const { matchers } = useConfig();
  const language = useLanguage();
  const [importLink, setImportLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleCancelImportClick = () => {
    setIsImportingLink(false);
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
        message: language.options.INVALID_IMPORT_LINK,
        options: { severity: "danger" },
      });
    }

    try {
      setIsLoading(true);
      const response = await fetch(importLink);
      const json = await response.json();

      if (!response.ok) {
        const message = "Error fetching import link";

        logDebug(message, json);
        throw new Error(message);
      }

      importMatchersJSON(json, matchers, {
        onSuccess: () => {
          setImportLink("");
          setIsImportingLink(false);

          showToast({
            message: language.options.LINK_IMPORT_SUCCESS,
            options: { severity: "success" },
          });
        },
      });
    } catch (error) {
      showToast({
        message: String(error),
        options: { severity: "danger" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="input-group"
      onSubmit={handleImportSubmit}
      data-testid="link-import-form"
    >
      <input
        autoFocus
        className="form-control"
        disabled={isLoading}
        placeholder="Paste your import link here"
        required
        type="url"
        value={importLink}
        onInput={handleImportLinkChange}
        data-testid="link-import-url-input"
      />
      <Button
        className="btn btn-outline-primary"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <>
            <Spinner className="me-1" size="sm" />
            Importing
          </>
        ) : (
          "Import"
        )}
      </Button>
      <Button
        className="btn btn-outline-primary"
        disabled={isLoading}
        onClick={handleCancelImportClick}
      >
        Cancel
      </Button>
    </form>
  );
}

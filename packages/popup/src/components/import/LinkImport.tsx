import { StateUpdater, useContext, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { logDebug } from "@worm/shared";

import Button from "../button/Button";
import ToastMessage from "../ToastMessage";

import importMatchers from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { Config } from "../../store/Config";
import { useToast } from "../../store/Toast";

type LinkImportProps = {
  setIsImportingLink: StateUpdater<boolean>;
};

export default function LinkImport({ setIsImportingLink }: LinkImportProps) {
  const {
    storage: { matchers },
  } = useContext(Config);
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
        children: (
          <ToastMessage
            message={language.options.INVALID_IMPORT_LINK}
            severity="danger"
          />
        ),
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

      importMatchers(json, matchers, {
        onError: (message) => {
          showToast({
            children: <ToastMessage message={message} severity="danger" />,
          });
        },
        onSuccess: () => {
          setImportLink("");
          setIsImportingLink(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="input-group" onSubmit={handleImportSubmit}>
      <input
        autoFocus
        className="form-control"
        disabled={isLoading}
        placeholder="Paste your import link here"
        required
        type="url"
        value={importLink}
        onInput={handleImportLinkChange}
      />
      <Button
        className="btn btn-outline-primary"
        disabled={isLoading}
        type="submit"
      >
        Import
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

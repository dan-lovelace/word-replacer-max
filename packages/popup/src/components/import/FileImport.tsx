import type { JSXInternal } from "preact/src/jsx";

import { Dispatch, StateUpdater, useState } from "preact/hooks";

import { getFileExtension, logDebug } from "@worm/shared";

import { importMatchersCSV, importMatchersJSON } from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import FileInput from "../FileInput";

type FileImportProps = {
  setFormError: Dispatch<StateUpdater<string | undefined>>;
};

export default function FileImport({ setFormError }: FileImportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { matchers } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const handleImport = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setFormError(undefined);

    const input = event.target as HTMLInputElement;
    const { files } = input;

    if (!files || files.length > 1 || !files[0]) {
      return;
    }

    const file = files[0];
    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const { result } = fileReader;
      const extension = getFileExtension(file);

      setIsLoading(true);

      if (extension === "csv") {
        return importMatchersCSV(result, matchers, {
          onError(message) {
            showToast({
              message,
              options: { severity: "danger" },
            });
          },
          onSuccess() {
            showToast({
              message: language.options.FILE_IMPORT_SUCCESS,
              options: { severity: "success" },
            });
          },
        }).finally(() => {
          setIsLoading(false);
        });
      }

      try {
        const parsedJson = JSON.parse(String(result));

        importMatchersJSON(parsedJson, matchers, {
          onError: (message) => {
            setFormError(message);
          },
          onSuccess: () => {
            showToast({
              message: language.options.FILE_IMPORT_SUCCESS,
              options: { severity: "success" },
            });
          },
        });
      } catch (error) {
        logDebug("`handleImport`", error);
        logDebug("Received file contents", result);

        const message =
          error instanceof Error
            ? error.message
            : language.options.SYSTEM_ERROR_MESSAGE;

        setFormError(message);

        showToast({
          message: language.options.CORRUPTED_IMPORT_CONTENT,
          options: { severity: "danger", showContactSupport: true },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fileReader.readAsText(file);
    input.value = ""; // clear value to allow uploading same file more than once
  };

  return <FileInput isLoading={isLoading} onChange={handleImport} />;
}

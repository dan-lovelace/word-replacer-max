import type { JSXInternal } from "preact/src/jsx";

import { logDebug } from "@worm/shared";

import importMatchers from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import FileInput from "../FileInput";

export default function FileImport() {
  const {
    storage: {
      sync: { matchers },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  const handleImport = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const { files } = input;

    if (!files || files.length > 1 || !files[0]) {
      return;
    }

    const file = files[0];
    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const { result } = fileReader;

      try {
        const parsedJson = JSON.parse(String(result));

        importMatchers(parsedJson, matchers, {
          onError: (message) => {
            showToast({
              message,
              options: { severity: "danger" },
            });
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

        showToast({
          message: language.options.CORRUPTED_IMPORT_CONTENT,
          options: { severity: "danger", showContactSupport: true },
        });
      }
    };

    fileReader.readAsText(file);
    input.value = ""; // clear value to allow uploading same file more than once
  };

  return <FileInput onChange={handleImport} />;
}

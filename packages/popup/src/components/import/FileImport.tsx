import type { JSXInternal } from "preact/src/jsx";

import { logDebug } from "@worm/shared";

import FileInput from "../FileInput";
import ToastMessage from "../ToastMessage";

import importMatchers from "../../lib/import";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

export default function FileImport() {
  const {
    storage: { matchers },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

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

        importMatchers(parsedJson, matchers, {
          onError: (message) => {
            showToast({
              children: <ToastMessage message={message} severity="danger" />,
            });
          },
          onSuccess: () => {
            showToast({
              children: (
                <ToastMessage
                  message="Rules from file imported successfully"
                  severity="success"
                />
              ),
            });
          },
        });
      } catch (error) {
        logDebug("`handleImport`", error);
        logDebug("Received file contents", result);

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

    fileReader.readAsText(file);
    input.value = ""; // clear value to allow uploading same file more than once
  };

  return <FileInput onChange={handleImport} />;
}

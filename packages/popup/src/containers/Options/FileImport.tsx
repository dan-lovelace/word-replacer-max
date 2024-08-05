import { useContext } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import { v4 as uuidv4 } from "uuid";

import { getSchemaByVersion, logDebug, storageSetByKeys } from "@worm/shared";
import type { Matcher } from "@worm/types";

import FileInput from "../../components/FileInput";
import HelpRedirect from "../../components/HelpRedirect";
import ToastMessage from "../../components/ToastMessage";
import { Config } from "../../store/Config";
import { useToast } from "../../store/Toast";

export default function FileImport() {
  const {
    storage: { matchers },
  } = useContext(Config);
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

        storageSetByKeys(
          {
            matchers: [...(matchers ?? []), ...enrichedMatchers],
          },
          {
            onError: (message) => {
              showToast({
                children: <ToastMessage message={message} severity="danger" />,
              });
            },
            onSuccess: () => {
              showToast({
                children: (
                  <ToastMessage
                    message={
                      <>
                        {enrichedMatchers.length} rule
                        {enrichedMatchers.length > 1 ? "s" : ""} imported
                        successfully.
                      </>
                    }
                    severity="success"
                  />
                ),
              });
            },
          }
        );
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

  return <FileInput onChange={handleImport} />;
}

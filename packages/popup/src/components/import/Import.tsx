import { useState } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared/src/storage";
import { ImportEffect } from "@worm/types/src/popup";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import Alert from "../Alerts";
import Button from "../button/Button";

import FileImport from "./FileImport";
import LinkImport from "./LinkImport";

export default function Import() {
  const [formError, setFormError] = useState<string>();
  const [isImportingLink, setIsImportingLink] = useState(false);

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();

  const handleEffectChange = (effect: ImportEffect) => () => {
    const newPreferences = Object.assign({}, preferences);

    newPreferences.importEffect = effect;

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const handleImportClick = () => {
    setIsImportingLink(true);
  };

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-2">
        <div>Effect:</div>
        <div className="d-flex gap-3">
          <div className="form-check m-0">
            <input
              checked={preferences?.importEffect === "add"}
              className="form-check-input"
              id="addRadio"
              name="add"
              type="radio"
              onChange={handleEffectChange("add")}
            />
            <label
              className="form-check-label"
              for="addRadio"
              data-testid="add-radio-button"
            >
              Add
            </label>
          </div>
          <div className="form-check m-0">
            <input
              checked={preferences?.importEffect === "overwrite"}
              className="form-check-input"
              id="overwriteRadio"
              name="overwrite"
              type="radio"
              onChange={handleEffectChange("overwrite")}
            />
            <label
              className="form-check-label"
              for="overwriteRadio"
              data-testid="overwrite-radio-button"
            >
              Overwrite
            </label>
          </div>
        </div>
      </div>
      {isImportingLink ? (
        <LinkImport setIsImportingLink={setIsImportingLink} />
      ) : (
        <>
          <div className="d-flex gap-2">
            <Button
              startIcon="link"
              onClick={handleImportClick}
              data-testid="link-import-button"
            >
              Import from link
            </Button>
            <FileImport setFormError={setFormError} />
          </div>
          {formError && (
            <Alert
              className="mt-2"
              severity="danger"
              title={language.options.IMPORT_ALERT_TITLE}
            >
              <p>{language.options.IMPORT_ALERT_BODY}</p>
              {formError}
            </Alert>
          )}
        </>
      )}
    </>
  );
}

import { useState } from "preact/hooks";

import { useLanguage } from "../../lib/language";

import Alert from "../Alerts";
import Button from "../button/Button";

import FileImport from "./FileImport";
import LinkImport from "./LinkImport";

export default function Import() {
  const [formError, setFormError] = useState<string>();
  const [isImportingLink, setIsImportingLink] = useState(false);

  const language = useLanguage();

  const handleImportClick = () => {
    setIsImportingLink(true);
  };

  return isImportingLink ? (
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
  );
}

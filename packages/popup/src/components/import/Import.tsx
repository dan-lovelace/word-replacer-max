import { useState } from "preact/hooks";

import Button from "../button/Button";

import FileImport from "./FileImport";
import LinkImport from "./LinkImport";

export default function Import() {
  const [isImportingLink, setIsImportingLink] = useState(false);

  const handleImportClick = () => {
    setIsImportingLink(true);
  };

  return isImportingLink ? (
    <LinkImport setIsImportingLink={setIsImportingLink} />
  ) : (
    <div className="d-flex gap-2">
      <Button
        startIcon="link"
        onClick={handleImportClick}
        data-testid="link-import-button"
      >
        Import from link
      </Button>
      <FileImport />
    </div>
  );
}

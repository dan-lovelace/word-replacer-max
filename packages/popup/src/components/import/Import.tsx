import { useState } from "preact/hooks";

import FileImport from "./FileImport";
import LinkImport from "./LinkImport";

import Button from "../button/Button";

export default function Import() {
  const [isImportingLink, setIsImportingLink] = useState(false);

  const handleImportClick = () => {
    setIsImportingLink(true);
  };

  return isImportingLink ? (
    <LinkImport setIsImportingLink={setIsImportingLink} />
  ) : (
    <div className="d-flex gap-2">
      <Button startIcon="link" onClick={handleImportClick}>
        Import from link
      </Button>
      <FileImport />
    </div>
  );
}

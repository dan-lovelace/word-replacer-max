import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";

import Button from "../../components/button/Button";
import ToastMessage from "../../components/ToastMessage";
import {
  copyToClipboard,
  getClipboardCopyPermission,
} from "../../lib/clipboard";
import { Config } from "../../store/Config";
import { useToast } from "../../store/Toast";

export default function ExportLink() {
  const [isClipboardCopyAllowed, setIsClipboardCopyAllowed] = useState(false);
  const {
    storage: { preferences },
  } = useContext(Config);
  const { showToast } = useToast();

  const exportLink = useMemo(
    () =>
      Boolean(preferences?.exportLink.url)
        ? preferences?.exportLink
        : undefined,
    [preferences]
  );

  const exportLinkTimestamp = useMemo(() => {
    if (!exportLink?.updatedAt) {
      return undefined;
    }

    try {
      const date = new Date(parseInt(exportLink.updatedAt));

      return date.toLocaleDateString();
    } catch (error) {}

    return undefined;
  }, [exportLink]);

  useEffect(() => {
    async function initCopyPermission() {
      setIsClipboardCopyAllowed(await getClipboardCopyPermission());
    }

    initCopyPermission();
  }, []);

  const handleClearExport = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.exportLink = {
      updatedAt: new Date().getTime().toString(),
      url: "",
    };

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const handleCopyClick = () => {
    if (!exportLink || !exportLink.url) return;

    const result = copyToClipboard(exportLink.url);
    const children = result ? (
      <ToastMessage message="Copied to clipboard" severity="success" />
    ) : (
      <ToastMessage message="Unable to copy to clipboard" severity="danger" />
    );

    showToast({ children });
  };

  return (
    <>
      {exportLink?.url && (
        <div className="mt-2">
          {exportLinkTimestamp && (
            <label
              className="fs-sm fw-medium text-secondary"
              for="export-link-input"
            >
              Link for latest export on {exportLinkTimestamp}
            </label>
          )}
          <div className="input-group">
            <input
              aria-describedby="copy-html-url-button"
              aria-label="link to html page"
              className="form-control"
              id="export-link-input"
              readOnly
              type="text"
              value={exportLink.url}
            />
            {isClipboardCopyAllowed && (
              <Button
                className="btn btn-outline-primary"
                onClick={handleCopyClick}
              >
                Copy
              </Button>
            )}
            <a
              className="btn btn-outline-primary"
              href={exportLink.url}
              target="_blank"
            >
              View
            </a>
            <Button
              className="btn btn-outline-primary"
              onClick={handleClearExport}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

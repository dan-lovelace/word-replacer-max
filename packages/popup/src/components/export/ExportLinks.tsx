import { useEffect, useMemo, useState } from "preact/hooks";

import { formatUnixTimestamp, storageSetByKeys } from "@worm/shared";
import { ExportLink as ExportLinkType } from "@worm/types";

import Button from "../../components/button/Button";
import ToastMessage from "../../components/ToastMessage";
import Tooltip from "../../components/Tooltip";
import { copyToClipboard, canWriteToClipboard } from "../../lib/clipboard";
import { useConfig } from "../../store/Config";
import { useToast } from "../../store/Toast";

export default function ExportLink() {
  const [isClipboardCopyAllowed, setIsClipboardCopyAllowed] = useState(false);
  const {
    storage: { preferences },
  } = useConfig();
  const { showToast } = useToast();

  const exportLinks = useMemo(
    () =>
      Boolean(preferences?.exportLinks?.length)
        ? preferences?.exportLinks
        : undefined,
    [preferences]
  );

  useEffect(() => {
    async function initCopyPermission() {
      setIsClipboardCopyAllowed(await canWriteToClipboard());
    }

    initCopyPermission();
  }, []);

  const handleClearExport =
    (identifier: ExportLinkType["identifier"]) => () => {
      const exportIdx =
        exportLinks?.findIndex((link) => link.identifier === identifier) ?? -1;
      const newPreferences = Object.assign({}, preferences);

      if (exportIdx < 0 || !newPreferences?.exportLinks) return;

      newPreferences.exportLinks = newPreferences.exportLinks.filter(
        (link) => link.identifier !== identifier
      );

      storageSetByKeys({
        preferences: newPreferences,
      });
    };

  const handleCopyClick =
    (identifier: ExportLinkType["identifier"]) => async () => {
      const exportLink = exportLinks?.find(
        (link) => link.identifier === identifier
      );

      if (!exportLink || !exportLink.url) return;

      const result = await copyToClipboard(exportLink.url);
      const children = result ? (
        <ToastMessage message="Copied to clipboard" severity="success" />
      ) : (
        <ToastMessage message="Unable to copy to clipboard" severity="danger" />
      );

      showToast({ children });
    };

  if (!exportLinks || !Boolean(exportLinks.length)) {
    return <></>;
  }

  return (
    <div className="mt-2">
      <div className="fs-sm text-secondary fw-medium">Shareable links</div>
      <div className="d-flex flex-column gap-2">
        {exportLinks.map(({ identifier, url }) => (
          <div className="row" key={identifier}>
            <div className="col d-flex align-items-center gap-2">
              <div className="input-group">
                <input
                  aria-describedby="copy-html-url-button"
                  aria-label="link to html page"
                  className="form-control"
                  id="export-link-input"
                  readOnly
                  type="text"
                  value={url}
                />
                {isClipboardCopyAllowed && (
                  <Button
                    className="btn btn-outline-primary"
                    onClick={handleCopyClick(identifier)}
                  >
                    Copy
                  </Button>
                )}
                <a
                  className="btn btn-outline-primary"
                  href={url}
                  target="_blank"
                >
                  View
                </a>
                <Button
                  className="btn btn-outline-primary"
                  onClick={handleClearExport(identifier)}
                >
                  Clear
                </Button>
              </div>
              <Tooltip title={`Created ${formatUnixTimestamp(identifier)}`}>
                <span className="material-icons-sharp text-body-tertiary">
                  calendar_month
                </span>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

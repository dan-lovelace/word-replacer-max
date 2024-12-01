import { useEffect, useState } from "preact/hooks";

import { formatUnixTimestamp } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { ExportLink as ExportLinkType } from "@worm/types/src/popup";

import Button from "../../components/button/Button";
import Tooltip from "../../components/Tooltip";
import { canWriteToClipboard, copyToClipboard } from "../../lib/clipboard";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import MaterialIcon from "../icon/MaterialIcon";

export default function ExportLink() {
  const [isClipboardCopyAllowed, setIsClipboardCopyAllowed] = useState(false);
  const {
    storage: {
      sync: { exportLinks },
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    async function initCopyPermission() {
      setIsClipboardCopyAllowed(await canWriteToClipboard());
    }

    initCopyPermission();
  }, []);

  const handleClearExport =
    (identifier: ExportLinkType["identifier"]) => () => {
      const newExportLinks = [...(exportLinks ?? [])].filter(
        (link) => link.identifier !== identifier
      );

      storageSetByKeys({
        exportLinks: newExportLinks,
      });
    };

  const handleCopyClick =
    (identifier: ExportLinkType["identifier"]) => async () => {
      const exportLink = exportLinks?.find(
        (link) => link.identifier === identifier
      );

      if (!exportLink || !exportLink.url) return;

      const result = await copyToClipboard(exportLink.url);

      showToast({
        message:
          language.options[
            result
              ? "SHAREABLE_LINK_CLIPBOARD_COPY_SUCCESS"
              : "SHAREABLE_LINK_CLIPBOARD_COPY_ERROR"
          ],
        options: { severity: result ? "success" : "danger" },
      });
    };

  if (!exportLinks || !Boolean(exportLinks.length)) {
    return <></>;
  }

  return (
    <div className="mt-2" data-testid="export-links">
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
                <Button
                  className="btn btn-outline-primary"
                  disabled={!isClipboardCopyAllowed}
                  onClick={handleCopyClick(identifier)}
                >
                  Copy
                </Button>
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
                <MaterialIcon
                  className="text-body-tertiary"
                  name="calendar_month"
                  size="lg"
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { VNode } from "preact";

import ExportLink from "./ExportLink";
import ExportModal from "./ExportModal";
import FileImport from "./FileImport";

import Button from "../../components/button/Button";
import { COPY_CONTAINER_COL_CLASS } from "../../lib/classnames";

function ColumnContent({ children }: { children: VNode | VNode[] }) {
  return <>{children}</>;
}

export default function Options() {
  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-4">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Export</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Create a convenient shareable web link or export your rules to a
                local file. You can opt to export all your rules or only a
                chosen subset for easy sharing.
              </div>
              <Button
                data-bs-toggle="modal"
                data-bs-target="#export-modal"
                startIcon="upload"
                type="button"
              >
                Export
              </Button>
              <ExportLink />
            </ColumnContent>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Import</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Easily add to your existing settings by importing new rules.
                This process is safe &ndash; it won't overwrite your current
                data, but simply adds the new rules to what you already have.
              </div>
              <div className="d-flex gap-2">
                <Button startIcon="link">Import from link</Button>
                <FileImport />
              </div>
            </ColumnContent>
          </div>
        </div>
      </div>
      <ExportModal />
    </>
  );
}

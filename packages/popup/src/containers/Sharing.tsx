import Button from "../components/button/Button";
import ExportLinks from "../components/export/ExportLinks";
import ExportModal from "../components/export/ExportModal";
import Import from "../components/import/Import";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { PreactChildren } from "../lib/types";

function ColumnContent({ children }: { children: PreactChildren }) {
  return <>{children}</>;
}

export default function Sharing() {
  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-3 pt-2">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Rules Export</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Create a shareable web link or export rules to a file. Choose to
                export all rules or a selected subset. Please note that shared
                web links are public with no privacy guarantee.
              </div>
              <Button
                data-bs-toggle="modal"
                data-bs-target="#export-modal"
                data-testid="export-button"
                startIcon="upload"
              >
                Export
              </Button>
              <ExportLinks />
            </ColumnContent>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Rules Import</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Import new rules from a file or link. You choose to either add
                to your current settings or replace them entirely.
              </div>
              <Import />
            </ColumnContent>
          </div>
        </div>
      </div>
      <ExportModal />
    </>
  );
}

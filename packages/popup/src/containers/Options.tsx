import Button from "../components/button/Button";
import ExportLinks from "../components/export/ExportLinks";
import ExportModal from "../components/export/ExportModal";
import Import from "../components/import/Import";
import ReplacementStyles from "../components/options/ReplacementStyles";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { PreactChildren } from "../lib/types";

function ColumnContent({ children }: { children: PreactChildren }) {
  return <>{children}</>;
}

export default function Options() {
  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-4">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">General</div>
            <ColumnContent>
              <ReplacementStyles />
            </ColumnContent>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">Export</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Create a convenient shareable web link or export your rules to a
                local file. You can choose to export all your rules or only a
                chosen subset. Please note that shareable links are public, and
                there is no guarantee of privacy.
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
            <div className="fw-bold fs-5">Import</div>
            <ColumnContent>
              <div className="fs-sm mb-2">
                Easily add to your existing settings by importing new rules,
                either from a file or a link. This process is safe &ndash; it
                won't overwrite your current data, but simply adds the new rules
                to what you already have.
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

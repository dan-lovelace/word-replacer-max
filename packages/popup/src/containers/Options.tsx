import Button from "../components/button/Button";
import ExportLinks from "../components/export/ExportLinks";
import ExportModal from "../components/export/ExportModal";
import Import from "../components/import/Import";
import ReplacementStyles from "../components/options/ReplacementStyles";
import ReplacementSuggestions from "../components/options/ReplacementSuggestions";
import RuleGroups from "../components/options/RuleGroups";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { PreactChildren } from "../lib/types";

function ColumnContent({ children }: { children: PreactChildren }) {
  return <>{children}</>;
}

export default function Options() {
  return (
    <>
      <div className="container-fluid gx-0 d-flex flex-column gap-3 pt-2">
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fw-bold fs-5">General Settings</div>
            <ColumnContent>
              <div className="d-flex flex-column gap-2">
                <ReplacementStyles />
                <RuleGroups />
                <ReplacementSuggestions />
              </div>
            </ColumnContent>
          </div>
        </div>
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
                Import new rules from a file or link to add to your current
                settings. This will add to, not overwrite, your existing rules.
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

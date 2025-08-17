import RenderRate from "../components/options/RenderRate";
import ReplacementStyles from "../components/options/ReplacementStyles";
import ReplacementSuggestions from "../components/options/ReplacementSuggestions";
import RuleGroups from "../components/options/RuleGroups";
import RuleSync from "../components/options/RuleSync";
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
            <div className="fw-bold fs-5">Advanced Settings</div>
            <ColumnContent>
              <div className="d-flex flex-column gap-2">
                <RuleSync />
                <RenderRate />
              </div>
            </ColumnContent>
          </div>
        </div>
      </div>
    </>
  );
}

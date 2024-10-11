import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";

export function EmailButton({ text = "contact@logicnow.io" }) {
  return (
    <a
      href="mailto:contact@logicnow.io?subject=Help%20with%20Word%20Replacer%20Max"
      target="_blank"
    >
      {text}
    </a>
  );
}

export default function Support() {
  return (
    <div className="container-fluid gx-0 d-flex flex-column gap-2">
      <div className="row fs-sm">
        <div className={COPY_CONTAINER_COL_CLASS}>
          <div className="fs-5 fw-bold">Get Help</div>
          <p>
            Having trouble with Word Replacer Max? We're here to help! For the
            quickest support, please contact us via email or log an issue on
            GitHub, as extension store tickets may be delayed
            <sup>
              <a
                href="https://groups.google.com/a/chromium.org/g/chromium-extensions/c/V5As4co1mmI"
                target="_blank"
              >
                [1]
              </a>
            </sup>
            .
          </p>
          <p>
            When reaching out, please provide:
            <ol>
              <li>The website URL where you're experiencing issues</li>
              <li>
                Your exported rulesets (these can be exported from the Options
                page)
              </li>
            </ol>
          </p>
        </div>
      </div>
      <div className="row">
        <div className={COPY_CONTAINER_COL_CLASS}>
          <div className="fw-bold">Email</div>
          <EmailButton />
        </div>
      </div>
      <div className="row">
        <div className={COPY_CONTAINER_COL_CLASS}>
          <div className="fw-bold">GitHub</div>
          <a
            href="https://github.com/dan-lovelace/word-replacer-max/issues/new"
            target="_blank"
          >
            Create a new issue
          </a>
        </div>
      </div>
    </div>
  );
}

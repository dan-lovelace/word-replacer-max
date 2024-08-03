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
          <div className="fs-5 fw-bold mb-1">Contact Us</div>
          <p>
            Having trouble with Word Replacer Max? We're here to help! Our goal
            is to provide you with the best possible experience and promptly
            address any issues you encounter. The extension is actively
            maintained, and a fix for your issue is likely just a day or two
            away.
          </p>
          <p>
            Please note that support tickets submitted through the extension
            store might not reach our engineers in a timely manner
            <a
              href="https://groups.google.com/a/chromium.org/g/chromium-extensions/c/V5As4co1mmI"
              target="_blank"
            >
              [1]
            </a>
            . The quickest way to get your issues resolved is by contacting us
            via email or logging an issue on GitHub.
          </p>
          <p>
            When reaching out, please provide as much context as possible:
            <ol>
              <li>The website URL where you're trying to replace text</li>
              <li>
                Your rulesets (these can be exported from the Options page and
                attached as a file)
              </li>
              <li>
                A detailed description of what you expect to happen versus what
                is actually happening
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

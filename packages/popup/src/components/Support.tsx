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
        <div className="col col-sm-8">
          <p>
            Thanks for using Word Replacer Max. We strive to provide the best
            possible experience and want to help with any problems you run into.
            Support tickets opened in the extension store do not always reach
            our engineers in a timely manner
            <a
              href="https://groups.google.com/a/chromium.org/g/chromium-extensions/c/V5As4co1mmI"
              target="_blank"
            >
              [1]
            </a>
            , so reaching out via email or GitHub is the best way to get things
            resolved quickly.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col col-sm-8">
          <div className="fw-bold">Email</div>
          <EmailButton />
        </div>
      </div>
      <div className="row">
        <div className="col col-sm-8">
          <div className="fw-bold">GitHub</div>
          <a
            href="https://github.com/dan-lovelace/word-replacer-max/issues/new"
            target="_blank"
          >
            Create new issue
          </a>
        </div>
      </div>
    </div>
  );
}

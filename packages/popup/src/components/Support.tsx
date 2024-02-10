export default function Support() {
  return (
    <div className="container-fluid gx-0 d-flex flex-column gap-2">
      <div className="row fs-sm">
        <div className="col col-lg-6">
          Thanks for using Word Replacer Max. We strive to provide the best
          possible experience and want to help with any problems you run into.
          Support tickets opened in the extension store do not always reach our
          engineers in a timely manner
          <a href="https://groups.google.com/a/chromium.org/g/chromium-extensions/c/V5As4co1mmI">
            [1]
          </a>
          , so reaching out via email or GitHub is the best way to get things
          resolved quickly.
        </div>
      </div>
      <div className="row">
        <div className="col col-lg-6">
          <div className="fw-bold">Email</div>
          <a href="mailto:contact@logicnow.io?subject='Help with Word Replacer Max'">
            contact@logicnow.io
          </a>
        </div>
      </div>
      <div className="row">
        <div className="col col-lg-6">
          <div className="fw-bold">GitHub</div>
          <a href="https://github.com/dan-lovelace/word-replacer-max/issues/new">
            Create new issue
          </a>
        </div>
      </div>
    </div>
  );
}

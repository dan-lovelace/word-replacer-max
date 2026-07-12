import {
  CONTACT_SUPPORT_EMAIL,
  MAILTO_CONTACT_SUPPORT_URL,
  SUBMIT_NEW_TICKET_URL,
} from "@worm/shared/src/support";

import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";

function EmailGitHub() {
  return (
    <div data-testid="email-github-container">
      <div className="mb-2">
        <div className="fw-medium">Email</div>
        <div>
          <a
            href={`${MAILTO_CONTACT_SUPPORT_URL}&body=Website%20URL%3A%20%0A%0AExpected%20Behavior%3A%20%0A%0AActual%20Behavior%3A%20%0A%0AExported%20Rules%3A%20Please%20export%20the%20affected%20rules%20(as%20a%20link%20or%20file)%20and%20attach%20it%20to%20this%20message%0A%0AMore%20Details%3A%20Feel%20free%20to%20include%20any%20other%20relevant%20information`}
            target="_blank"
          >
            {CONTACT_SUPPORT_EMAIL}
          </a>
        </div>
      </div>
      <div>
        <div className="fw-medium">GitHub</div>
        <div>
          <a href={SUBMIT_NEW_TICKET_URL} target="_blank">
            Create a new issue
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Support() {
  return (
    <div className="container-fluid gx-0 pt-2" data-testid="support-container">
      <div
        className="d-flex flex-column gap-3"
        data-testid="logged-out-contact-options"
      >
        <div className="row fs-sm">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <div className="fs-5 fw-bold">Get Help</div>
            <p>
              Having trouble with Word Replacer Max? We're here to help! Get
              support by sending us an email or opening an issue on GitHub.
            </p>
            <p>When reaching out, please include:</p>
            <ol>
              <li>The website URL where you're experiencing issues</li>
              <li>
                Your exported rulesets (you can export these from the Sharing
                tab)
              </li>
              <li>
                A brief description of what you expected to happen vs. what
                actually happened
              </li>
            </ol>
          </div>
        </div>
        <div className="row">
          <div className={COPY_CONTAINER_COL_CLASS}>
            <EmailGitHub />
          </div>
        </div>
      </div>
    </div>
  );
}

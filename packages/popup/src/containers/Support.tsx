import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { cx } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { getAccessToken } from "@worm/shared/src/browser";
import {
  CONTACT_SUPPORT_EMAIL,
  MAILTO_CONTACT_SUPPORT_URL,
  SUBMIT_NEW_TICKET_URL,
} from "@worm/shared/src/support";
import {
  CONTACT_SUPPORT_MAXIMUM_MESSAGE_LENGTH,
} from "@worm/shared/src/validation/contact";
import {
  ApiContactSupportRequest,
  ApiContactSupportResponse,
  ApiResponse,
} from "@worm/types/src/api";

import { useToast } from "../components/alert/useToast";
import Button from "../components/button/Button";
import { COPY_CONTAINER_COL_CLASS } from "../lib/classnames";
import { useLanguage } from "../lib/language";
import { useAuth } from "../store/Auth";

const defaultFormData: ApiContactSupportRequest = {
  message: "",
};

function EmailGitHub() {
  return (
    <div data-testid="email-github-container">
      <div className="mb-2">
        <div className="fw-medium">Email</div>
        <div>
          <a href={MAILTO_CONTACT_SUPPORT_URL} target="_blank">
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
  const [formData, setFormData] =
    useState<ApiContactSupportRequest>(defaultFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<ApiContactSupportRequest>
  >({});

  const { currentUser } = useAuth();
  const { support: lang } = useLanguage();
  const { showToast } = useToast();

  const { isPending: isContactSupportPending, mutate: contactSupport } =
    useMutation<
      AxiosRequestConfig<ApiContactSupportRequest>,
      AxiosError<ApiResponse<ApiContactSupportResponse>>,
      ApiContactSupportRequest
    >({
      mutationFn: async (body) =>
        axios.post(getApiEndpoint("POST:contactSupport"), body, {
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
        }),
    });

  const handleFormChange = (
    event: JSXInternal.TargetedEvent<HTMLTextAreaElement, Event>
  ) => {
    setFormErrors({});

    const newFormData = {
      ...formData,
      [event.currentTarget.name as keyof ApiContactSupportRequest]:
        event.currentTarget.value,
    };

    setFormData(newFormData);
  };

  const handleSubmit = (
    event: JSXInternal.TargetedSubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const message = formData.message.trim();

    if (!message) {
      return setFormErrors({
        message: lang.CONTACT_SUPPORT_FORM_EMPTY_MESSAGE_ERROR,
      });
    }

    contactSupport(
      { message },
      {
        onError({ response }) {
          const messageError = response?.data.error?.details?.error?.message[0];

          if (messageError) {
            setFormErrors({ message: messageError });
          }

          const message =
            response?.data.error?.message ??
            lang.CONTACT_SUPPORT_FORM_GENERAL_ERROR;

          showToast({
            message,
            options: { severity: "danger", showContactSupport: true },
          });
        },
        onSuccess() {
          setFormData(defaultFormData);

          showToast({
            message: lang.CONTACT_SUPPORT_FORM_SUCCESS_MESSAGE,
            options: { severity: "success" },
          });
        },
      }
    );
  };

  return (
    <div className="container-fluid gx-0" data-testid="support-container">
      {currentUser ? (
        <div
          className="d-flex flex-column gap-3"
          data-testid="logged-in-contact-options"
        >
          <div className="row fs-sm">
            <div className={COPY_CONTAINER_COL_CLASS}>
              <div className="fs-5 fw-bold">Send Direct Message</div>
              <p>
                Have feedback or need help? Send us a message! For support
                requests, we'll respond to your registered email address within
                24 hours.
              </p>
              <form onSubmit={handleSubmit} data-testid="contact-support-form">
                <label
                  className="fw-medium visually-hidden"
                  for="direct-message-input"
                >
                  Your message
                </label>
                <textarea
                  className={cx(
                    "form-control fs-sm",
                    formErrors.message && "is-invalid"
                  )}
                  id="direct-message-input"
                  maxLength={CONTACT_SUPPORT_MAXIMUM_MESSAGE_LENGTH}
                  name="message"
                  placeholder={
                    lang.CONTACT_SUPPORT_FORM_MESSAGE_INPUT_PLACEHOLDER
                  }
                  required
                  rows={6}
                  style={{ resize: "vertical" }}
                  value={formData.message}
                  onChange={handleFormChange}
                  data-testid="contact-support-form-message-input"
                />
                {formErrors.message && (
                  <div
                    className="invalid-feedback"
                    data-testid="contact-support-form-message-error"
                  >
                    {formErrors.message}
                  </div>
                )}
                <Button
                  className="btn btn-secondary mt-2"
                  disabled={isContactSupportPending}
                  startIcon="send"
                  type="submit"
                  data-testid="contact-support-form-submit-button"
                >
                  {lang.CONTACT_SUPPORT_FORM_SUBMIT_BUTTON_TEXT}
                </Button>
              </form>
            </div>
          </div>
          <div className="row">
            <div className={COPY_CONTAINER_COL_CLASS}>
              <div className="fs-5 fw-bold mb-1">Other Contact Options</div>
              <EmailGitHub />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="d-flex flex-column gap-3"
          data-testid="logged-out-contact-options"
        >
          <div className="row fs-sm">
            <div className={COPY_CONTAINER_COL_CLASS}>
              <div className="fs-5 fw-bold">Get Help</div>
              <p>
                Having trouble with Word Replacer Max? We're here to help! For
                the quickest support, please contact us via email or log an
                issue on GitHub, as extension store tickets may be delayed
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
                    Your exported rulesets (these can be exported from the
                    Options page)
                  </li>
                </ol>
              </p>
            </div>
          </div>
          <div className="row">
            <div className={COPY_CONTAINER_COL_CLASS}>
              <EmailGitHub />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

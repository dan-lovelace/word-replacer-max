import { useEffect, useRef, useState } from "preact/hooks";

import { cx, TOAST_MESSAGE_DURATION_DEFAULT_MS } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { PopupAlertSeverity } from "@worm/types";
import {
  ShowToastMessageOptions,
  WebAppMessage,
  WebAppMessageKind,
} from "@worm/types/src/message";

import { useConfig } from "../../store/Config";

import Button from "../button/Button";

const severityIconMap: Record<PopupAlertSeverity, string> = {
  danger: "warning",
  info: "info",
  success: "check",
};

export default function ToastContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState<ShowToastMessageOptions["options"]>();
  const [updatedAt, setUpdatedAt] = useState<Date>();

  const {
    isPoppedOut,
    storage: { preferences },
  } = useConfig();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: WebAppMessage<WebAppMessageKind>) => {
      if (event.data.kind !== "showToastMessage") return;

      const eventDetails = event.data.details as ShowToastMessageOptions;

      setMessage(String(eventDetails.message));
      setOptions(eventDetails.options);
      setUpdatedAt(new Date());
      setIsOpen(true);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (toastRef.current) {
      toastRef.current.classList.add("show");
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      closeToast();
    }, TOAST_MESSAGE_DURATION_DEFAULT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, updatedAt]);

  const closeToast = () => {
    setIsOpen(false);

    if (toastRef.current) {
      toastRef.current.classList.remove("show");
    }
  };

  const handleContactSupportClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = "support";

    storageSetByKeys({ preferences: newPreferences });
  };

  const handleRefreshClick = async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    browser.tabs.reload(tabs[0].id);
  };

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={cx(
        "toast fade d-flex align-items-center",
        "text-bg-light",
        "position-fixed end-0 bottom-0 w-auto",
        "me-1 mb-1",
        "z-toast",
        !isOpen && "pe-none"
      )}
      data-testid="toast-container"
      ref={toastRef}
      role="alert"
    >
      <div className="toast-body d-flex align-items-center">
        {options?.severity && (
          <span
            className={`material-icons-sharp fs-6 text-${options.severity} me-2`}
          >
            {severityIconMap[options.severity]}
          </span>
        )}
        <div className="d-flex align-items-center gap-1">
          {message}
          {options?.showContactSupport && (
            <div className="d-flex align-items-center gap-1">
              <span>Please</span>
              <Button
                className="btn btn-link btn-sm p-0 text-nowrap"
                onClick={handleContactSupportClick}
              >
                contact support
              </Button>
            </div>
          )}
          {!isPoppedOut && options?.showRefresh && (
            <Button
              className="btn btn-link btn-sm p-0 text-nowrap"
              onClick={handleRefreshClick}
            >
              Refresh now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

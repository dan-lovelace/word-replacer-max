import { useEffect, useMemo, useRef } from "preact/hooks";

import { getAssetURL, popoutExtension, storageSetByKeys } from "@worm/shared";
import { PopupTab } from "@worm/types";

import IconButton from "../components/button/IconButton";
import { RefreshRequiredToast } from "../components/RefreshRequiredToast";
import ToastMessage from "../components/ToastMessage";

import cx from "../lib/classnames";
import { useLanguage } from "../lib/language";
import { getNotificationMessage } from "../lib/routes";
import { PreactChildren } from "../lib/types";
import { useConfig } from "../store/Config";
import { useToast } from "../store/Toast";

type LayoutProps = {
  children: PreactChildren;
};

const tabs: { identifier: PopupTab; isHidden?: boolean; label: string }[] = [
  {
    identifier: "rules",
    label: "Rules",
  },
  {
    identifier: "domains",
    label: "Domains",
  },
  {
    identifier: "options",
    label: "Options",
  },
  {
    identifier: "support",
    label: "Help",
  },
];

export default function Layout({ children }: LayoutProps) {
  const {
    isPoppedOut,
    storage: { preferences },
  } = useConfig();
  const language = useLanguage();
  const notificationMessage = useMemo(getNotificationMessage, []);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { hideToast, showToast } = useToast();

  useEffect(() => {
    layoutRef.current?.classList[isPoppedOut ? "add" : "remove"](
      "layout__expanded"
    );
  }, [isPoppedOut]);

  const handleExtensionEnabledClick = () => {
    const newPreferences = Object.assign({}, preferences);
    const newEnabled = !Boolean(newPreferences?.extensionEnabled);
    newPreferences.extensionEnabled = newEnabled;

    if (!newEnabled) {
      showToast({
        children: <RefreshRequiredToast onClose={hideToast} />,
      });
    }

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const handlePopoutClick = async () => {
    const open = await popoutExtension();

    if (!open) {
      return showToast({
        children: (
          <ToastMessage
            message={language.options.POPUP_BLOCKED}
            severity="info"
          />
        ),
      });
    }

    window.close();
  };

  const handleTabChange = (newTab: PopupTab) => () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = newTab;

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <div className="layout" ref={layoutRef}>
      <div className="d-flex flex-column h-100">
        {notificationMessage && (
          <div className="alert alert-info d-flex gap-2 rounded-0" role="alert">
            <div>
              <img src={getAssetURL("img/firefox-logo.svg")} />
            </div>
            <div>
              <div className="fw-bold">Firefox detected</div>
              <div className="fs-sm">{notificationMessage}</div>
            </div>
          </div>
        )}
        <div className="d-flex w-100">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ margin: "0px 2px" }}
          >
            <IconButton
              className={
                preferences?.extensionEnabled ? "text-success" : "text-danger"
              }
              icon="power_settings_new"
              title="Toggle Extension"
              onClick={handleExtensionEnabledClick}
            />
          </div>
          <ul className="nav nav-tabs flex-fill">
            {tabs.map(
              ({ identifier, isHidden, label }) =>
                !isHidden && (
                  <li
                    key={identifier}
                    className={cx(
                      "nav-item",
                      identifier === "support" &&
                        "flex-fill d-flex justify-content-end"
                    )}
                  >
                    <button
                      className={cx(
                        "nav-link",
                        preferences?.activeTab === identifier && "active"
                      )}
                      onClick={handleTabChange(identifier)}
                    >
                      {label}
                    </button>
                  </li>
                )
            )}
          </ul>
          <div className="d-flex align-items-center justify-content-center">
            {!isPoppedOut && (
              <div className="dropdown">
                <IconButton
                  aria-expanded={false}
                  icon="more_vert"
                  data-bs-toggle="dropdown"
                />
                <ul className="dropdown-menu shadow">
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={handlePopoutClick}
                    >
                      <span className="d-flex align-items-center gap-3">
                        <span className="material-icons-sharp">
                          open_in_new
                        </span>{" "}
                        Pop extension out
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

import { VNode } from "preact";
import { useContext, useMemo } from "preact/hooks";

import { getAssetURL, storageSetByKeys } from "@worm/shared";
import { PopupTab } from "@worm/types";

import { RefreshRequiredToast } from "./RefreshRequiredToast";
import cx from "../lib/classnames";
import { getNotificationMessage } from "../lib/routes";
import { Config } from "../store/Config";
import { useToast } from "../store/Toast";

type LayoutProps = {
  children: VNode;
};

const tabs: { identifier: PopupTab; label: string }[] = [
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
    storage: { preferences },
  } = useContext(Config);
  const { hideToast, showToast } = useToast();
  const notificationMessage = useMemo(getNotificationMessage, []);

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

  const handleTabChange = (newTab: PopupTab) => () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = newTab;

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <div className="layout">
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
          <div className="d-flex align-items-center justify-content-center">
            <button
              className={cx(
                "material-icons-sharp",
                "btn btn-light bg-transparent border-0",
                "mx-1",
                preferences?.extensionEnabled ? "text-success" : "text-danger"
              )}
              title="Toggle Extension"
              onClick={handleExtensionEnabledClick}
            >
              power_settings_new
            </button>
          </div>
          <ul className="nav nav-tabs flex-fill">
            {tabs.map(({ identifier, label }) => (
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
            ))}
          </ul>
        </div>
        {children}
      </div>
    </div>
  );
}

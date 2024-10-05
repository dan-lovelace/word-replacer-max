import { useEffect, useMemo, useRef } from "preact/hooks";

import { cx } from "@worm/shared";
import {
  getAssetURL,
  popoutExtension,
  sendConnectMessage,
} from "@worm/shared/src/browser";
import { getEnvConfig } from "@worm/shared/src/config";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { PopupTab } from "@worm/types";

import { useToast } from "../components/alert/useToast";
import Button from "../components/button/Button";
import IconButton from "../components/button/IconButton";
import { useLanguage } from "../lib/language";
import { getNotificationMessage } from "../lib/routes";
import { PreactChildren } from "../lib/types";
import { useAuth } from "../store/Auth";
import { useConfig } from "../store/Config";

type LayoutProps = {
  children: PreactChildren;
};

type LayoutTab = {
  identifier: PopupTab;
  isHidden?: boolean;
  label: string;
  testId: string;
};

const envConfig = getEnvConfig();

const tabs: LayoutTab[] = [
  {
    identifier: "rules",
    label: "Rules",
    testId: "rules-tab",
  },
  {
    identifier: "domains",
    label: "Domains",
    testId: "domains-tab",
  },
  {
    identifier: "options",
    label: "Options",
    testId: "options-tab",
  },
  {
    identifier: "support",
    label: "Help",
    testId: "support-tab",
  },
];

export default function Layout({ children }: LayoutProps) {
  const { currentUser } = useAuth();
  const {
    isPoppedOut,
    storage: { preferences },
  } = useConfig();
  const language = useLanguage();
  const notificationMessage = useMemo(getNotificationMessage, []);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
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
        message: language.options.POPUP_BLOCKED,
        options: { severity: "info" },
      });
    }

    window.close();
  };

  const handleSignOutClick = () => {
    sendConnectMessage("popup", "signOut");
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
              title="Toggle Extension On/Off"
              onClick={handleExtensionEnabledClick}
            />
          </div>
          <ul className="nav nav-tabs flex-fill">
            {tabs.map(
              ({ identifier, isHidden, label, testId }) =>
                !isHidden && (
                  <li
                    key={identifier}
                    className={cx(
                      "nav-item",
                      identifier === "support" &&
                        "flex-fill d-flex justify-content-end"
                    )}
                    data-testid={testId}
                  >
                    <Button
                      className={cx(
                        "nav-link",
                        preferences?.activeTab === identifier && "active"
                      )}
                      onClick={handleTabChange(identifier)}
                    >
                      {label}
                    </Button>
                  </li>
                )
            )}
          </ul>
          <div className="d-flex align-items-center justify-content-center">
            {!isPoppedOut && (
              <div className="dropdown">
                <IconButton
                  aria-expanded={false}
                  data-bs-toggle="dropdown"
                  icon="more_vert"
                />
                <ul className="dropdown-menu shadow">
                  <li>
                    <Button
                      className="dropdown-item"
                      onClick={handlePopoutClick}
                    >
                      <span className="d-flex align-items-center gap-3">
                        <span className="material-icons-sharp">
                          open_in_new
                        </span>
                        Pop extension out
                      </span>
                    </Button>
                  </li>
                </ul>
              </div>
            )}
            <div className="dropdown">
              <IconButton
                aria-expanded={false}
                className={currentUser ? "text-primary" : "text-secondary"}
                data-bs-toggle="dropdown"
                icon="account_circle"
                style={{ transition: "color 150ms" }}
              />
              <ul className="dropdown-menu shadow" style={{ minWidth: 200 }}>
                {currentUser ? (
                  <>
                    <li onClick={(e) => e.stopPropagation()}>
                      <div
                        aria-disabled={true}
                        className="dropdown-item pe-none fs-sm"
                      >
                        <div>Signed in as</div>
                        <div className="fw-bold">{currentUser.email}</div>
                      </div>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <Button
                        className="dropdown-item"
                        onClick={handleSignOutClick}
                      >
                        <span className="d-flex align-items-center gap-3">
                          <span className="material-icons-sharp">logout</span>
                          Sign out
                        </span>
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        className="dropdown-item"
                        href={envConfig.VITE_SSM_WEBAPP_ORIGIN}
                        target="_blank"
                      >
                        <span className="d-flex align-items-center gap-3">
                          <span className="material-icons-sharp">login</span>
                          Sign in
                        </span>
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

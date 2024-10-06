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
import MenuItem from "../components/menu/MenuItem";
import DropdownMenu from "../components/menu/DropdownMenu";
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

  const handlePopoutClick = (isPopup: boolean) => async () => {
    const open = await popoutExtension(isPopup);

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
              className={cx(
                "px-3",
                preferences?.extensionEnabled ? "text-success" : "text-danger"
              )}
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
          <div className="d-flex align-items-center justify-content-center px-2">
            <div className="dropdown">
              <IconButton
                aria-expanded={false}
                className={cx(!currentUser && "text-primary")}
                data-bs-toggle="dropdown"
                icon="account_circle"
                style={{ transition: "color 150ms" }}
              />
              <DropdownMenu>
                {currentUser ? (
                  <>
                    <li onClick={(e) => e.stopPropagation()}>
                      <div
                        aria-disabled={true}
                        className="dropdown-item pe-none"
                      >
                        <div className="fs-sm">Signed in as</div>
                        <div className="fw-bold text-truncate">
                          <code>{currentUser.email}</code>
                        </div>
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
                        <MenuItem icon="logout">Sign out</MenuItem>
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li
                      className="bg-warning"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        aria-disabled={true}
                        className={cx(
                          "dropdown-item pe-none",
                          "mb-2 mt-n2 py-2",
                          "fs-sm fw-bold"
                        )}
                      >
                        Unlock additional features with your account
                      </div>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href={envConfig.VITE_SSM_WEBAPP_ORIGIN}
                        target="_blank"
                      >
                        <MenuItem icon="open_in_new">Learn more</MenuItem>
                      </a>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href={`${envConfig.VITE_SSM_WEBAPP_ORIGIN}/signup`}
                        target="_blank"
                      >
                        <MenuItem icon="app_registration">
                          Create account
                        </MenuItem>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href={`${envConfig.VITE_SSM_WEBAPP_ORIGIN}/login`}
                        target="_blank"
                      >
                        <MenuItem icon="login">Log in</MenuItem>
                      </a>
                    </li>
                  </>
                )}
              </DropdownMenu>
            </div>
            {!isPoppedOut && (
              <div className="dropdown">
                <IconButton
                  aria-expanded={false}
                  data-bs-toggle="dropdown"
                  icon="more_vert"
                />
                <DropdownMenu>
                  <li>
                    <Button
                      className="dropdown-item"
                      onClick={handlePopoutClick(false)}
                    >
                      <MenuItem icon="add">Open in tab</MenuItem>
                    </Button>
                  </li>
                  <li>
                    <Button
                      className="dropdown-item"
                      onClick={handlePopoutClick(true)}
                    >
                      <MenuItem icon="open_in_new">Open as popup</MenuItem>
                    </Button>
                  </li>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

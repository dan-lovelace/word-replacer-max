import { useEffect, useMemo } from "preact/hooks";

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
import IconButton, { IconButtonProps } from "../components/button/IconButton";
import DropdownButton from "../components/menu/DropdownButton";
import DropdownMenuContainer from "../components/menu/DropdownMenuContainer";
import MenuItem from "../components/menu/MenuItem";
import MenuItemContainer from "../components/menu/MenuItemContainer";
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
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
  const notificationMessage = useMemo(getNotificationMessage, []);
  const { showToast } = useToast();

  useEffect(() => {
    document.documentElement.classList[isPoppedOut ? "add" : "remove"](
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
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ paddingLeft: 4 }}
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
            <DropdownButton<IconButtonProps>
              buttonProps={{
                className: cx(!currentUser && "text-primary"),
                icon: currentUser ? "account_circle" : "person",
                style: {
                  transition: "color 150ms",
                },
              }}
              Component={IconButton}
              menuContent={
                <>
                  {currentUser ? (
                    <>
                      <MenuItemContainer className="border-bottom">
                        <div>
                          <div className="fs-sm">Signed in as</div>
                          <div className="fw-bold text-truncate">
                            <code>{currentUser.email}</code>
                          </div>
                        </div>
                      </MenuItemContainer>
                      <DropdownMenuContainer>
                        <MenuItem
                          startIcon="logout"
                          onClick={handleSignOutClick}
                        >
                          Sign out
                        </MenuItem>
                      </DropdownMenuContainer>
                    </>
                  ) : (
                    <>
                      <MenuItemContainer className="border-bottom bg-warning fw-bold">
                        You're missing out on premium features
                      </MenuItemContainer>
                      <DropdownMenuContainer>
                        <MenuItem
                          linkProps={{
                            href: `${envConfig.VITE_SSM_WEBAPP_ORIGIN}/signup`,
                            target: "_blank",
                          }}
                          startIcon="app_registration"
                        >
                          Create an account
                        </MenuItem>
                        <MenuItem
                          linkProps={{
                            href: `${envConfig.VITE_SSM_WEBAPP_ORIGIN}/login`,
                            target: "_blank",
                          }}
                          startIcon="login"
                        >
                          Log in
                        </MenuItem>
                      </DropdownMenuContainer>
                    </>
                  )}
                </>
              }
            />
            {!isPoppedOut && (
              <DropdownButton<IconButtonProps>
                buttonProps={{
                  icon: "more_vert",
                }}
                Component={IconButton}
                menuContent={
                  <DropdownMenuContainer>
                    <MenuItem
                      startIcon="add"
                      onClick={handlePopoutClick(false)}
                    >
                      Open in tab
                    </MenuItem>
                    <MenuItem
                      startIcon="open_in_new"
                      onClick={handlePopoutClick(true)}
                    >
                      Open as popup
                    </MenuItem>
                  </DropdownMenuContainer>
                }
              />
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

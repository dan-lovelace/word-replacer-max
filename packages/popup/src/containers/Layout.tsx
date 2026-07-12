import { useEffect, useMemo } from "preact/hooks";

import { cx } from "@worm/shared";
import { getAssetURL, popoutExtension } from "@worm/shared/src/browser";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { PopupTab } from "@worm/types/src/popup";

import DisabledBanner from "../components/alert/DisabledBanner";
import { useToast } from "../components/alert/useToast";
import Button from "../components/button/Button";
import IconButton, { IconButtonProps } from "../components/button/IconButton";
import DropdownButton from "../components/menu/DropdownButton";
import DropdownMenuContainer from "../components/menu/DropdownMenuContainer";
import MenuItem from "../components/menu/MenuItem";
import { useLanguage } from "../lib/language";
import { getURLNotificationMessage } from "../lib/routes";
import { PreactChildren } from "../lib/types";
import { useConfig } from "../store/Config";

type LayoutProps = {
  children: PreactChildren;
};

type LayoutTab = {
  identifier: PopupTab;
  label: string;
  testId: string;
};

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
    identifier: "sharing",
    label: "Sharing",
    testId: "sharing-tab",
  },
  {
    identifier: "support",
    label: "Help",
    testId: "support-tab",
  },
];

export default function Layout({ children }: LayoutProps) {
  const {
    isPoppedOut,
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();
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
        message: `Extension disabled. ${language.rules.REFRESH_REQUIRED}`,
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

  const handleTabChange = (newTab: PopupTab) => () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = newTab;

    storageSetByKeys({ preferences: newPreferences });
  };

  const urlNotificationMessage = useMemo(getURLNotificationMessage, []);

  return (
    <div className="layout">
      <div className="d-flex flex-column h-100">
        <DisabledBanner />
        {urlNotificationMessage && (
          <div className="alert alert-info d-flex gap-2 rounded-0" role="alert">
            <div>
              <img src={getAssetURL("img/firefox-logo.svg")} />
            </div>
            <div>
              <div className="fw-bold">Firefox detected</div>
              <div className="fs-sm">{urlNotificationMessage}</div>
            </div>
          </div>
        )}
        <div className="d-flex w-100">
          <div className="d-flex align-items-center justify-content-center border-bottom">
            <IconButton
              icon="power_settings_new"
              iconProps={{
                style: {
                  borderRadius: "100%",
                  boxShadow: preferences?.extensionEnabled
                    ? "inset rgba(0, 0, 0, 0.2) 0px 0px 3px 1px"
                    : "rgba(0, 0, 0, 0.2) 0px 0px 2px 1px",
                  color: preferences?.extensionEnabled
                    ? "var(--bs-green)"
                    : "rgba(var(--bs-tertiary-color-rgb), 0.15)",
                  height: 32,
                  padding: "3px 4px",
                  transition: "all 150ms",
                  width: 32,
                },
              }}
              style={{
                padding: "4px 11px",
                marginLeft: 1,
              }}
              title={`Extension ${
                preferences?.extensionEnabled ? "enabled" : "disabled"
              }`}
              onClick={handleExtensionEnabledClick}
              data-testid="extension-enabled-toggle-button"
            />
          </div>
          <ul className="nav nav-tabs flex-fill">
            {tabs.map(({ identifier, label, testId }) => (
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
            ))}
          </ul>
          {!isPoppedOut && (
            <div className="d-flex align-items-center justify-content-center border-bottom pe-1">
              <DropdownButton<IconButtonProps>
                componentProps={{
                  icon: "more_vert",
                  "data-testid": "more-dropdown-button",
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
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

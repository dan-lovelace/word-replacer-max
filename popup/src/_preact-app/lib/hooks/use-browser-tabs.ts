import { useEffect, useState } from "preact/hooks";

import { logDebug } from "@web-extension/shared";
import { browser } from "@web-extension/shared/src/browser";

export const useBrowserTabs = () => {
  const [currentHostname, setCurrentHostname] = useState<string>();
  const [latestTab, setLatestTab] = useState<browser.Tabs.Tab>();

  useEffect(() => {
    const handleTabActivate = async (
      activeInfo: browser.Tabs.OnActivatedActiveInfoType
    ) => {
      try {
        const tab = await browser.tabs.get(activeInfo.tabId);
        const hostname = tab.url ? getHostnameFromUrl(tab.url) : undefined;

        setLatestTab(tab);
        setCurrentHostname(hostname);
      } catch (error) {
        logDebug(`Error getting tab ${activeInfo.tabId}: ${error}`);
      }
    };

    const handleTabUpdate = async (
      tabId: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
      tab: browser.Tabs.Tab
    ) => {
      // only update if this is the active tab and the URL has changed
      if (changeInfo.url && tab.active) {
        const hostname = getHostnameFromUrl(changeInfo.url);

        setLatestTab(tab);
        setCurrentHostname(hostname);
      }
    };

    const initializeActiveTab = async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab) {
          const hostname = tab.url ? getHostnameFromUrl(tab.url) : undefined;

          setLatestTab(tab);
          setCurrentHostname(hostname);
        }
      } catch (error) {
        logDebug("Error getting initial active tab:", error);
      }
    };

    initializeActiveTab();

    browser.tabs.onActivated.addListener(handleTabActivate);
    browser.tabs.onUpdated.addListener(handleTabUpdate);

    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivate);
      browser.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, []);

  const getHostnameFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      logDebug("Error parsing tab url:", url);

      return undefined;
    }
  };

  return {
    currentHostname,
    latestTab,
  };
};

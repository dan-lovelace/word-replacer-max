import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  storageGetByKeys,
  storageSetByKeys,
} from "@web-extension/shared/src/storage";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import Button from "../button/Button";
import Slide from "../transition/Slide";

export default function DisabledBanner() {
  const [disabledContent, setDisabledContent] = useState<VNode | null>(null);

  const {
    storage: {
      sync: { domainList, preferences },
    },
  } = useConfig();
  const language = useLanguage();

  useEffect(() => {
    async function initialize() {
      const { preferences: currentPreferences } = await storageGetByKeys([
        "preferences",
      ]);

      if (currentPreferences?.extensionEnabled === false) {
        setDisabledContent(
          <>
            {language.layout.DISABLED_BANNER_BODY}
            <Button
              className="btn btn-link text-decoration-none fs-sm p-0"
              onClick={handleEnableClick}
              data-testid="enable-button"
            >
              {language.layout.DISABLED_BANNER_ENABLE_BUTTON_TEXT}
            </Button>
          </>
        );
      } else {
        updateDomainListDisablement();
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    updateDomainListDisablement();
  }, [domainList, preferences?.domainListEffect]);

  useEffect(() => {
    if (disabledContent && preferences?.extensionEnabled === true) {
      setDisabledContent(null);
    }
  }, [preferences?.extensionEnabled]);

  const handleDomainListEffectClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.domainListEffect = "deny";

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const handleEnableClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.extensionEnabled = true;

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  const updateDomainListDisablement = () => {
    if (!domainList?.length && preferences?.domainListEffect === "allow") {
      setDisabledContent(
        <>
          {language.layout.EMPTY_DOMAIN_ALLOWLIST_BODY}
          <Button
            className="btn btn-link text-decoration-none fs-sm p-0"
            onClick={handleDomainListEffectClick}
          >
            {language.layout.EMPTY_DOMAIN_ALLOWLIST_SWITCH_BUTTON_TEXT}
          </Button>
          {language.layout.EMPTY_DOMAIN_ALLOWLIST_OR_TEXT}
        </>
      );
    } else {
      setDisabledContent(null);
    }
  };

  return (
    <div
      style={{ height: disabledContent ? 32 : "auto" }}
      data-testid="disabled-banner"
    >
      <Slide disableEnter isOpen={!!disabledContent}>
        <div
          className="alert alert-danger d-flex align-items-center justify-content-center gap-1 rounded-0 mb-0 py-1 fs-sm"
          role="alert"
        >
          {disabledContent}
        </div>
      </Slide>
    </div>
  );
}

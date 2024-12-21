import { useEffect, useState } from "preact/hooks";

import { storageGetByKeys, storageSetByKeys } from "@worm/shared/src/storage";

import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import Button from "../button/Button";
import Slide from "../transition/Slide";

export default function DisabledBanner() {
  const [isDisabledMessage, setIsDisabledMessage] = useState<boolean>();

  const {
    storage: {
      sync: { preferences },
    },
  } = useConfig();
  const language = useLanguage();

  useEffect(() => {
    async function initialize() {
      const { preferences: currentPreferences } = await storageGetByKeys([
        "preferences",
      ]);

      setIsDisabledMessage(
        Boolean(currentPreferences?.extensionEnabled) === false
      );
    }

    initialize();
  }, []);

  useEffect(() => {
    if (isDisabledMessage && preferences?.extensionEnabled === true) {
      setIsDisabledMessage(false);
    }
  }, [preferences?.extensionEnabled]);

  const handleEnableClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.extensionEnabled = true;

    storageSetByKeys({
      preferences: newPreferences,
    });
  };

  return (
    <div
      style={{ height: isDisabledMessage ? 32 : "auto" }}
      data-testid="disabled-banner"
    >
      <Slide disableEnter isOpen={isDisabledMessage}>
        <div
          className="alert alert-danger d-flex align-items-center justify-content-center gap-1 rounded-0 mb-0 py-1 fs-sm"
          role="alert"
        >
          {language.layout.DISABLED_BANNER_BODY}
          <Button
            className="btn btn-link text-decoration-none fs-sm p-0"
            onClick={handleEnableClick}
            data-testid="enable-button"
          >
            {language.layout.DISABLED_BANNER_ENABLE_BUTTON_TEXT}
          </Button>
        </div>
      </Slide>
    </div>
  );
}

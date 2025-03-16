import { Dispatch, StateUpdater, useMemo } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { cx } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { getAccessToken } from "@worm/shared/src/browser";
import {
  DEFAULT_TONE_OPTION,
  toneOptions,
} from "@worm/shared/src/replace/lib/suggest";
import { localStorageProvider } from "@worm/shared/src/storage";
import {
  ApiResponse,
  ApiSuggestRequest,
  ApiSuggestResponse,
} from "@worm/types/src/api";
import { PopupAlertSeverity } from "@worm/types/src/popup";
import { Matcher } from "@worm/types/src/rules";

import magicWand from "../../icons/magic-wand";
import { useLanguage } from "../../lib/language";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Button from "../button/Button";
import IconButton, {
  ICON_BUTTON_BASE_CLASS,
  IconButtonProps,
} from "../button/IconButton";
import DropdownButton from "../menu/DropdownButton";
import DropdownMenuContainer from "../menu/DropdownMenuContainer";
import MenuItem from "../menu/MenuItem";
import MenuItemContainer from "../menu/MenuItemContainer";
import Spinner from "../progress/Spinner";

import { INPUT_BUTTON_WIDTH } from "./ReplacementInput";

type ReplacementSuggestProps = Pick<
  Matcher,
  "active" | "identifier" | "queries" | "replacement"
> & {
  disabled: boolean;
  value: string;
  onReplacementChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["replacement"]
  ) => void;
  setValue: Dispatch<StateUpdater<string>>;
};

export default function ReplacementSuggest({
  active,
  disabled,
  identifier,
  queries,
  replacement,
  value,
  onReplacementChange,
  setValue,
}: ReplacementSuggestProps) {
  const {
    storage: {
      local: { recentSuggestions },
    },
  } = useConfig();
  const language = useLanguage();
  const { showRefreshToast, showToast } = useToast();

  const {
    data: suggestResponse,
    isPending: isSuggestLoading,
    mutate: invokeSuggest,
  } = useMutation<
    AxiosRequestConfig<ApiSuggestResponse>,
    AxiosError<ApiResponse<ApiSuggestResponse>>,
    ApiSuggestRequest
  >({
    mutationFn: async (suggestRequest) =>
      axios.post(getApiEndpoint("POST:suggest"), suggestRequest, {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      }),
  });

  const handleReplacementSuggestClick = () => {
    const suggestRequest: ApiSuggestRequest = {
      queries,
      tone:
        recentSuggestions?.[identifier]?.selectedTone ?? DEFAULT_TONE_OPTION,
    };

    invokeSuggest(suggestRequest, {
      onError: ({ response }) => {
        let message = language.api.suggest.GENERAL_ERROR;
        let severity: PopupAlertSeverity = "danger";
        let showContactSupport = true;

        switch (response?.data.error?.name) {
          case "UsageLimitExceeded": {
            message = language.api.suggest.USAGE_LIMIT_EXCEEDED;
            severity = "info";
            showContactSupport = false;
            break;
          }
        }

        showToast({
          message,
          options: { severity, showContactSupport },
        });
      },
      onSuccess: ({ data: response }) => {
        if (!response) {
          return showToast({
            message: language.api.suggest.MISSING_DATA,
            options: { severity: "danger", showContactSupport: true },
          });
        }

        const newRecentSuggestions = {
          ...recentSuggestions,
          [identifier]: {
            ...recentSuggestions?.[identifier],
            apiResponseData: response.data,
          },
        };

        localStorageProvider.set({
          recentSuggestions: newRecentSuggestions,
        });
      },
    });
  };

  const handleSuggestionClick = (text: string) => () => {
    setValue(text);
    updateReplacement(text);
  };

  const handleToneChange = (
    event: JSXInternal.TargetedEvent<HTMLSelectElement, Event>
  ) => {
    const newRecentSuggestions = {
      ...recentSuggestions,
      [identifier]: {
        ...recentSuggestions?.[identifier],
        selectedTone: event.currentTarget.value,
      },
    };

    localStorageProvider.set({
      recentSuggestions: newRecentSuggestions,
    });
  };

  const updateReplacement = (override?: string) => {
    const updatedValue = override ?? value;

    if (updatedValue === replacement) return;

    showRefreshToast(active && Boolean(queries.length));

    onReplacementChange(identifier, "replacement", updatedValue);
  };

  const { suggestionsData, suggestionsExist, toneLabel } = useMemo(() => {
    const suggestionsData =
      // Most recent API response
      suggestResponse?.data?.data ??
      // Last response from storage
      recentSuggestions?.[identifier]?.apiResponseData;

    const suggestionsExist = !!(
      suggestionsData &&
      suggestionsData.suggestions &&
      suggestionsData.suggestions.length > 0
    );

    const toneLabel =
      toneOptions.find((option) => option.value === suggestionsData?.tone)
        ?.label ?? "";

    return { suggestionsData, suggestionsExist, toneLabel };
  }, [recentSuggestions, suggestResponse]);

  const isGenerateReplacementsDisabled = disabled || !Boolean(queries.length);

  return (
    <DropdownButton<IconButtonProps>
      noFlip
      offset={2}
      Component={IconButton}
      componentProps={{
        className: cx(ICON_BUTTON_BASE_CLASS, "px-1"),
        disabled: isGenerateReplacementsDisabled,
        disabledTooltip: "Add search terms to get suggestions",
        icon: magicWand,
        title: "Get suggestions",
        style: {
          opacity: isGenerateReplacementsDisabled ? 0.6 : 1,
          width: INPUT_BUTTON_WIDTH,
        },
        "aria-label": "Suggestions dropdown toggle",
        "data-testid": "suggestions-dropdown-toggle",
      }}
      menuContent={
        <div data-testid="suggestions-dropdown-menu">
          <MenuItemContainer data-testid="suggestions-configuration">
            <div className="flex-fill">
              <div className="fw-bold mb-1">Get suggestions</div>
              <label className="visually-hidden" for="tone-select">
                Suggestion style
              </label>
              <div className="input-group" role="group">
                <select
                  className="form-select"
                  id="tone-select"
                  value={
                    recentSuggestions?.[identifier]?.selectedTone ??
                    DEFAULT_TONE_OPTION
                  }
                  onChange={handleToneChange}
                  data-testid="tone-select"
                >
                  <option disabled>Suggestion style</option>
                  {toneOptions.map(({ label, value }) => (
                    <option
                      key={`tone-${value}`}
                      value={value}
                      data-testid="tone-option"
                    >
                      {label}
                    </option>
                  ))}
                </select>
                <Button
                  className="btn btn-primary btn-sm"
                  disabled={isSuggestLoading}
                  onClick={handleReplacementSuggestClick}
                  data-testid="generate-suggestions-button"
                >
                  Generate
                </Button>
              </div>
            </div>
          </MenuItemContainer>
          {(isSuggestLoading || suggestionsExist) && (
            <DropdownMenuContainer className="border-top position-relative">
              {isSuggestLoading && (
                <div
                  style={{
                    height: suggestionsExist ? "auto" : 60,
                  }}
                  data-testid="suggestions-list-spinner"
                >
                  <div
                    className={cx(
                      "mt-n1 z-3",
                      "d-flex align-items-center justify-content-center w-100 h-100",
                      suggestionsExist && "position-absolute"
                    )}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <Spinner className="text-secondary" />
                  </div>
                </div>
              )}
              {suggestionsExist && (
                <>
                  <MenuItemContainer data-testid="suggestions-tone-label">
                    {toneLabel} alternatives
                  </MenuItemContainer>
                  <div data-testid="suggestions-list">
                    {suggestionsData?.suggestions?.map(({ text }, idx) => (
                      <MenuItem
                        key={`suggestion-${idx}`}
                        startIcon={
                          replacement === text
                            ? "radio_button_checked"
                            : "radio_button_unchecked"
                        }
                        onClick={handleSuggestionClick(text)}
                        data-testid="suggestions-list-item"
                      >
                        {text}
                      </MenuItem>
                    ))}
                  </div>
                </>
              )}
            </DropdownMenuContainer>
          )}
        </div>
      }
    />
  );
}

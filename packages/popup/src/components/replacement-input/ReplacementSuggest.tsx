import { StateUpdater, useMemo } from "preact/hooks";
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
import { getStorageProvider } from "@worm/shared/src/storage";
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
import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";
import DropdownButton from "../menu/DropdownButton";
import DropdownMenuContainer from "../menu/DropdownMenuContainer";
import MenuItem from "../menu/MenuItem";
import MenuItemContainer from "../menu/MenuItemContainer";

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
  setValue: StateUpdater<string>;
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

        getStorageProvider("local").set({
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

    getStorageProvider("local").set({
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
    <DropdownButton
      noFlip
      offset={2}
      Component={IconButton}
      componentProps={{
        className: cx(ICON_BUTTON_BASE_CLASS, "rounded-0 px-1"),
        disabled: isGenerateReplacementsDisabled,
        disabledTooltip: "Add search terms to get suggestions",
        icon: magicWand,
        title: "Get Suggestions",
        style: {
          opacity: isGenerateReplacementsDisabled ? 0.6 : 1,
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
          {suggestionsExist && (
            <DropdownMenuContainer className="border-top">
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
            </DropdownMenuContainer>
          )}
        </div>
      }
    />
  );
}

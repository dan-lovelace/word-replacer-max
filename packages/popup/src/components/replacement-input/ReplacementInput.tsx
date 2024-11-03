import { Ref } from "preact";
import { useMemo, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { cx, isReplacementEmpty } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { DEFAULT_TONE_OPTION } from "@worm/shared/src/replace/lib/suggest";
import { getStorageProvider, storageSetByKeys } from "@worm/shared/src/storage";
import {
  ApiResponse,
  ApiSuggestRequest,
  ApiSuggestResponse,
  Matcher,
  PopupAlertSeverity,
  ToneOption,
} from "@worm/types";

import magicWand from "../../icons/magic-wand";
import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";
import { useConfig } from "../../store/Config";

import { useToast } from "../alert/useToast";
import Button from "../button/Button";
import IconButton, { ICON_BUTTON_BASE_CLASS } from "../button/IconButton";
import DropdownButton from "../menu/DropdownButton";
import DropdownMenuContainer from "../menu/DropdownMenuContainer";
import MenuItem from "../menu/MenuItem";
import MenuItemContainer from "../menu/MenuItemContainer";

type ReplacementInputProps = Pick<
  Matcher,
  | "active"
  | "identifier"
  | "queries"
  | "replacement"
  | "useGlobalReplacementStyle"
> & {
  disabled: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (
    identifier: string,
    key: keyof Matcher,
    newValue: Matcher["replacement"]
  ) => void;
};

const INPUT_BUTTON_WIDTH = 31;
const INPUT_WIDTH_BASE = 250;

const toneOptions: { label: string; value: ToneOption }[] = [
  {
    label: "Casual",
    value: "casual",
  },
  {
    label: "Emotional",
    value: "emotional",
  },
  {
    label: "Neutral",
    value: "neutral",
  },
  {
    label: "Poetic",
    value: "poetic",
  },
  {
    label: "Professional",
    value: "professional",
  },
  {
    label: "Technical",
    value: "technical",
  },
  {
    label: "Witty",
    value: "witty",
  },
];

export default function ReplacementInput({
  active,
  disabled,
  identifier,
  inputRef,
  queries,
  replacement,
  useGlobalReplacementStyle,
  onChange,
}: ReplacementInputProps) {
  const [value, setValue] = useState(replacement);

  const { hasAccess } = useAuth();
  const {
    storage: {
      local: { recentSuggestions },
      session: { authAccessToken },
      sync: { matchers, replacementStyle, replacementSuggest },
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
    mutationFn: (suggestRequest) =>
      axios.post(getApiEndpoint("POST:suggest"), suggestRequest, {
        headers: {
          Authorization: `Bearer ${authAccessToken}`,
        },
      }),
  });

  const handleFormSubmit = (
    event:
      | JSXInternal.TargetedSubmitEvent<HTMLFormElement>
      | JSXInternal.TargetedFocusEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    updateReplacement();
  };

  const handleReplacementStyleChange = () => {
    const newMatchers = [...(matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx].useGlobalReplacementStyle = !Boolean(
      newMatchers[matcherIdx].useGlobalReplacementStyle
    );

    showRefreshToast(
      active && Boolean(queries.length) && !isReplacementEmpty(replacement)
    );

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

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

  const handleTextChange = (
    event: JSXInternal.TargetedInputEvent<HTMLInputElement>
  ) => {
    setValue(event.currentTarget.value);
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

    onChange(identifier, "replacement", updatedValue);
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

  const canSuggest =
    replacementSuggest?.active && hasAccess("api:InvokeSuggest");
  const inputWidth =
    INPUT_WIDTH_BASE -
    ((canSuggest ? INPUT_BUTTON_WIDTH : 0) +
      (replacementStyle?.active ? INPUT_BUTTON_WIDTH : 0));

  const isGenerateReplacementsDisabled = disabled || !Boolean(queries.length);

  return (
    <form
      className="flex-fill border rounded"
      onSubmit={handleFormSubmit}
      data-testid="replacement-input-form"
    >
      <div className="input-group" role="group">
        <input
          className="form-control border-0"
          disabled={disabled}
          enterkeyhint="enter"
          ref={inputRef}
          type="text"
          value={value}
          onBlur={handleFormSubmit}
          onInput={handleTextChange}
          style={{
            width: inputWidth,
          }}
          data-testid="replacement-text-input"
        />
        {canSuggest && (
          <DropdownButton
            noFlip
            offset={3}
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
              <>
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
                  <DropdownMenuContainer
                    className="border-top"
                    data-testid="suggestions-results"
                  >
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
              </>
            }
          />
        )}
        {replacementStyle?.active && (
          <IconButton
            className={cx(ICON_BUTTON_BASE_CLASS, "px-2")}
            disabled={disabled}
            icon={
              useGlobalReplacementStyle
                ? "format_color_text"
                : "format_color_reset"
            }
            iconProps={{
              className: "text-secondary",
              size: "sm",
            }}
            title={
              useGlobalReplacementStyle
                ? "Replacement Style Enabled"
                : "Replacement Style Disabled"
            }
            onClick={handleReplacementStyleChange}
            data-testid="replacement-style-button"
          />
        )}
      </div>
      <Button className="visually-hidden" disabled={disabled} type="submit">
        Save
      </Button>
    </form>
  );
}

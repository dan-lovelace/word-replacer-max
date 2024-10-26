import { Ref } from "preact";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useMutation } from "@tanstack/react-query";

import { isReplacementEmpty } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { DEFAULT_TONE_OPTION } from "@worm/shared/src/replace/lib/suggest";
import { storageSetByKeys } from "@worm/shared/src/storage";
import {
  ApiResponse,
  ApiSuggestRequest,
  ApiSuggestResponse,
  Matcher,
  PopupAlertSeverity,
  ToneOption,
} from "@worm/types";

import { useLanguage } from "../lib/language";
import { useAuth } from "../store/Auth";
import { useConfig } from "../store/Config";

import { useToast } from "./alert/useToast";
import Button from "./button/Button";
import IconButton from "./button/IconButton";
import DropdownMenu from "./menu/DropdownMenu";
import MenuItem from "./menu/MenuItem";

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

const INPUT_BUTTON_WIDTH = 39;
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
    sessionStorage: { authAccessToken },
    storage: {
      matchers,
      replacementStyle: globalReplacementStyle,
      replacementSuggest,
    },
  } = useConfig();
  const language = useLanguage();
  const { showToast } = useToast();

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

    if (active && Boolean(queries.length) && !isReplacementEmpty(replacement)) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleReplacementSuggestClick = () => {
    const suggestRequest: ApiSuggestRequest = {
      queries,
      tone: replacementSuggest?.selectedTone ?? DEFAULT_TONE_OPTION,
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

        const newReplacementSuggest = Object.assign({}, replacementSuggest);

        if (!newReplacementSuggest.lastSuggestions) {
          newReplacementSuggest.lastSuggestions = {
            suggestions: [],
          };
        }

        newReplacementSuggest.lastSuggestions.suggestions =
          response.data?.suggestions ?? [];
        newReplacementSuggest.lastSuggestions.tone = response.data?.tone;

        storageSetByKeys({
          replacementSuggest: newReplacementSuggest,
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
    const newReplacementSuggest = Object.assign({}, replacementSuggest);

    newReplacementSuggest.selectedTone = event.currentTarget
      .value as ToneOption;

    storageSetByKeys({
      replacementSuggest: newReplacementSuggest,
    });
  };

  const updateReplacement = (override?: string) => {
    const updatedValue = override ?? value;

    if (updatedValue === replacement) return;

    if (active && Boolean(queries.length)) {
      showToast({
        message: language.rules.REFRESH_REQUIRED,
        options: { showRefresh: true },
      });
    }

    onChange(identifier, "replacement", updatedValue);
  };

  const canSuggest =
    replacementSuggest?.active && hasAccess("api:InvokeSuggest");
  const suggestionsData =
    (suggestResponse && suggestResponse.data?.data) ||
    replacementSuggest?.lastSuggestions;
  const suggestionsExist = !!(
    suggestionsData &&
    suggestionsData.suggestions &&
    suggestionsData.suggestions.length > 0
  );

  const inputWidth =
    INPUT_WIDTH_BASE -
    ((canSuggest ? INPUT_BUTTON_WIDTH : 0) +
      (globalReplacementStyle?.active ? INPUT_BUTTON_WIDTH : 0));

  const toneLabel =
    toneOptions.find((option) => option.value === suggestionsData?.tone)
      ?.label ?? "";

  return (
    <form className="flex-fill border rounded" onSubmit={handleFormSubmit}>
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
        />
        {canSuggest && (
          <>
            <IconButton
              aria-expanded={false}
              data-bs-toggle="dropdown"
              data-testid="generate-suggestions-button"
              icon={
                <span className="d-flex align-items-center">
                  <img
                    alt="magic wand"
                    src="/assets/img/wand-icon.png"
                    style={{ width: 16 }}
                  />
                </span>
              }
            />
            <DropdownMenu minWidth={320}>
              <div onClick={(e) => e.stopPropagation()}>
                <div
                  aria-disabled={true}
                  className="d-flex flex-column gap-2 pb-2 px-3"
                >
                  <div className="fw-bold">Get suggestions</div>
                  <div className="input-group" role="group">
                    <label className="visually-hidden" for="tone-select">
                      Suggestion style
                    </label>
                    <select
                      className="form-select"
                      id="tone-select"
                      value={replacementSuggest.selectedTone}
                      onChange={handleToneChange}
                    >
                      <option disabled>Suggestion style</option>
                      {toneOptions.map(({ label, value }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="btn btn-primary btn-sm"
                      disabled={isSuggestLoading}
                      onClick={handleReplacementSuggestClick}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
              {suggestionsExist && (
                <>
                  <div onClick={(e) => e.stopPropagation()}>
                    <li>
                      <hr className="dropdown-divider my-0" />
                    </li>
                    <li>
                      <div
                        aria-disabled={true}
                        className="dropdown-item fw-medium py-2 pe-none"
                        data-testid="suggestions-tone-label"
                      >
                        {toneLabel} alternatives
                      </div>
                    </li>
                  </div>
                  <div data-testid="suggestions-list">
                    {suggestionsData.suggestions?.map((suggestion, idx) => (
                      <li key={idx}>
                        <Button
                          className="dropdown-item"
                          onClick={handleSuggestionClick(suggestion.text)}
                        >
                          <MenuItem
                            icon={
                              replacement === suggestion.text
                                ? "radio_button_checked"
                                : "radio_button_unchecked"
                            }
                          >
                            {suggestion.text}
                          </MenuItem>
                        </Button>
                      </li>
                    ))}
                  </div>
                </>
              )}
            </DropdownMenu>
          </>
        )}
        {globalReplacementStyle?.active && (
          <Button
            className="btn btn-outline-secondary border-0 bg-transparent text-secondary"
            data-testid="replacement-style-button"
            disabled={disabled}
            title={
              useGlobalReplacementStyle
                ? "Replacement Style Enabled"
                : "Replacement Style Disabled"
            }
            onClick={handleReplacementStyleChange}
          >
            <span className="d-flex align-items-center">
              <span className="material-icons-sharp fs-6">
                {useGlobalReplacementStyle
                  ? "format_color_text"
                  : "format_color_reset"}
              </span>
            </span>
          </Button>
        )}
      </div>
      <Button className="visually-hidden" disabled={disabled} type="submit">
        Add
      </Button>
    </form>
  );
}

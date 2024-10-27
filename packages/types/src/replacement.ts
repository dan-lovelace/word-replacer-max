import { Matcher } from "./";
import { ApiSuggestResponseData, ToneOption } from "./api";

/**
 * Suggestions data stored in local storage. It serves as a cache of API
 * responses so we can remember the results so users don't need to re-generate
 * them after closing the popup.
 */
export type RecentSuggestions = Partial<{
  [key: string]: Pick<Matcher, "identifier"> & {
    /**
     * Raw response data from the `POST:suggest` endpoint.
     */
    apiResponseData: ApiSuggestResponseData;

    /**
     * The user's tone selection in the UI. This could be different than the
     * one in the API response because they might select a different option but
     * never run the generate command. The response's tone is surfaced above
     * the list of its suggestions in the UI so the user can see which tone the
     * list is referring.
     */
    selectedTone: ToneOption;
  };
}>;

export type ReplacementSuggestion = {
  text: string;
};

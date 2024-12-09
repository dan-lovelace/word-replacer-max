import { ToneOption } from "@worm/types/src/api";
import { ReplacementSuggest } from "@worm/types/src/replace";

export const DEFAULT_TONE_OPTION: ToneOption = "casual";

export const DEFAULT_REPLACEMENT_SUGGEST: ReplacementSuggest = {
  /**
   * This feature is only available to signed-in users. By setting its default
   * `true`, we ensure newly-registered users get access immediately.
   */
  active: true,
};

export const toneOptions: { label: string; value: ToneOption }[] = [
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

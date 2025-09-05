import { ToneOption } from "@wordreplacermax/types/src/api";
import { ReplacementSuggest } from "@wordreplacermax/types/src/replace";

export const DEFAULT_TONE_OPTION: ToneOption = "casual";

export const DEFAULT_REPLACEMENT_SUGGEST: ReplacementSuggest = {
  active: false,
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

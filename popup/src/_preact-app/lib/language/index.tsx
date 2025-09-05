import english from "./english";

type SupportedLanguage = "en";

export const useLanguage = (language: SupportedLanguage = "en") => {
  switch (language) {
    default:
      return english;
  }
};

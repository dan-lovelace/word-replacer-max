import { merge } from "ts-deepmerge";

import {
  DEFAULT_REPLACEMENT_STYLE,
  getStylesheet,
} from "@worm/shared/src/replace/lib/style";
import { findText, replaceText } from "@worm/shared/src/replace";
import { QueryPattern, ReplacementStyle } from "@worm/types";

import { selectors as s } from "../support/selectors";

const defaultReplacementStyle: ReplacementStyle = {
  ...DEFAULT_REPLACEMENT_STYLE,
  active: true,
};

function generateReplacementStyle(
  overrides: Partial<ReplacementStyle> = {}
): ReplacementStyle {
  return merge(defaultReplacementStyle, overrides);
}

function searchAndReplace(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string,
  replacementStyle: ReplacementStyle
) {
  const results = findText(element, query, queryPatterns);

  replaceText(
    results[0],
    query,
    { queryPatterns, replacement, useGlobalReplacementStyle: true },
    replacementStyle
  );
}

describe("replacement style", () => {
  it("does not apply styles when feature is disabled", () => {
    const testStyle = generateReplacementStyle({ active: false });

    cy.visitMock({
      styleContents: getStylesheet(testStyle).textContent?.toString(),
      targetContents: "Lorem ipsum dolor",
    });

    s.target().then(($element) => {
      const target = $element.get(0);

      searchAndReplace(target, "ipsum", [], "sit", testStyle);
      cy.wrap(target).within(() => {
        s.replacedText()
          .invoke("css", "background-color")
          .then((bgColor) => expect(bgColor).to.eq("rgba(0, 0, 0, 0)"));
        s.replacedText()
          .invoke("css", "color")
          .then((color) => expect(color).to.eq("rgb(0, 0, 0)"));
        s.replacedText()
          .invoke("css", "font-weight")
          .then((color) => expect(color).to.eq("400"));
        s.replacedText()
          .invoke("css", "text-decoration")
          .then((color) => expect(color).to.eq("none solid rgb(0, 0, 0)"));
      });
    });
  });

  it("applies styles when feature is enabled with default values", () => {
    const testStyle = generateReplacementStyle();

    cy.visitMock({
      styleContents: getStylesheet(testStyle).textContent?.toString(),
      targetContents: "Lorem ipsum dolor",
    });

    s.target().then(($element) => {
      const target = $element.get(0);

      searchAndReplace(target, "ipsum", [], "sit", testStyle);
      cy.wrap(target).within(() => {
        s.replacedText()
          .invoke("css", "background-color")
          .then((bgColor) => expect(bgColor).to.eq("rgb(255, 215, 0)"));
        s.replacedText()
          .invoke("css", "color")
          .then((color) => expect(color).to.eq("rgb(0, 0, 0)"));
        s.replacedText()
          .invoke("css", "font-weight")
          .then((color) => expect(color).to.eq("400"));
        s.replacedText()
          .invoke("css", "text-decoration")
          .then((color) => expect(color).to.eq("none solid rgb(0, 0, 0)"));
      });
    });
  });

  it("applies styles when feature is enabled with custom values", () => {
    const testStyle = generateReplacementStyle({
      backgroundColor: "red",
      color: "blue",
      options: [
        "backgroundColor",
        "bold",
        "color",
        "italic",
        "strikethrough",
        "underline",
      ],
    });

    cy.visitMock({
      styleContents: getStylesheet(testStyle).textContent?.toString(),
      targetContents: "Lorem ipsum dolor",
    });

    s.target().then(($element) => {
      const target = $element.get(0);

      searchAndReplace(target, "ipsum", [], "sit", testStyle);
      cy.wrap(target).within(() => {
        s.replacedText()
          .invoke("css", "background-color")
          .then((bgColor) => expect(bgColor).to.eq("rgb(255, 0, 0)"));
        s.replacedText()
          .invoke("css", "color")
          .then((color) => expect(color).to.eq("rgb(0, 0, 255)"));
        s.replacedText()
          .invoke("css", "font-weight")
          .then((color) => expect(color).to.eq("700"));
        s.replacedText()
          .invoke("css", "text-decoration")
          .then((color) =>
            expect(color).to.eq("underline line-through solid rgb(0, 0, 255)")
          );
      });
    });
  });
});

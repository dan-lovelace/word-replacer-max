import { ReplacementStyle } from "@worm/types";

type SystemColor =
  | "black"
  | "blue"
  | "blueGray"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "red"
  | "white"
  | "yellow";

export const systemColors: Record<SystemColor, string> = {
  /**
   * System colors sorted by hue.
   */
  blueGray: "#add8e6",
  cyan: "#34caf0",
  green: "#00e500",
  yellow: "#ffd700",
  orange: "#ff6600",
  red: "#dc3545",
  pink: "#ff1493",
  blue: "#025ade",

  /**
   * Common colors.
   */
  white: "#ffffff",
  black: "#000000",
};

export const DEFAULT_REPLACEMENT_STYLE: ReplacementStyle = {
  active: false,
  backgroundColor: systemColors.blueGray,
  color: systemColors.red,
  options: ["backgroundColor"],
};

export const STYLE_ELEMENT_ID = "wrm-style";

export function getStylesheet(replacementStyle?: ReplacementStyle) {
  const newStyleElement = document.createElement("style");
  newStyleElement.id = STYLE_ELEMENT_ID;

  const paddingAmount = replacementStyle?.options?.includes("bold") ? 2 : 1;
  const stylesheet = `
    .wrm-style__backgroundColor {
      background-color: ${
        String(replacementStyle?.backgroundColor) || "unset"
      } !important;
      padding-left: ${paddingAmount}px !important;
      padding-right: ${paddingAmount}px !important;
    }

    .wrm-style__bold {
      font-weight: 700 !important;
    }

    .wrm-style__color {
      color: ${String(replacementStyle?.color) || "unset"} !important;
    }

    .wrm-style__italic {
      font-style: italic !important; 
    }

    .wrm-style__strikethrough {
      text-decoration: line-through !important;
    }

    .wrm-style__underline {
      text-decoration: underline !important;
    }

    .wrm-style__strikethrough.wrm-style__underline {
      text-decoration: line-through underline !important;
    }
  `;
  const stylesheetNode = document.createTextNode(stylesheet);

  newStyleElement.appendChild(stylesheetNode);

  return newStyleElement;
}

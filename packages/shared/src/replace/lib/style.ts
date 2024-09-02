import { ReplacementStyle } from "@worm/types";

export const DEFAULT_REPLACEMENT_STYLE: ReplacementStyle = {
  active: false,
  backgroundColor: "#ffc107",
  color: "#dc3545",
  options: ["backgroundColor"],
};

export const STYLE_ELEMENT_ID = "wrm-style";

export function getStylesheet(replacementStyle?: ReplacementStyle) {
  const newStyleElement = document.createElement("style");
  newStyleElement.id = STYLE_ELEMENT_ID;

  const stylesheet = `
    .wrm-style__backgroundColor {
      background-color: ${
        String(replacementStyle?.backgroundColor) || "unset"
      } !important;
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

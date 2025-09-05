import { ComponentChildren } from "preact";

import { Matcher } from "@wordreplacermax/types/src/rules";

export type PreactChildren = ComponentChildren;

export type SelectedRule = Matcher & {
  isSelected: boolean;
};

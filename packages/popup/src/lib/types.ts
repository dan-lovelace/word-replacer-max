import { ComponentChildren } from "preact";

import { Matcher } from "@worm/types";

export type PreactChildren = ComponentChildren;

export type SelectedRule = Matcher & {
  isSelected: boolean;
};

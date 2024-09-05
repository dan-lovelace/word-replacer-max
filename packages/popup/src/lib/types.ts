import { VNode } from "preact";

import { Matcher } from "@worm/types";

export type PreactChildren = (string | VNode) | (string | VNode)[] | false;

export type SelectedRule = Matcher & {
  isSelected: boolean;
};

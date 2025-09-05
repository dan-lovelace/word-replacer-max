import { RenderRate } from "@wordreplacermax/types/src/rules";

export const DEFAULT_RENDER_RATE_MS = 20;
export const MAX_RENDER_RATE_MS = 800;
export const MIN_RENDER_RATE_MS = 20;

export const DEFAULT_RENDER_RATE: RenderRate = {
  active: false,
  frequency: DEFAULT_RENDER_RATE_MS,
};

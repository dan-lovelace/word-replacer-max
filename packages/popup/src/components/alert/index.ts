import { PopupAlertSeverity } from "@worm/types";

export interface ToastMessage<T extends ToastMessageKind> extends MessageEvent {
  data: {
    details?: ToastMessageKindMap[T];
    kind: T;
  };
}

export type ToastMessageData<T extends ToastMessageKind> =
  ToastMessage<T>["data"];

export type ToastMessageKind = keyof ToastMessageKindMap;

export type ToastMessageKindMap = {
  showToastMessage: ShowToastMessageOptions;
};

export type ShowToastMessageOptions = {
  message: string;
  options?: {
    severity?: PopupAlertSeverity;
    showContactSupport?: boolean;
    showRefresh?: boolean;
  };
};

export const DURATION_DEFAULT_MS = 4000;

export function createToastMessage<T extends ToastMessageKind>(
  kind: T,
  details?: ToastMessageKindMap[T]
): ToastMessageData<T> {
  return { kind, details };
}

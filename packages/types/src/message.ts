import { ApiAuthTokens } from "./api";
import { AppUser } from "./identity";
import { UserTokens } from "./permission";
import { PopupAlertSeverity } from "./popup";
import { WebAppPingResponse } from "./web-app";

export interface BaseMessage<
  T extends string,
  K extends Record<T, unknown>,
> extends MessageEvent {
  data: {
    details?: K[T];
    kind: T;
  };
}

export interface ISuccessful {
  success: boolean;
}

export type ErrorableMessage<T> = {
  data?: T;
  error?: {
    name: string;
    message: string;
  };
};

export type ShowToastMessageOptions = {
  message: string;
  options?: {
    severity?: PopupAlertSeverity;
    showContactSupport?: boolean;
    showRefresh?: boolean;
  };
};

export type WebAppMessage<T extends WebAppMessageKind> = BaseMessage<
  T,
  WebAppMessageKindMap
>;

export type WebAppMessageData<T extends WebAppMessageKind> =
  WebAppMessage<T>["data"];

export type WebAppMessageKind = keyof WebAppMessageKindMap;

export type WebAppMessageKindMap = {
  inputReplacementRequest: undefined;
  showToastMessage: ShowToastMessageOptions;
};

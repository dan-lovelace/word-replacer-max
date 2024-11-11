import { ApiAuthTokens } from "./api";
import { AppUser } from "./identity";
import { PopupAlertSeverity } from "./popup";
import { WebAppPingResponse } from "./web-app";

export interface BaseMessage<T extends string, K extends Record<T, unknown>>
  extends MessageEvent {
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

export type RuntimeMessage<T extends RuntimeMessageKind> = BaseMessage<
  T,
  RuntimeMessageKindMap
>;

export type RuntimeMessageData<T extends RuntimeMessageKind> =
  RuntimeMessage<T>["data"];

export type RuntimeMessageKind = keyof RuntimeMessageKindMap;

export type RuntimeMessageKindMap = {
  currentUserRequest: undefined;
  currentUserResponse: ErrorableMessage<AppUser>;
  forceRefreshTokensRequest: undefined;
  forceRefreshTokensResponse: ErrorableMessage<ISuccessful>;
  signOutRequest: undefined;
  signOutResponse: ErrorableMessage<undefined>;
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
  authUpdateTokens: ApiAuthTokens;
  authSignOutRequest: undefined;
  authSignOutResponse: ErrorableMessage<boolean>;
  authTokensRequest: undefined;
  authTokensResponse: ErrorableMessage<Omit<ApiAuthTokens, "refreshToken">>;
  authUserRequest: undefined;
  authUserResponse: ErrorableMessage<AppUser>;
  contentInitialize: undefined;
  pingRequest: undefined;
  pingResponse: WebAppPingResponse;
  showToastMessage: ShowToastMessageOptions;
};

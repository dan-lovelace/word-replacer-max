import {
  AppUser,
  PopupAlertSeverity,
  WebAppPingRequest,
  WebAppPingResponse,
} from ".";
import { ApiAuthTokens } from "./api";

export type AuthInit = {
  callbackUrl: string;
};

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

export interface WebAppMessage<T extends WebAppMessageKind>
  extends MessageEvent {
  data: {
    details?: WebAppMessageKindMap[T];
    kind: T;
  };
}

export type WebAppMessageData<T extends WebAppMessageKind> =
  WebAppMessage<T>["data"];

export type WebAppMessageKind = keyof WebAppMessageKindMap;

export type WebAppMessageKindMap = {
  authInit: AuthInit;
  authUpdateTokens: ApiAuthTokens;
  authTokensRequest: undefined;
  authTokensResponse: ErrorableMessage<ApiAuthTokens>;
  authUserRequest: undefined;
  authUserResponse: ErrorableMessage<AppUser>;
  contentInitialize: undefined;
  pingRequest: WebAppPingRequest;
  pingResponse: WebAppPingResponse;
  showToastMessage: ShowToastMessageOptions;
};

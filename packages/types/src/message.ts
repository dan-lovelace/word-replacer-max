import {
  AppUser,
  PopupAlertSeverity,
  WebAppPingRequest,
  WebAppPingResponse,
} from ".";
import { ApiAuthTokensResponse } from "./api";

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
  authTokens: ApiAuthTokensResponse;
  contentInitialize: boolean;
  pingRequest: WebAppPingRequest;
  pingResponse: WebAppPingResponse;
  setUser: AppUser;
  showToastMessage: ShowToastMessageOptions;
};

import { ApiAuthTokens } from "./api";
import { AppUser } from "./identity";
import { UserTokens } from "./permission";
import { PopupAlertSeverity } from "./popup";
import { Storage, SyncStorage } from "./storage";
import { WebAppPingResponse } from "./web-app";

export interface BaseMessage<T extends string, K extends Record<T, unknown>>
  extends MessageEvent {
  data: {
    details?: K[T];
    kind: T;
    targets?: BaseMessageTargets;
  };
}

export interface ISuccessful {
  success: boolean;
}

export type BaseMessageTarget = "background" | "content" | "offscreen";

export type BaseMessageTargets = BaseMessageTarget[];

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
  authTokensRequest: undefined;
  authTokensResponse: ErrorableMessage<UserTokens>;
  currentUserRequest: undefined;
  currentUserResponse: ErrorableMessage<AppUser>;
  forceRefreshTokensRequest: undefined;
  forceRefreshTokensResponse: ErrorableMessage<ISuccessful>;
  replacerStorageRequest: undefined;
  replacerStorageResponse: ErrorableMessage<Partial<Storage>>;
  signOutRequest: undefined;
  signOutResponse: ErrorableMessage<undefined>;

  /**
   * WIP
   */
  htmlReplaceRequest: HTMLReplaceRequest;
  htmlReplaceResponse: ErrorableMessage<ReplaceResponse[]>;
  // offscreenReadyRequest: undefined;
  // offscreenReadyResponse: ErrorableMessage<ISuccessful>;
};

export type HTMLReplaceRequest = {
  strings: HTMLStringItem[];
  syncStorage: SyncStorage;
};

export type HTMLReplaceResponse = ReplaceResponse[];

export type HTMLStringItem = {
  html: string;
  id: string;
};

type ReplaceResponse = {
  id: string;
  outputHTML: string;
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
  authSignOutRequest: undefined;
  authSignOutResponse: ErrorableMessage<boolean>;
  authUpdateTokensRequest: ApiAuthTokens;
  authUpdateTokensResponse: ErrorableMessage<UserTokens>;
  authUserRequest: undefined;
  authUserResponse: ErrorableMessage<AppUser>;
  contentInitialize: undefined;
  pingRequest: undefined;
  pingResponse: WebAppPingResponse;
  showToastMessage: ShowToastMessageOptions;

  /**
   * WIP
   */
  htmlReplaceResponse: ErrorableMessage<ReplaceResponse[]>;
  offscreenReadyRequest: undefined;
  offscreenReadyResponse: ErrorableMessage<ISuccessful>;
};

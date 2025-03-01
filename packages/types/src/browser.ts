import { Browser, Events, Runtime, Storage } from "webextension-polyfill";

import { DeepPartial } from "./";

export interface IBrowser extends DeepPartial<Browser> {
  runtime: IRuntime;
  storage: IStorage;
  windows: TWindows;
}

export interface IRuntime extends Partial<Runtime.Static> {
  connect(connectInfo?: TRuntimeConnectInfo | undefined): TPort;
  connect(extensionId?: string, connectInfo?: TRuntimeConnectInfo): TPort;
  onConnect: TRuntimeConnectEvent;
  onMessage: TRuntimeMessageEvent;
}

export interface IStorage extends Partial<Storage.Static> {}

export type TListenerCallback = (
  changes: Storage.StorageAreaSyncOnChangedChangesType,
  areaName: TStorageArea
) => void;

export type TMessageEvent = Events.Event<(message: any, port: TPort) => void>;

export type TMessageSender = Runtime.MessageSender;

export type TOnChangedEvent = Events.Event<TListenerCallback>;

export type TPort = Runtime.Port;

export type TRuntimeConnectEvent = Events.Event<(port: TPort) => void>;

export type TRuntimeConnectInfo = Runtime.ConnectConnectInfoType;

export type TRuntimeMessageEvent = Events.Event<TRuntimeMessageEventCallback>;

export type TRuntimeMessageEventCallback = (
  message: any,
  sender: TMessageSender,
  sendResponse: (response?: any) => void
) => void;

export type TStorageArea = keyof Pick<IStorage, "local" | "session" | "sync">;

export type TStorageInitialValues<T> = Partial<Record<TStorageArea, T>>;

export type TStorageStatic = Storage.Static;

export type TWindows = Partial<Browser["windows"]>;

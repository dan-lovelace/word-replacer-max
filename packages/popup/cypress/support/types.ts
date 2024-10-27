import { DeepPartial, StorageProvider } from "@worm/types";

export type VisitWithStorageParams = DeepPartial<Record<StorageProvider, any>>;

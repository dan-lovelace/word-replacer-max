import { DeepPartial } from "@worm/types";
import { StorageProvider } from "@worm/types/src/storage";

export type VisitWithStorageParams = DeepPartial<Record<StorageProvider, any>>;

import { DeepPartial } from "@wordreplacermax/types";
import { StorageProvider } from "@wordreplacermax/types/src/storage";

export type VisitWithStorageParams = DeepPartial<Record<StorageProvider, any>>;

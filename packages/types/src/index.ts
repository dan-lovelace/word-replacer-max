export type Sortable<T> = T & {
  sortIndex?: number;
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type SystemColor =
  | "black"
  | "blue"
  | "blueGray"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "red"
  | "white"
  | "yellow";

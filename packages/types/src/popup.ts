export type DomainEffect = "allow" | "deny";

export type ExportLink = {
  identifier: ReturnType<Date["getTime"]>;
  url: string;
};

export type ImportEffect = "add" | "overwrite";

export type PopupAlertSeverity = "danger" | "info" | "success" | "warning";

export type PopupTab =
  | "account"
  | "domains"
  | "options"
  | "rules"
  | "sharing"
  | "support";

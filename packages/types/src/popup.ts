export type DomainEffect = "allow" | "deny";

export type ExportLink = {
  identifier: ReturnType<Date["getTime"]>;
  url: string;
};

export type PopupAlertSeverity = "danger" | "info" | "success" | "warning";

export type PopupTab = "account" | "domains" | "options" | "rules" | "support";

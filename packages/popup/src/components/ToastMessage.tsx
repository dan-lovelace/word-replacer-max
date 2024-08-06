import { VNode } from "preact";

type ToastMessageProps = {
  message: VNode | string;
  severity: "danger" | "info" | "success";
};

const severityIconMap: Record<ToastMessageProps["severity"], string> = {
  danger: "warning",
  info: "info",
  success: "check",
};

export default function ToastMessage({ message, severity }: ToastMessageProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <span className={`material-icons-sharp fs-6 text-${severity}`}>
        {severityIconMap[severity]}
      </span>
      <div className="d-flex align-items-center">{message}</div>
    </div>
  );
}

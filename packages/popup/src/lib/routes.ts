import { isFirefox } from "@worm/shared/src/browser";

export const CAN_UPLOAD_PARAMETER = "u";
export const NOTIFY_PARAMETER = "msg";

export function getCanUploadDirect() {
  if (!isFirefox()) return true;

  try {
    const search = new URLSearchParams(window.location.search);

    return search.get(CAN_UPLOAD_PARAMETER)?.toLowerCase() === "true";
  } catch (err) {
    return true;
  }
}

export function getURLNotificationMessage() {
  return (
    new URLSearchParams(window.location.search).get(NOTIFY_PARAMETER) ??
    undefined
  );
}

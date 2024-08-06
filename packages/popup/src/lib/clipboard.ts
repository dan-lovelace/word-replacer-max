import { logDebug } from "@worm/shared";

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch (error) {
    logDebug("Error copying to clipboard", error);
  }

  return false;
}

export async function canWriteToClipboard() {
  if (!navigator || !navigator.permissions || !navigator.clipboard) {
    return false;
  }

  try {
    const copyQuery = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    });

    return copyQuery.state === "granted";
  } catch (error) {
    // only supported in Chromium browsers
  }

  return (
    navigator.clipboard.hasOwnProperty("writeText") &&
    typeof navigator.clipboard.writeText === "function"
  );
}

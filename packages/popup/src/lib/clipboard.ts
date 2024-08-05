import { logDebug } from "@worm/shared";

export function copyToClipboard(text: string) {
  try {
    navigator.clipboard.writeText(text);

    return true;
  } catch (error) {
    logDebug("Error copying to clipboard", error);
  }

  return false;
}

export async function getClipboardCopyPermission() {
  if (!navigator || !navigator.permissions) {
    return false;
  }

  try {
    const copyQuery = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    });

    return copyQuery.state === "granted";
  } catch (error) {
    logDebug("Error querying clipboard permissions", error);
  }

  return false;
}

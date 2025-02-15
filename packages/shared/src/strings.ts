export const QUERY_PASTE_DELIMITER = "\n";

export function capitalize(string = "") {
  return `${string.charAt(0).toUpperCase()}${string.substring(1)}`;
}

export function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase();
}

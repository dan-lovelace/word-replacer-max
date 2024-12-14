export const QUERY_PASTE_DELIMITER = "\n";

export function capitalize(string = "") {
  return `${string.charAt(0).toUpperCase()}${string.substring(1)}`;
}

export function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase();
}

export function parseDelimitedString(input: string) {
  const items: string[] = [];
  let currentItem = "";
  let insideQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      // end of an item - add it to our list and reset
      items.push(currentItem.trim());
      currentItem = "";
    } else {
      currentItem += char;
    }
  }

  // don't forget the last item
  if (currentItem) {
    items.push(currentItem.trim());
  }

  // clean up quotes from the items
  const unquoted = items.map((item) => item.replace(/^"(.*)"$/, "$1"));

  // clean up empty queries
  const filtered = unquoted.filter(Boolean);

  return filtered;
}

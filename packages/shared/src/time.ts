export function formatUnixTimestamp(timestamp: ReturnType<Date["getTime"]>) {
  try {
    const date = new Date(timestamp);

    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  } catch (error) {}

  return "[Invalid Date]";
}

export const LOGGING_PREFIX = `\x1b[38;2;255;102;0mWRM\x1b[0m [${new Date().toUTCString()}]`;

export function logDebug(...data: any[]) {
  console.log(
    `${LOGGING_PREFIX}\n>`,
    "color: #ff6600",
    "color: unset",
    ...data
  );
}

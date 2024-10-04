export function logDebug(...data: any[]) {
  console.log(
    `${new Date().toUTCString()} %cWRM%c:`,
    "color: #ff6600",
    "color: unset",
    ...data
  );
}

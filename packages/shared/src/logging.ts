export function logDebug(...data: any[]) {
  console.log(
    `%cWRM%c ${new Date().toUTCString()}\n>`,
    "color: #ff6600",
    "color: unset",
    ...data
  );
}

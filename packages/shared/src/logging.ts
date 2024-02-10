export function logDebug(...data: any[]) {
  console.log("%cWRM%c:", "color: #ff6600", "color: unset", ...data);
}

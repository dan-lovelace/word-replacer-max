export function logDebug(...data: any[]) {
  console.log("%cTCC%c:", "color: #ff6600", "color: unset", ...data);
}

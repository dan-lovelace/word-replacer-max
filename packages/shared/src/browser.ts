export { default as browser } from "webextension-polyfill";

export function isFirefox() {
  return /firefox/i.test(navigator.userAgent);
}

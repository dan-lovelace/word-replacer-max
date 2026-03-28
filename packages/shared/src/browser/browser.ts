import { browser } from "./browser";
import { BrowserCommand } from "./commands";

export { default as browser } from "webextension-polyfill";

export type BrowserName = "chrome" | "firefox" | "edge" | "unknown";

export type ShortcutKey = string;

export function detectBrowser(): BrowserName {
  if (
    typeof (window as any).browser !== "undefined" &&
    (window as any).browser?.runtime
  ) {
    return "firefox";
  }

  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("Chrome/")) return "chrome";

  return "unknown";
}

export function isFirefox() {
  return detectBrowser() === "firefox";
}

export async function getCommandShortcut(
  commandName: BrowserCommand
): Promise<string | null> {
  if (!browser?.commands?.getAll) return null;

  const commands = await browser.commands.getAll();
  const match = commands.find((c) => c.name === commandName);

  return match?.shortcut || null;
}

export async function openShortcutSettings(): Promise<void> {
  const detected = detectBrowser();

  if (detected === "firefox") {
    // Firefox-only API; opens the shortcuts panel inside about:addons
    await (browser.commands as any).openShortcutSettings();
    return;
  }

  const urlMap: Record<Exclude<BrowserName, "firefox">, string> = {
    chrome: "chrome://extensions/shortcuts",
    edge: "edge://extensions/shortcuts",
    unknown: "chrome://extensions/shortcuts",
  };

  await browser.tabs.create({ url: urlMap[detected] });
}

export function parseShortcutKeys(shortcut: ShortcutKey | null): ShortcutKey[] {
  if (!shortcut) return [];

  return shortcut.split("+").map((key) => (key === "MacCtrl" ? "Ctrl" : key));
}

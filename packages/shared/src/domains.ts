import { SyncStorage } from "@worm/types/src/storage";

function locationMatchesDomainList(domainList: SyncStorage["domainList"]) {
  return Boolean(
    domainList?.some((domain) => window.location.hostname.includes(domain))
  );
}

export function formatDomainInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed || trimmed.length === 0) {
    return undefined;
  }

  const hostnameRegex = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)$/;

  try {
    const url = new URL(trimmed);

    if (!hostnameRegex.test(url.hostname.split(".")[0])) {
      return undefined;
    }

    return url.hostname;
  } catch (e) {
    // remove any protocol prefix
    let cleaned = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "");

    // remove anything after the first slash, question mark, or hash
    cleaned = cleaned.split(/[/?#]/)[0];

    // validate the hostname portion (before any TLD)
    const mainPart = cleaned.split(".")[0];
    if (!hostnameRegex.test(mainPart)) {
      return undefined;
    }

    // return undefined if nothing left after cleaning
    if (!cleaned || cleaned.length === 0) {
      return undefined;
    }

    return cleaned;
  }
}

export function isDomainAllowed(
  domainList: SyncStorage["domainList"],
  preferences: SyncStorage["preferences"]
) {
  if (!domainList || domainList.length === 0) {
    return true;
  }

  const locationMatch = locationMatchesDomainList(domainList);
  let isAllowed = false;

  switch (preferences?.domainListEffect) {
    case "allow": {
      isAllowed = locationMatch;
      break;
    }

    case "deny": {
      isAllowed = !locationMatch;
      break;
    }
  }

  return isAllowed;
}

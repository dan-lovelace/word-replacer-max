import { SyncStorage } from "@worm/types/src/storage";

function locationMatchesDomainList(domainList: SyncStorage["domainList"]) {
  return Boolean(
    domainList?.some((domain) => window.location.hostname.includes(domain))
  );
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

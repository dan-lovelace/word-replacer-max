import { Storage } from "@worm/types";

function locationMatchesDomainList(domainList: Storage["domainList"]) {
  return Boolean(
    domainList?.some((domain) => window.location.hostname.includes(domain))
  );
}

export function isDomainAllowed(
  domainList: Storage["domainList"],
  preferences: Storage["preferences"]
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

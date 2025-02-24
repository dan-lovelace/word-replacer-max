import {
  initializeServiceWorker,
} from "@worm/shared/src/browser/service-worker";

/**
 * In Firefox, the service worker is started in the offscreen page.
 */
initializeServiceWorker();

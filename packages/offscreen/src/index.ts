import { browser, sendConnectMessage } from "@worm/shared/src/browser";
import { handleReplaceRequest } from "@worm/shared/src/replace/replace-html";
import {
  HTMLReplaceRequest,
  RuntimeMessage,
  RuntimeMessageKind,
} from "@worm/types/src/message";

console.log("Offscreen script loaded");

function main() {
  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (message) => {
      const event = message as RuntimeMessage<RuntimeMessageKind>;

      if (
        event.data.targets !== undefined &&
        !event.data.targets.includes("offscreen")
      ) {
        return;
      }

      switch (event.data.kind) {
        case "htmlReplaceRequest": {
          const replaceRequest = event.data.details as HTMLReplaceRequest;

          // TODO: process HTML
          const responseData = handleReplaceRequest(replaceRequest);

          console.log("responding", responseData);

          sendConnectMessage(
            "offscreen",
            "htmlReplaceResponse",
            {
              data: responseData,
            },
            ["background"]
          );
          break;
        }
      }
    });
  });

  browser.runtime.connect();
}

main();

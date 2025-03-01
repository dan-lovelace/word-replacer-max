import {
  HTMLReplaceRequest,
  HTMLReplaceResponse,
} from "@worm/types/src/message";

export function handleReplaceRequest(
  request: HTMLReplaceRequest
): HTMLReplaceResponse {
  console.log("replace request", request);

  return request.strings;
}

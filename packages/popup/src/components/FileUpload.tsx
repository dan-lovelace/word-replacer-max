import { useMemo } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import {
  CAN_UPLOAD_PARAMETER,
  NOTIFY_PARAMETER,
  ROUTES,
  canUploadDirect,
} from "../lib/routes";
import { useLanguage } from "../lib/language";

type FileUploadProps = {
  onChange: (event: JSXInternal.TargetedInputEvent<HTMLInputElement>) => void;
};

const WRAPPER_CLASSNAME = "btn btn-secondary btn-sm";

export default function FileUpload({ onChange }: FileUploadProps) {
  const _canUploadDirect = useMemo(canUploadDirect, []);
  const language = useLanguage();
  const message = encodeURIComponent(language.options.DIRECT_UPLOAD_DISALLOWED);

  return _canUploadDirect ? (
    <label className={WRAPPER_CLASSNAME}>
      Import
      <input accept=".json" hidden type="file" onChange={onChange} />
    </label>
  ) : (
    <a
      className={WRAPPER_CLASSNAME}
      href={`${ROUTES.HOME}?${CAN_UPLOAD_PARAMETER}=true&${NOTIFY_PARAMETER}=${message}`}
      target="_blank"
    >
      Import
    </a>
  );
}

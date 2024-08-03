import { useMemo } from "preact/hooks";
import type { JSXInternal } from "preact/src/jsx";

import { POPUP_ROUTES } from "@worm/shared";

import {
  CAN_UPLOAD_PARAMETER,
  NOTIFY_PARAMETER,
  canUploadDirect,
} from "../lib/routes";
import { useLanguage } from "../lib/language";

type FileUploadProps = {
  onChange: (event: JSXInternal.TargetedInputEvent<HTMLInputElement>) => void;
};

const WRAPPER_CLASSNAME = "btn btn-secondary";

function Content() {
  return (
    <span className="d-flex align-items-center gap-1">
      <i className="material-icons-sharp fs-sm">download</i>
      Import
    </span>
  );
}

export default function FileInput({ onChange }: FileUploadProps) {
  const _canUploadDirect = useMemo(canUploadDirect, []);
  const language = useLanguage();
  const message = encodeURIComponent(language.options.DIRECT_UPLOAD_DISALLOWED);

  return _canUploadDirect ? (
    <label className={WRAPPER_CLASSNAME}>
      <Content />
      <input accept=".json" hidden type="file" onChange={onChange} />
    </label>
  ) : (
    <a
      className={WRAPPER_CLASSNAME}
      href={`${POPUP_ROUTES.HOME}?${CAN_UPLOAD_PARAMETER}=true&${NOTIFY_PARAMETER}=${message}`}
      target="_blank"
    >
      <Content />
    </a>
  );
}

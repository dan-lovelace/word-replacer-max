import { useMemo } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { POPUP_ROUTES } from "@worm/shared/src/browser";

import { useLanguage } from "../lib/language";
import {
  CAN_UPLOAD_PARAMETER,
  getCanUploadDirect,
  NOTIFY_PARAMETER,
} from "../lib/routes";

import MaterialIcon from "./icon/MaterialIcon";

type FileUploadProps = {
  onChange: (event: JSXInternal.TargetedInputEvent<HTMLInputElement>) => void;
};

const WRAPPER_CLASSNAME = "btn btn-outline-secondary";

function Content() {
  return (
    <span className="d-flex align-items-center gap-2">
      <MaterialIcon name="download" />
      Import from file
    </span>
  );
}

export default function FileInput({ onChange }: FileUploadProps) {
  const canUploadDirect = useMemo(getCanUploadDirect, []);
  const language = useLanguage();
  const message = encodeURIComponent(language.options.DIRECT_UPLOAD_DISALLOWED);

  return canUploadDirect ? (
    <label className={WRAPPER_CLASSNAME} data-testid="file-input__label">
      <Content />
      <input
        accept=".json,.csv"
        hidden
        type="file"
        onChange={onChange}
        data-testid="file-input__input"
      />
    </label>
  ) : (
    <a
      className={WRAPPER_CLASSNAME}
      href={`${POPUP_ROUTES.HOME}?${CAN_UPLOAD_PARAMETER}=true&${NOTIFY_PARAMETER}=${message}`}
      target="_blank"
      data-testid="file-input__upload-redirect"
    >
      <Content />
    </a>
  );
}

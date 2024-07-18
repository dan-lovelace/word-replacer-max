export const COPY_CONTAINER_COL_CLASS = "col col-sm-8 col-xxl-5";

export default function cx(...classes: any[]) {
  return classes
    .filter(Boolean)
    .map((s) => String(s).trim())
    .join(" ");
}

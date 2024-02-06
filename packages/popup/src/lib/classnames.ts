export default function cx(...classes: any[]) {
  return classes
    .filter(Boolean)
    .map((s) => String(s).trim())
    .join(" ");
}

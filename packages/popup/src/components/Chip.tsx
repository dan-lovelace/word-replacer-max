import { cx } from "@worm/shared";

import Button from "./button/Button";

type ChipProps = {
  disabled?: boolean;
  identifier: string;
  onRemove: (identifier: string) => () => void;
};

export default function Chip({
  disabled = false,
  identifier,
  onRemove,
}: ChipProps) {
  return (
    <span
      className={cx(
        "badge",
        "d-flex align-items-center flex-fill-0 pe-0",
        "fs-6 text-bg-light text-start text-wrap"
      )}
    >
      {identifier}
      <Button
        className="bg-transparent border-0 px-0 mx-1 text-body-tertiary"
        disabled={disabled}
        title="Remove search query"
        type="button"
        onClick={onRemove(identifier)}
      >
        <span className="d-flex align-items-center">
          <i className="material-icons-sharp fs-6">close</i>
        </span>
      </Button>
    </span>
  );
}

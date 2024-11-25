import { cx } from "@worm/shared";

import Button from "./button/Button";
import MaterialIcon from "./icon/MaterialIcon";

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
        className="btn btn-light bg-transparent border-0 px-0 py-0 mx-1 text-body-tertiary"
        disabled={disabled}
        title="Remove search query"
        type="button"
        onClick={onRemove(identifier)}
      >
        <span className="d-flex align-items-center">
          <MaterialIcon name="close" size="sm" />
        </span>
      </Button>
    </span>
  );
}

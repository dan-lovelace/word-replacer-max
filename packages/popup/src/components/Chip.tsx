import { cx } from "@worm/shared";

type ChipProps = {
  identifier: string;
  onRemove: (identifier: string) => () => void;
};

export default function Chip({ identifier, onRemove }: ChipProps) {
  return (
    <span
      className={cx(
        "badge",
        "d-flex align-items-center flex-fill-0 pe-0",
        "fs-6 text-bg-light text-start text-wrap"
      )}
    >
      {identifier}
      <button
        className="bg-transparent border-0 px-0 mx-1 text-body-tertiary"
        title="Remove search query"
        type="button"
        onClick={onRemove(identifier)}
      >
        <span className="d-flex align-items-center">
          <i className="material-icons-sharp fs-6">close</i>
        </span>
      </button>
    </span>
  );
}

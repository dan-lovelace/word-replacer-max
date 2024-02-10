type ChipProps = {
  identifier: string;
  onRemove: (identifier: string) => () => void;
};

export default function Chip({ identifier, onRemove }: ChipProps) {
  return (
    <span className="d-flex align-items-center badge fs-6 rounded-pill text-bg-light flex-fill-0 pe-0">
      {identifier}
      <button
        className="bg-transparent border-0"
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

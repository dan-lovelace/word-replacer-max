import { cx } from "@worm/shared";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeAffixes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "-sm",
  md: "",
  lg: "-lg",
};

export default function Spinner({ className = "", size = "md" }: SpinnerProps) {
  return (
    <span
      className={cx(
        `spinner-border spinner-border${sizeAffixes[size]}`,
        className
      )}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </span>
  );
}

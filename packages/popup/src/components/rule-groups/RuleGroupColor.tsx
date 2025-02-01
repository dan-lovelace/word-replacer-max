import { ComponentProps } from "preact";

type RuleGroupColorProps = ComponentProps<"span"> & {
  color: string;
};

export default function RuleGroupColor({
  color,
  ...rest
}: RuleGroupColorProps) {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: "100%",
        display: "inline-block",
        height: 10,
        outline: "1px solid var(--bs-border-color)",
        width: 10,
      }}
      {...rest}
      data-testid="rule-group-color"
    />
  );
}

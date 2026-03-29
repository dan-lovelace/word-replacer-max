import Button, { ButtonProps } from "./Button";

export default function TextButton(props: ButtonProps) {
  return (
    <Button
      className="border-0 bg-transparent p-0 text-decoration-underline"
      {...props}
    />
  );
}

import { ROUTES } from "../../lib/routes";

import { ButtonProps } from ".";
import Button from "./Button";

type SignupButtonProps = ButtonProps & {
  text?: string;
};

export default function SignupButton({ text = "Sign up" }: SignupButtonProps) {
  return (
    <a href={ROUTES.SIGNUP}>
      <Button variant="primary">{text}</Button>
    </a>
  );
}

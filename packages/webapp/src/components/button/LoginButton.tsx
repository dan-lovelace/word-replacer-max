import { ROUTES } from "../../lib/routes";

import { ButtonProps } from ".";
import Button from "./Button";

type LoginButtonProps = ButtonProps & {
  text?: string;
};

export default function LoginButton({ text = "Log in" }: LoginButtonProps) {
  return (
    <a href={ROUTES.LOGIN}>
      <Button>{text}</Button>
    </a>
  );
}

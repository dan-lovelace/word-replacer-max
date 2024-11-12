import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

import { ButtonProps } from "./";
import Button from "./Button";

type LoginButtonProps = ButtonProps & {
  text?: string;
};

export default function LoginButton({ text = "Log in" }: LoginButtonProps) {
  return (
    <Link to={ROUTES.LOGIN}>
      <Button>{text}</Button>
    </Link>
  );
}

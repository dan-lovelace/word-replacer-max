import { ROUTES } from "../../lib/routes";

import Link from "../link/Link";

import { ButtonProps } from ".";
import Button from "./Button";

type SignupButtonProps = ButtonProps & {
  text?: string;
};

export default function SignupButton({ text = "Sign up" }: SignupButtonProps) {
  return (
    <Link to={ROUTES.SIGNUP}>
      <Button variant="outlined">{text}</Button>
    </Link>
  );
}

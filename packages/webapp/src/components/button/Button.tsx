import MuiButton from "@mui/material/Button";

import { ButtonProps } from ".";

export default function Button({ className, ...rest }: ButtonProps) {
  return <MuiButton {...rest} />;
}

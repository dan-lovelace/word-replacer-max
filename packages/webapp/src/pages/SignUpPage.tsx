import Redirect from "../components/link/Redirect";
import { getOAuthUrl } from "../lib/auth";

export default function SignUpPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={getOAuthUrl("signup")}
    />
  );
}

import Redirect from "../components/link/Redirect";
import { getOauthUrl } from "../lib/auth";

export default function SignUpPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={getOauthUrl("signup")}
    />
  );
}

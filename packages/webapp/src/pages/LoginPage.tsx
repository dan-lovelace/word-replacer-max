import Redirect from "../components/link/Redirect";
import { getOauthUrl } from "../lib/auth";

export default function LoginPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={getOauthUrl("authorize")}
    />
  );
}

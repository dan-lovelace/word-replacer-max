import Redirect from "../components/link/Redirect";
import { getOAuthUrl } from "../lib/auth";

export default function LoginPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={getOAuthUrl("authorize")}
    />
  );
}

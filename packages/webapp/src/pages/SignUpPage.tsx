import Redirect from "../components/link/Redirect";
import PageLoader from "../components/loader/PageLoader";
import { getOAuthUrl } from "../lib/auth";

export default function SignUpPage() {
  return (
    <>
      <PageLoader heading="Redirecting..." />
      <Redirect
        options={{ isExternal: true, replace: true }}
        to={getOAuthUrl("signup")}
      />
    </>
  );
}

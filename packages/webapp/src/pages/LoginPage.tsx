import Redirect from "../components/link/Redirect";

export default function LoginPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={import.meta.env.VITE_SIGN_IN_URL}
    />
  );
}

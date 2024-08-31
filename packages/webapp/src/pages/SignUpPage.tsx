import Redirect from "../components/link/Redirect";

export default function SignUpPage() {
  return (
    <Redirect
      options={{ isExternal: true, replace: true }}
      to={import.meta.env.VITE_SIGN_UP_URL}
    />
  );
}

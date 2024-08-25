const loginUrl =
  "https://dev-auth.wordreplacermax.com/login?client_id=38h4e0l29obapljs8nosa647l9&response_type=code&scope=email+openid&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin%2Fcallback";

export default function LoginPage() {
  return (
    <>
      <a href={loginUrl}>Go to login</a>
    </>
  );
}

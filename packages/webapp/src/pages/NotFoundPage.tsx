import Link from "../components/link/Link";
import { ROUTES } from "../lib/routes";

export default function NotFoundPage() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>
        <Link to={ROUTES.HOME}>Go home</Link>
      </p>
    </div>
  );
}

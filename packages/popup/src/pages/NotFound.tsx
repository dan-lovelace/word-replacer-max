import { ROUTES } from "../lib/routes";

export default function NotFoundPage() {
  return (
    <div>
      <h1>Page Not Found</h1>
      <p>
        <a href={ROUTES.HOME}>Go Home</a>
      </p>
    </div>
  );
}

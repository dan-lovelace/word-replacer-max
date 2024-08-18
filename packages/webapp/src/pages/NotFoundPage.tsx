import { ROUTES } from "../lib/routes";

export default function NotFoundPage() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>
        <a href={ROUTES.HOME}>Go home</a>
      </p>
    </div>
  );
}

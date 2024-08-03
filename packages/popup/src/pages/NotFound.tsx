import { POPUP_ROUTES } from "@worm/shared";

export default function NotFoundPage() {
  return (
    <div>
      <h1>Page Not Found</h1>
      <p>
        <a href={POPUP_ROUTES.HOME}>Go Home</a>
      </p>
    </div>
  );
}

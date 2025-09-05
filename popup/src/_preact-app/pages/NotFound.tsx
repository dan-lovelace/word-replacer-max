import { POPUP_ROUTES } from "@web-extension/shared/src/browser";

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

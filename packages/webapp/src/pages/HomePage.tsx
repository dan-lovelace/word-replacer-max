import Button from "../components/button/Button";
import { useConnectionProvider } from "../lib/connection/ConnectionProvider";

export default function HomePage() {
  const { appUser, sendMessage } = useConnectionProvider();

  const handleTestClick = () => {
    sendMessage({
      kind: "authUserRequest",
    });
  };

  return (
    <div>
      <div>User: {JSON.stringify(appUser, null, 2)}</div>
      <Button onClick={handleTestClick}>Test</Button>
    </div>
  );
}

import { useConfig } from "../store/Config";

export default function Debug() {
  const config = useConfig();

  return <div>{JSON.stringify(config, null, 2)}</div>;
}

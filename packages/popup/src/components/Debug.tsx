import { useContext } from "preact/hooks";

import { Config } from "../store/Config";

export default function Debug() {
  const config = useContext(Config);

  return <div>{JSON.stringify(config, null, 2)}</div>;
}

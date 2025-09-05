import { useState } from "react";

import { useLanguage } from "./lib/i18n";

export default function App() {
  const [is, setIs] = useState(false);

  const { t } = useLanguage();

  return (
    <div>
      <div>{t("extensionName")}</div>
      <div>
        <div>{is.toString()}</div>
        <button onClick={() => setIs(!is)}>Toggle</button>
      </div>
    </div>
  );
}

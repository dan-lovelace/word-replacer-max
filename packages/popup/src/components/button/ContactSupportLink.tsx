import { cx } from "@worm/shared";
import { storageSetByKeys } from "@worm/shared/src/storage";

import { useConfig } from "../../store/Config";

import Button, { ButtonProps } from "./Button";

type ContactSupportLinkProps = ButtonProps;

export default function ContactSupportLink({
  children,
  className,
  style,
}: ContactSupportLinkProps) {
  const {
    storage: { preferences },
  } = useConfig();

  const handleClick = () => {
    const newPreferences = Object.assign({}, preferences);
    newPreferences.activeTab = "support";

    storageSetByKeys({ preferences: newPreferences });
  };

  return (
    <Button
      className={cx("btn btn-link btn-sm p-0 text-nowrap", className)}
      onClick={handleClick}
      style={style}
    >
      {children}
    </Button>
  );
}

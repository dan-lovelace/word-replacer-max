import { PreactChildren } from "../../lib/types";

type MenuItemProps = {
  icon?: string;
  children: PreactChildren;
};

export default function MenuItem({ icon, children }: MenuItemProps) {
  return (
    <span className="d-flex align-items-center gap-3 py-1">
      {icon !== undefined && (
        <span className="material-icons-sharp">{icon}</span>
      )}
      {children}
    </span>
  );
}

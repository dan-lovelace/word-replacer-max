import { createContext } from "preact";
import { useContext } from "preact/hooks";

type DropdownContextType = {
  closeDropdown: () => void;
};

export const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
);

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a DropdownButton");
  }
  return context;
};

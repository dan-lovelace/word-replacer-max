import { useState } from "react";

import IconButton from "@mui/material/IconButton/IconButton";
import Menu from "@mui/material/Menu/Menu";
import MenuItem from "@mui/material/MenuItem/MenuItem";

import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

export default function CurrentUser() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { appUser } = useConnectionProvider();

  const isOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {appUser && (
        <>
          <IconButton
            aria-controls={isOpen ? "current-user-menu" : undefined}
            aria-expanded={isOpen ? "true" : undefined}
            aria-haspopup="true"
            id="current-user-button"
            size="small"
            onClick={handleClick}
          >
            <span className="material-icons-sharp">account_circle</span>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="current-user-menu"
            MenuListProps={{
              "aria-labelledby": "current-user-button",
            }}
            open={isOpen}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Sign out</MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}

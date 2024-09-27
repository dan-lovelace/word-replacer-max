import { useState } from "react";

import Box from "@mui/material/Box/Box";
import Divider from "@mui/material/Divider/Divider";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import Menu from "@mui/material/Menu/Menu";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Typography from "@mui/material/Typography/Typography";

import { createWebAppMessage } from "@worm/shared";

import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

export default function CurrentUser() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { appUser, sendMessage } = useConnectionProvider();

  const isOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOutClick = () => {
    sendMessage(createWebAppMessage("authSignOutRequest"));
    handleClose();
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
            <Box sx={{ pb: 1, px: 2.5 }}>
              <Typography variant="body2">Logged in as</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {appUser.email}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <MenuItem onClick={handleSignOutClick}>
              <ListItemIcon>
                <span className="material-icons-sharp">logout</span>
              </ListItemIcon>
              <ListItemText>Sign out</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}

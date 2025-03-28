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

import { useAuthProvider } from "../../lib/auth/AuthProvider";
import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

import MaterialIcon from "../icon/MaterialIcon";

export default function CurrentUser() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { appUser, signInStatus, setSignInStatus } = useAuthProvider();
  const { sendMessage } = useConnectionProvider();

  const isOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOutClick = () => {
    sendMessage(createWebAppMessage("authSignOutRequest"));
    setSignInStatus("signingOut");
    handleClose();
  };

  return (
    <>
      {signInStatus === "signedIn" && appUser && (
        <>
          <IconButton
            aria-controls={isOpen ? "current-user-menu" : undefined}
            aria-expanded={isOpen ? "true" : undefined}
            aria-haspopup="true"
            aria-label="Open user menu"
            id="current-user-button"
            size="small"
            onClick={handleClick}
          >
            <MaterialIcon>account_circle</MaterialIcon>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              horizontal: "right",
              vertical: "bottom",
            }}
            id="current-user-menu"
            MenuListProps={{
              "aria-labelledby": "current-user-button",
            }}
            open={isOpen}
            transformOrigin={{
              horizontal: "right",
              vertical: "top",
            }}
            onClose={handleClose}
          >
            <Box sx={{ minWidth: 300, pb: 1, px: 2.5 }}>
              <Typography variant="body2">Logged in as</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {appUser.email}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <MenuItem onClick={handleSignOutClick}>
              <ListItemIcon>
                <MaterialIcon>logout</MaterialIcon>
              </ListItemIcon>
              <ListItemText>Sign out</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}

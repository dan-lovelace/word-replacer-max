import blueGrey from "@mui/material/colors/blueGrey";
import type { ThemeOptions } from "@mui/material/styles/createTheme";

export const muiTheme: ThemeOptions = {
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
          "&:active": {
            boxShadow: "none",
          },
        },
      },
    },
  },
  palette: {
    primary: { main: blueGrey[500] },
  },
};

import { forwardRef, ReactNode } from "react";

import Box, { BoxProps } from "@mui/material/Box/Box";
import { visuallyHidden } from "@mui/utils";

import { cx } from "@worm/shared";

type IconProps = BoxProps & {
  children: ReactNode;
};

const MaterialIcon = forwardRef<HTMLDivElement, IconProps>(
  ({ "aria-label": ariaLabel, children, className, sx, ...rest }, ref) => {
    return (
      <Box
        aria-hidden="true"
        ref={ref}
        sx={{
          alignItems: "center",
          display: "inline-flex",
          ...sx,
        }}
        {...rest}
      >
        <Box component="span" className={cx("material-icons-sharp", className)}>
          {children}
        </Box>
        {Boolean(ariaLabel) && (
          <Box component="span" sx={visuallyHidden}>
            {ariaLabel}
          </Box>
        )}
      </Box>
    );
  }
);

export default MaterialIcon;

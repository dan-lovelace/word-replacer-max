import { forwardRef } from "react";

import Box, { BoxProps } from "@mui/material/Box/Box";

type HeroProps = BoxProps & {};

const Hero = forwardRef<HTMLDivElement, HeroProps>(
  ({ children, sx, ...rest }, ref) => (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 15 },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
);

export default Hero;

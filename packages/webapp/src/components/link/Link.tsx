import { forwardRef, useMemo } from "react";
import { Link as RRLink, LinkProps as RRLinkProps } from "react-router-dom";

import MUILink from "@mui/material/Link/Link";
import { SxProps } from "@mui/system/styleFunctionSx/styleFunctionSx";

type LinkProps = RRLinkProps & {
  sx?: SxProps;
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ sx = {}, ...rrProps }, ref) => {
    const MUIComponent = useMemo(
      () =>
        forwardRef<HTMLAnchorElement, RRLinkProps>((props, innerRef) => (
          <RRLink ref={innerRef} {...props} {...rrProps} />
        )),
      [rrProps]
    );

    return (
      <MUILink
        component={MUIComponent}
        underline="none"
        ref={ref}
        sx={sx}
        {...rrProps}
      />
    );
  }
);

Link.displayName = "Link";

export default Link;

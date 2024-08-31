import { Link as RRLink, LinkProps as RRLinkProps } from "react-router-dom";

type LinkProps = RRLinkProps & {};

export default function Link(props: LinkProps) {
  return <RRLink {...props} />;
}

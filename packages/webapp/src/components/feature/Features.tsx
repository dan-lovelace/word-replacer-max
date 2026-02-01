import Feature from "./Feature";

type FeaturesProps = {};

const features = [
  {
    color: "#fee440",
    heading: "Powerful Text Replacement",
    id: "rules",
    subheading: "Match by case, whole word and regular expression",
  },
  {
    color: "#00bbf9",
    heading: "Flexible Domain Settings",
    id: "domains",
    subheading: "Choose where replacements occur with site-specific control",
  },
  {
    color: "#f15bb5",
    heading: "Shareable Rules",
    id: "share",
    subheading: "Share your replacement rules with friends and teammates",
  },
  // NOTE: Next color: "#00f5d4"
  // NOTE: Next color: "#9b5de5"
];

export default function Features({}: FeaturesProps) {
  return (
    <>
      {features.map(({ color, heading, id, subheading }) => (
        <Feature
          color={color}
          heading={heading}
          imgSrc={`/screens-${id}.png`}
          key={id}
          subheading={subheading}
        />
      ))}
    </>
  );
}

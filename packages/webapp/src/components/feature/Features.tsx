import Feature from "./Feature";

type FeaturesProps = {};

const features = [
  {
    color: "#fee440",
    heading: "Personalized replacement rules",
    id: "rules",
    subheading: "Match by case, whole word and regular expression",
  },
  {
    color: "#00bbf9",
    heading: "Flexible domain settings",
    id: "domains",
    subheading: "Choose where replacements occur with site-specific control",
  },
  {
    color: "#f15bb5",
    heading: "Shareable rulesets",
    id: "share",
    subheading: "Share your rules with friends and teammates",
  },
  {
    color: "#00f5d4",
    heading: "AI replacement suggestions",
    id: "ai-suggestions",
    subheading:
      "Leverage the power of AI to get replacement inspiration in your chosen style",
  },
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

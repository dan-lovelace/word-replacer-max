import { motion, Variants } from "motion/react";

import Box from "@mui/material/Box/Box";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Hero from "../../containers/Hero";

type FeatureProps = {
  color: string;
  heading: string;
  imgSrc: string;
  subheading: string;
};

const motionVariants: Variants = {
  offscreen: {
    scale: 0.8,
  },
  onscreen: {
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

export default function Feature({
  color,
  heading,
  imgSrc,
  subheading,
}: FeatureProps) {
  const { shadows } = useTheme();

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.8 }}
    >
      <Hero>
        <Stack>
          <Box sx={{ mx: "auto", textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: 500, mb: 1 }}>
              {heading}
            </Typography>
            <Typography variant="h6" sx={{ mb: 10 }}>
              {subheading}
            </Typography>
            <motion.div variants={motionVariants}>
              <Box
                sx={{
                  display: "flex",
                  position: "relative",
                  px: 4,
                }}
              >
                <Box
                  sx={{
                    aspectRatio: 1,
                    borderRadius: "50%",
                    height: "105%",
                    left: "50%",
                    outline: "40px solid",
                    outlineColor: color,
                    position: "absolute",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                  }}
                />
                <Box
                  component="img"
                  src={imgSrc}
                  sx={{
                    borderRadius: 2,
                    boxShadow: shadows[10],
                    position: "relative",
                    width: 1,
                    zIndex: 1,
                  }}
                />
              </Box>
            </motion.div>
          </Box>
        </Stack>
      </Hero>
    </motion.div>
  );
}

import { motion, Variants } from "motion/react";

import Box from "@mui/material/Box/Box";
import teal from "@mui/material/colors/teal";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Hero from "../../containers/Hero";

type FeatureProps = {
  heading: string;
  imgSrc: string;
  subheading: string;
};

const motionVariants: Variants = {
  offscreen: {
    y: 200,
  },
  onscreen: {
    y: 50,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

export default function Feature({ heading, imgSrc, subheading }: FeatureProps) {
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              {subheading}
            </Typography>
            <motion.div variants={motionVariants}>
              <Box sx={{ position: "relative", px: { xs: 2, sm: 4 } }}>
                <Box
                  sx={{
                    aspectRatio: 1,
                    borderRadius: "50%",
                    height: "102%",
                    left: "50%",
                    outline: "40px solid",
                    outlineColor: teal.A700,
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

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { motion, Variants } from "motion/react";

import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import popper from "../assets/popper.png";
import Link from "../components/link/Link";
import Hero from "../containers/Hero";
import { ROUTES } from "../lib/routes";

const REDIRECT_TIMEOUT_SECONDS = 18;

const motionVariants: Variants = {
  offscreen: {
    scale: 0.5,
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

export default function LoginSuccessPage() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_TIMEOUT_SECONDS);

  const navigate = useNavigate();
  const secondsLeftRef = useRef<number>();
  const { palette } = useTheme();

  secondsLeftRef.current = secondsLeft;

  useEffect(() => {
    const redirectTimer = setInterval(() => {
      if (!secondsLeftRef.current) return;

      if (secondsLeftRef.current <= 1) {
        clearInterval(redirectTimer);
        navigate(ROUTES.HOME, { replace: true });
      }

      setSecondsLeft(secondsLeftRef.current - 1);
    }, 1000);

    return () => clearInterval(redirectTimer);
  }, []);

  const handleImageLoad = () => {
    if (isImageLoaded) return;

    setIsImageLoaded(true);
  };

  return (
    <Container sx={{ display: isImageLoaded ? "block" : "none" }}>
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.8 }}
      >
        <motion.div variants={motionVariants}>
          <Hero>
            <Stack
              maxWidth="md"
              sx={{
                alignItems: "center",
                mx: "auto",
                textAlign: "center",
              }}
            >
              <Typography
                component="h1"
                gutterBottom
                variant="h2"
                sx={{ fontWeight: 600 }}
              >
                Sign in success
              </Typography>
              <Box
                sx={{
                  color: palette.success.dark,
                  mb: { xs: 2, md: 4 },
                }}
              >
                <Box
                  component="img"
                  src={popper}
                  sx={{ width: { xs: 84, md: 128 } }}
                  onLoad={handleImageLoad}
                />
              </Box>
              <Container maxWidth="sm">
                <Typography variant="h6">
                  You've successfully signed in to the extension.
                </Typography>
                <Typography variant="h6" sx={{ mb: 5 }}>
                  You may now close this window.
                </Typography>
                <Typography gutterBottom variant="body2">
                  Returning to homepage in a moment...
                </Typography>
                <Typography variant="body2">
                  <Link to={ROUTES.HOME} replace={true}>
                    Skip waiting and go now
                  </Link>
                </Typography>
              </Container>
            </Stack>
          </Hero>
        </motion.div>
      </motion.div>
    </Container>
  );
}

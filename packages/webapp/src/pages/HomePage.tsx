import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box/Box";
import heroColor from "@mui/material/colors/blueGrey";
import Container from "@mui/material/Container/Container";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Features from "../components/feature/Features";
import NewsletterSignup from "../components/form/NewsletterSignup";
import StoreLinks from "../components/link/StoreLinks";
import UserReviews from "../components/user-reviews/UserReviews";
import Hero from "../containers/Hero";

export default function HomePage() {
  const [heroHeight, setHeroHeight] = useState<string>("100dvh");
  const [isInitialized, setIsInitialized] = useState(false);
  const [windowHeight, setWindowHeight] = useState<number>();

  const heroRef = useRef<HTMLDivElement>(null);
  const heroRefCurrent = heroRef.current;

  useEffect(() => {
    function resizeListener(event: UIEvent) {
      const heroHeightValue =
        heroRefCurrent?.getBoundingClientRect().height ?? -1;
      const currentWindowHeight =
        windowHeight ?? (event.currentTarget as Window).innerHeight;

      if (currentWindowHeight > 0) {
        setWindowHeight(currentWindowHeight);
      }

      const triggerHeight = currentWindowHeight - 100;

      if (!isInitialized) {
        setIsInitialized(true);
      }

      if (triggerHeight > heroHeightValue) {
        return setHeroHeight(`${triggerHeight}px`);
      }

      setHeroHeight(`${Math.round(heroHeightValue)}px`);
    }

    window.addEventListener("resize", resizeListener);
    window.dispatchEvent(new Event("resize"));

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, [heroRefCurrent]);

  return (
    <>
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: heroColor[900],
          display: "flex",
          height: heroHeight,
          justifyContent: "center",
          opacity: isInitialized ? 1 : 0,
          transition: "opacity 40ms 140ms",
        }}
      >
        <Hero ref={heroRef}>
          <Container maxWidth="lg" sx={{ textAlign: "center" }}>
            <Typography
              component="h1"
              gutterBottom
              variant="h2"
              sx={{
                fontWeight: 600,
              }}
            >
              Your web, your words
            </Typography>
            <Container>
              <Typography
                variant="h6"
                sx={{ maxWidth: 660, mb: 8, mx: "auto" }}
              >
                A browser extension that automatically replaces text across
                websites as you browse. Visit the extension store to get started
                today.
              </Typography>
            </Container>
            <StoreLinks />
          </Container>
        </Hero>
      </Box>

      <Container>
        <Features />
      </Container>

      <Hero>
        <Container>
          <UserReviews />
        </Container>
      </Hero>

      <Hero sx={{ backgroundColor: heroColor[900] }}>
        <Container sx={{ textAlign: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              Ready to get started?
            </Typography>
            <Typography variant="h6">
              Visit the extension store today
            </Typography>
          </Box>
          <StoreLinks />
        </Container>
      </Hero>

      <Hero>
        <Container>
          <NewsletterSignup />
        </Container>
      </Hero>
    </>
  );
}

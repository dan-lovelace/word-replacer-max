import "./UserReviews.scss";

import Marquee from "react-fast-marquee";

import Box from "@mui/material/Box/Box";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent/CardContent";
import Grid2 from "@mui/material/Grid2/Grid2";
import Rating from "@mui/material/Rating/Rating";
import Stack from "@mui/material/Stack/Stack";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";
import useMediaQuery from "@mui/system/useMediaQuery/useMediaQuery";

import MaterialIcon from "../icon/MaterialIcon";

type UserReview = {
  author: string;
  rating: number;
  text: string;
};

const userReviews: UserReview[] = [
  {
    author: "Chrome user",
    rating: 5,
    text: "Mar 30, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "May 14, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Jun 18, 2024",
  },
  {
    author: "Firefox user",
    rating: 5,
    text: "Jul 21, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Jul 25, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Jul 30, 2024",
  },
  {
    author: "Firefox user",
    rating: 5,
    text: "Sep 3, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Sep 26, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Oct 6, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Oct 14, 2024",
  },
  {
    author: "Chrome user",
    rating: 5,
    text: "Oct 25, 2024",
  },
  {
    author: "Firefox user",
    rating: 5,
    text: "Nov 18, 2024",
  },
].reverse();

export default function UserReviews() {
  const { breakpoints, palette } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down(breakpoints.values.md));

  return (
    <Box id="user-reviews">
      <Typography
        variant="h4"
        sx={{ fontWeight: 500, mb: 2, textAlign: "center" }}
      >
        What our users are thinking
      </Typography>
      <Marquee
        className="user-reviews__marquee"
        gradient
        gradientColor={palette.background.default}
        pauseOnHover
        speed={isMobile ? 35 : 50}
      >
        {userReviews.map((review, idx) => (
          <Card
            key={`card-${idx}`}
            sx={{
              flex: "0 0 auto",
              mx: { xs: 1, md: 1.5 },
              my: 2,
              transition: "scale 0.3s",
              width: { xs: 185, md: 300 },
              "&:hover": {
                scale: 1.075,
              },
            }}
          >
            <CardContent>
              <Grid2 container spacing={1}>
                <Grid2 size={{ xs: 12, md: "grow" }}>
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    variant="subtitle2"
                  >
                    {review.text}
                  </Typography>
                  <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <Rating
                      icon={<MaterialIcon>star</MaterialIcon>}
                      name={`rating-${idx}`}
                      readOnly
                      value={review.rating}
                    />
                    <Typography color="text.secondary" variant="subtitle2">
                      {review.rating.toFixed(1)}
                    </Typography>
                  </Stack>
                </Grid2>
                <Grid2
                  size={{ xs: 12, md: "auto" }}
                  sx={{
                    alignItems: "end",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Typography color="text.secondary" variant="subtitle2">
                    <em>{review.author}</em>
                  </Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        ))}
      </Marquee>
    </Box>
  );
}

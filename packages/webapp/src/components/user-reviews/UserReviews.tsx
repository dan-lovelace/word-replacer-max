import Box from "@mui/material/Box/Box";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent/CardContent";
import Rating from "@mui/material/Rating/Rating";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

import Marquee from "react-fast-marquee";

import MaterialIcon from "../icon/MaterialIcon";

import "./UserReviews.scss";

type UserReview = {
  author: string;
  id: number;
  rating: number;
  text: string;
};

const userReviews: UserReview[] = [
  {
    author: "Chrome user",
    id: 1,
    rating: 5,
    text: "Exactly as advertised! Better than the other extensions for this!",
  },
  {
    author: "Chrome user",
    id: 2,
    rating: 5,
    text: "Works exactly as advertised. Doesn't require knowledge of RegEx for case-sensitive replacement or to match whole words.",
  },
  {
    author: "Chrome user",
    id: 3,
    rating: 5,
    text: "Thanks for this awesome replacer, it's really bloody helpful.",
  },
  {
    author: "Chrome user",
    id: 4,
    rating: 5,
    text: "Exactly what I needed and the fact that you can choose for it to be NOT case sensitive is even better as it saves a lot of time.",
  },
  {
    id: 5,
    text: "So good! Really easy to use and quite customisable!! I love it :)",
    author: "Chrome user",
    rating: 5,
  },
  {
    id: 6,
    text: "Just wanted to say Word Replacer Max is awesome...",
    author: "Chrome user",
    rating: 5,
  },
];

export default function UserReviews() {
  const { palette } = useTheme();

  return (
    <Box id="user-reviews">
      <Marquee
        className="user-reviews__marquee"
        gradient
        gradientColor={palette.background.default}
        pauseOnHover
      >
        {userReviews.map((review, idx) => (
          <Card
            key={`${review.id}-${idx}`}
            sx={{
              flex: "0 0 auto",
              mx: 1.5,
              my: 2,
              transition: "scale 0.3s",
              width: { xs: 300, md: 380 },
              "&:hover": {
                scale: 1.075,
              },
            }}
          >
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating
                    icon={<MaterialIcon>star</MaterialIcon>}
                    name={`rating-${review.id}-${idx}`}
                    readOnly
                    value={review.rating}
                  />
                  <Typography color="text.secondary" variant="subtitle2">
                    {review.rating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" gutterBottom>
                "{review.text}"
              </Typography>
              <Typography
                color="text.secondary"
                variant="subtitle2"
                sx={{ mt: 2 }}
              >
                - <em>{review.author}</em>
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Marquee>
    </Box>
  );
}

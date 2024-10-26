import "./UserReviews.scss";

import Marquee from "react-fast-marquee";

import Box from "@mui/material/Box/Box";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent/CardContent";
import Rating from "@mui/material/Rating/Rating";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography/Typography";

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
            key={`card-${idx}`}
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
              <Typography
                color="text.secondary"
                gutterBottom
                variant="subtitle2"
              >
                {review.text}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flex: "1 1 auto",
                    gap: 1,
                  }}
                >
                  <Rating
                    icon={<MaterialIcon>star</MaterialIcon>}
                    name={`rating-${idx}`}
                    readOnly
                    value={review.rating}
                  />
                  <Typography color="text.secondary" variant="subtitle2">
                    {review.rating.toFixed(1)}
                  </Typography>
                </Box>
                <Typography color="text.secondary" variant="subtitle2">
                  <em>{review.author}</em>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Marquee>
    </Box>
  );
}

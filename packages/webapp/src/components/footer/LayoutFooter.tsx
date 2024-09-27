import Paper from "@mui/material/Paper/Paper";
import Typography from "@mui/material/Typography/Typography";

export default function LayoutFooter() {
  return (
    <Paper
      component="footer"
      sx={{
        px: 2,
        py: 1,
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        Copyright &copy; 2024 Logic Now LLC, All Rights Reserved
      </Typography>
    </Paper>
  );
}

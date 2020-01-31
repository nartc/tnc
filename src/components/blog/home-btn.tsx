import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Link } from "gatsby";
import React, { FC, memo } from "react";
import { useThemeChangerContext } from "../../contexts/theme-changer-context";

const useStyles = makeStyles({
  homeBtn: {
    backgroundColor: "transparent",
    boxShadow: "none",
    zIndex: 1,
  },
});

const HomeButton: FC = memo(() => {
  const { theme } = useThemeChangerContext();
  const classes = useStyles();

  return (
    <Link to={"/"} style={{ textDecoration: "none" }}>
      <Fab classes={{ root: classes.homeBtn }}>
        <Typography variant={"h4"}>
          {theme === "light" ? "🏡" : "🏠"}
        </Typography>
      </Fab>
    </Link>
  );
});

export default HomeButton;

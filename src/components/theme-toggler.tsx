import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { FC, memo } from "react";
import { useThemeChangerContext } from "../contexts/theme-changer-context";

const useStyles = makeStyles({
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },
});

const ThemeToggler: FC = memo(() => {
  const { theme, setTheme } = useThemeChangerContext();
  const classes = useStyles();

  const _setThemeClicked = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Fab
      onClick={_setThemeClicked}
      aria-label={"theme changer"}
      classes={{ root: classes.root }}
    >
      <Typography variant={"h5"}>{theme === "light" ? "🏙" : "🌃️"}</Typography>
    </Fab>
  );
});

export default ThemeToggler;

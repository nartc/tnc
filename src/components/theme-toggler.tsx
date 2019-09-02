import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import Fab from "@material-ui/core/Fab";
import React, { FC, memo } from "react";
import { useThemeChangerContext } from "../contexts/theme-changer-context";

const useStyles = makeStyles<Theme>(theme => ({
  toggler: {
    position: "fixed",
    top: theme.spacing(),
    right: theme.spacing(),
    transition: "background 250ms ease-in-out",
    backgroundColor: "transparent",
    boxShadow: "none",
    zIndex: 1,
  },
}));

const ThemeToggler: FC = memo(() => {
  const { theme, setTheme } = useThemeChangerContext();

  const classes = useStyles({ theme });

  const _setThemeClicked = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Fab
      classes={{ root: classes.toggler }}
      onClick={_setThemeClicked}
      aria-label={"theme changer"}
    >
      <Typography variant={"h5"}>{theme === "light" ? "🏙" : "🌃️"}</Typography>
    </Fab>
  );
});

export default ThemeToggler;

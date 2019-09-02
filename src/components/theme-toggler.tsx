import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React, { FC, memo } from "react";
import { useThemeChangerContext } from "../contexts/theme-changer-context";

const useStyles = makeStyles({
  toggler: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 250ms ease-in-out",
  },
  emoji: {
    margin: "0 0 0.5em 0.5em",
  },
});

const ThemeToggler: FC = memo(() => {
  const { theme, setTheme } = useThemeChangerContext();

  const classes = useStyles({ theme });

  const _setThemeClicked = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={classes.toggler} onClick={_setThemeClicked}>
      <Typography variant={"h5"} className={classes.emoji}>
        {theme === "light" ? "🏙" : "🌃️"}
      </Typography>
    </div>
  );
});

export default ThemeToggler;

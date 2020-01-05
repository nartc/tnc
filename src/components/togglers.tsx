import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import React, { FC, memo } from "react";
import LangToggler from "./lang-toggler";
import ThemeToggler from "./theme-toggler";

const useStyles = makeStyles<Theme>(theme => ({
  togglers: {
    position: "fixed",
    top: theme.spacing(),
    right: theme.spacing(),
    transition: "background 250ms ease-in-out",
    zIndex: 1,
  },
}));

const Togglers: FC = memo(() => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction={"column"}
      justify={"center"}
      alignItems={"flex-end"}
      classes={{ root: classes.togglers }}
    >
      <ThemeToggler />
      <LangToggler />
    </Grid>
  );
});

export default Togglers;

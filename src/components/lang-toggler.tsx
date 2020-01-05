import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { FC, memo } from "react";
import { useLanguageChangerContext } from "../contexts/language-changer-context";

const useStyles = makeStyles({
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },
});

const LangToggler: FC = memo(() => {
  const { lang, setLang } = useLanguageChangerContext();
  const classes = useStyles();

  const _setLangClicked = () => {
    setLang(prev => (prev === "en" ? "vi" : "en"));
  };

  return (
    <Fab
      onClick={_setLangClicked}
      aria-label={"lang changer"}
      classes={{ root: classes.root }}
    >
      <Typography variant={"h5"}>{lang === "en" ? "🇺🇸" : "🇻🇳️"}</Typography>
    </Fab>
  );
});

export default LangToggler;

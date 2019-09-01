import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";

import React, { FC, memo } from "react";
import { SiteSiteMetadataSocials } from "../graph-types";
import Navs from "./navs";

const useStyles = makeStyles({
  introWrapper: {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});

type IntroProps = {
  description: string;
  socials: Array<SiteSiteMetadataSocials>;
};

const Intro: FC<IntroProps> = memo(({ description, socials }) => {
  const classes = useStyles();
  return (
    <div className={classes.introWrapper}>
      <Typography variant={"h3"}>{description}</Typography>
      <Navs socials={socials} />
    </div>
  );
});

export default Intro;

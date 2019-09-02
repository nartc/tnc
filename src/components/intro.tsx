import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";

import React, { FC, memo } from "react";
import { SiteSiteMetadataSocials } from "../graph-types";
import Navs from "./navs";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles({
  introWrapper: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    transform: "translateY(-50%)",
  },
});

type IntroProps = {
  description: string;
  socials: Array<SiteSiteMetadataSocials>;
};

const Intro: FC<IntroProps> = memo(({ description, socials }) => {
  const classes = useStyles();
  return (
    <Container maxWidth={"md"} classes={{ root: classes.introWrapper }}>
      <Typography variant={"h3"} align={"center"}>
        {description}
      </Typography>
      <Navs socials={socials} />
    </Container>
  );
});

export default Intro;

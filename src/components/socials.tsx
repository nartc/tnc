import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Facebook from "mdi-material-ui/Facebook";
import Github from "mdi-material-ui/Github";
import LinkedIn from "mdi-material-ui/Linkedin";
import Rss from "mdi-material-ui/Rss";
import Twitter from "mdi-material-ui/Twitter";
import React, { FC, memo } from "react";
import { SiteSiteMetadataSocials } from "../graph-types";

declare const gaOptout: () => void;

type SocialsProps = {
  showDeactivateGA?: boolean;
  socials: Array<SiteSiteMetadataSocials>;
};

const Socials: FC<SocialsProps> = memo(({ socials, showDeactivateGA }) => {
  const getIconButton = (s: SiteSiteMetadataSocials) => {
    switch (s.type) {
      case "facebook":
        return <Facebook />;
      case "github":
        return <Github />;
      case "linkedIn":
        return <LinkedIn />;
      case "twitter":
        return <Twitter />;
    }
  };

  return (
    <>
      <Grid container spacing={4} justify={"center"} alignItems={"center"}>
        {socials.map((s, index) => (
          <Grid item key={index}>
            <IconButton
              component={"a"}
              href={s.link as string}
              target={"_blank"}
              rel="noreferrer"
            >
              {getIconButton(s)}
            </IconButton>
          </Grid>
        ))}
        <Grid item>
          <IconButton
            component={"a"}
            href={"/rss.xml"}
            target={"_blank"}
            rel="noreferrer"
          >
            <Rss />
          </IconButton>
        </Grid>
      </Grid>
      {showDeactivateGA && (
        <Container style={{ textAlign: "center" }}>
          <Button color="primary" onClick={() => gaOptout()}>
            Deactivate Google Analytics
          </Button>
        </Container>
      )}
    </>
  );
});

Socials.defaultProps = {
  showDeactivateGA: true,
};

export default Socials;

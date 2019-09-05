import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { Theme, withTheme } from "@material-ui/core/styles";
import { WithTheme } from "@material-ui/styles";
import { Link } from "gatsby";
import Facebook from "mdi-material-ui/Facebook";
import Github from "mdi-material-ui/GithubCircle";
import LinkedIn from "mdi-material-ui/Linkedin";
import Twitter from "mdi-material-ui/TwitterCircle";
import React, { FC, memo, useMemo, useState } from "react";
import { SiteSiteMetadataSocials } from "../graph-types";

type NavsProps = {
  socials: Array<SiteSiteMetadataSocials>;
} & WithTheme<Theme>;

const Navs: FC<NavsProps> = memo(({ socials, theme }) => {
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  const activeStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(to top, 
      rgba(0, 0, 0, 0), 
      rgba(0, 0, 0, 0) 1px, 
      ${theme.palette.primary.main} 1px, 
      ${theme.palette.primary.main} 4px, 
      rgba(0, 0, 0, 0) 4px`,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    }),
    [theme.palette.primary.main]
  );

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
        <Grid item>
          <Link
            to={"/"}
            activeStyle={activeStyle}
            style={{ textDecoration: "none" }}
          >
            <Button size={"large"} type={"button"}>
              home
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link
            to={"/about"}
            activeStyle={activeStyle}
            style={{ textDecoration: "none" }}
          >
            <Button size={"large"} type={"button"}>
              about
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link
            to={"/blogs"}
            activeStyle={activeStyle}
            style={{ textDecoration: "none" }}
          >
            <Button size={"large"} type={"button"}>
              blogs
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Button
            size={"large"}
            type={"button"}
            onClick={() => setIsSocialOpen(prev => !prev)}
          >
            socials
          </Button>
        </Grid>
      </Grid>

      <Fade in={isSocialOpen}>
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
        </Grid>
      </Fade>
    </>
  );
});

export default withTheme(Navs);

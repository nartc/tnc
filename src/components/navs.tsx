import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { WithTheme, withTheme } from "@material-ui/core/styles";
import { Link } from "gatsby";
import React, { FC, memo, useMemo } from "react";
import { SiteSiteMetadataSocials } from "../graph-types";
import Socials from "./socials";

type NavsProps = {
  atIndex?: boolean;
  socials: Array<SiteSiteMetadataSocials>;
} & WithTheme;

const Navs: FC<NavsProps> = memo(({ atIndex, socials, theme }) => {
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
    [theme]
  );

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
      </Grid>

      <Socials showDeactivateGA={!atIndex} socials={socials} />
    </>
  );
});

Navs.defaultProps = {
  atIndex: false,
};

export default withTheme(Navs);

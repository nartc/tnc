import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { graphql, useStaticQuery } from "gatsby";
import React, { FC, memo } from "react";
import Navs from "../components/navs";
import ParticlesBg from "../components/particles";
import SEO from "../components/seo";
import {
  Site,
  SiteSiteMetadata,
  SiteSiteMetadataSocials,
} from "../graph-types";

const useStyles = makeStyles(theme => ({
  about: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    marginTop: theme.spacing(10),
    textAlign: "justify",
  },
}));

const About: FC = memo(() => {
  const data = useStaticQuery<{
    site: Site;
  }>(graphql`
    query {
      site {
        siteMetadata {
          socials {
            link
            type
          }
        }
      }
    }
  `);

  const classes = useStyles();
  return (
    <>
      <SEO title={"About"} />
      <ParticlesBg />
      <Container maxWidth={"md"} classes={{ root: classes.about }}>
        <Typography variant={"h5"}>Hi, I am Chau Tran.</Typography>
        <br />
        <Typography variant={"h5"}>
          I am a developer who is highly interested in TypeScript. My tech stack
          has been full-stack TS such as Angular, React with TypeScript and
          NestJS.
        </Typography>
        <br />
        <Typography variant={"h5"}>
          I am currently working for{" "}
          <Link href="http://architectnow.net/" target={"_blank"}>
            ArchitectNow
          </Link>{" "}
          based in St. Louis, MO. We utilize cutting-edge technologies to
          deliver high quality solutions to clients ranging from Start-up to
          Fortune 500. Follow us at{" "}
          <Link href="https://twitter.com/architectnow" target={"_blank"}>
            @architectnow
          </Link>
          .
        </Typography>
        <br />
        <Typography variant={"h5"}>
          Here, I write about programming and daily life activities. Check out
          my blogs and my social medias below.
        </Typography>
        <br />
        <Navs
          socials={
            (data.site.siteMetadata as SiteSiteMetadata).socials as Array<
              SiteSiteMetadataSocials
            >
          }
        />
      </Container>
    </>
  );
});

export default About;

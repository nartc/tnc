import { graphql, PageRendererProps, useStaticQuery } from "gatsby";
import React, { FC } from "react";

import Intro from "../components/intro";
import ParticlesBg from "../components/particles";
import SEO from "../components/seo";
import {
  Site,
  SiteSiteMetadata,
  SiteSiteMetadataSocials,
} from "../graph-types";

const IndexPage: FC<PageRendererProps> = ({ location }) => {
  const data = useStaticQuery<{
    site: Site;
  }>(graphql`
    query {
      site {
        siteMetadata {
          description
          socials {
            link
            type
          }
        }
      }
    }
  `);

  const siteMetadata = data.site.siteMetadata as SiteSiteMetadata;

  return (
    <>
      <SEO title="Home" />
      <ParticlesBg />
      <Intro
        atIndex={location.pathname === "/"}
        description={siteMetadata.description as string}
        socials={siteMetadata.socials as Array<SiteSiteMetadataSocials>}
      />
    </>
  );
};

export default IndexPage;

/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import { graphql, useStaticQuery } from "gatsby";
import React from "react";
import Helmet from "react-helmet";

type SeoProps = {
  title: string;
  description?: string;
  lang?: string;
  meta?: any;
};

type SeoStaticQuery = {
  site: {
    siteMetadata: { author: string; description: string; title: string };
  };
};

const SEO: React.FC<SeoProps> = ({
  description,
  lang,
  meta,
  title,
  children,
}) => {
  const { site } = useStaticQuery<SeoStaticQuery>(
    graphql`
      query {
        site {
          siteMetadata {
            author
            description
            title
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          name: 'og:site_name',
          content: site.siteMetadata.title
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    >
      {!!children && children}
    </Helmet>
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

export default SEO;

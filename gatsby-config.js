module.exports = {
  siteMetadata: {
    title: `tnc`,
    description: "Yet another dev blog.",
    author: `@nartc`,
    siteUrl: "https://nartc.netlify.com",
    baseUrl: "https://nartc.netlify.com",
    socials: [
      {
        type: "facebook",
        link: "https://www.facebook.com/ctran2428",
      },
      {
        type: "twitter",
        link: "https://twitter.com/Nartc1410",
      },
      {
        type: "github",
        link: "https://github.com/nartc",
      },
      {
        type: "linkedIn",
        link: "https://www.linkedin.com/in/chauntran/",
      },
    ],
    blogsPerPage: 10,
    langs: ["en", "vi"],
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-154847070-1",
        head: false,
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: "gatsby-plugin-prefetch-google-fonts",
      options: {
        fonts: [
          {
            family: "Be Vietnam",
            variants: [`400`, `700`],
          },
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-code-buttons",
            options: {
              toasterText: "Copied to clipboard 📋",
            },
          },
          {
            resolve: "gatsby-remark-responsive-iframe",
            options: {
              wrapperStyle: "margin-bottom: 1rem",
            },
          },
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: -650,
            },
          },
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              showLineNumbers: true,
            },
          },
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-smartypants",
          "gatsby-remark-abbr",
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 640,
              quality: 90,
            },
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "nofollow noreferrer",
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `tnc blog`,
        short_name: `tnc`,
        start_url: `/`,
        display: `minimal-ui`,
        icon: "src/content/tnc.png",
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                baseUrl
                site_url: baseUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url:
                    site.siteMetadata.baseUrl +
                    "/blogs" +
                    edge.node.fields.slug,
                  guid:
                    site.siteMetadata.baseUrl +
                    "/blogs" +
                    edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { fields: [frontmatter___date], order: [DESC] }
                  filter: { frontmatter: { draft: { ne: true } } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date(formatString: "MM/DD/YYYY")
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "tnc Blog",
            match: "^/(blog | blogs)/",
          },
        ],
      },
    },
    "gatsby-plugin-material-ui",
    "gatsby-plugin-layout",
    "gatsby-plugin-typescript",
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};

module.exports = {
  siteMetadata: {
    title: `tnc`,
    description: "Yet another dev blog.",
    author: `@nartc`,
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
  },
  plugins: [
    {
      resolve: "gatsby-plugin-prefetch-google-fonts",
      options: {
        fonts: [
          {
            family: "Nunito Sans",
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
            resolve: "gatsby-remark-responsive-iframe",
            options: {
              wrapperStyle: "margin-bottom: 1rem",
            },
          },
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: -750,
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

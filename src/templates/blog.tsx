import Chip from "@material-ui/core/Chip";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import React, { FC, memo } from "react";
import Navs from "../components/navs";
import SEO from "../components/seo";
import {
  File,
  ImageSharp,
  ImageSharpFluid,
  MarkdownRemark,
  MarkdownRemarkConnection,
  MarkdownRemarkFields,
  MarkdownRemarkFrontmatter,
  SiteSiteMetadataSocials,
} from "../graph-types";

type BlogProps = {
  data: {
    markdownRemark: MarkdownRemark;
    related: MarkdownRemarkConnection;
    site: {
      siteMetadata: {
        baseUrl: string;
        author: string;
        socials: Array<SiteSiteMetadataSocials>;
      };
    };
  };
};

const useStyles = makeStyles<Theme>(theme => ({
  title: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  dateTime: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  content: {
    position: "relative",
    margin: "0 auto",
    borderRadius: theme.shape.borderRadius * 0.1,
    boxShadow: "none",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    fontSize: "1.125rem",
    background: theme.palette.background.default,

    "&::before": {
      content: '""',
      position: "absolute",
      top: 15,
      left: -5,
      zIndex: -1,
      display: "block",
      width: 20,
      height: 200,
      background: theme.palette.secondary.main,
      opacity: 0.15,
      filter: "blur(5px)",
      transform: "rotate(-5deg)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 15,
      right: -5,
      zIndex: -1,
      display: "block",
      width: 20,
      height: 200,
      background: theme.palette.secondary.main,
      filter: "blur(5px)",
      transform: "rotate(5deg)",
    },

    "& p": {
      fontSize: "1.125rem",
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: "1.5rem",
      textAlign: "justify",
      "& > span.gatsby-resp-image-wrapper ~ em": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "smaller",
      },
    },
    "& blockquote": {
      borderLeftWidth: 10,
      borderLeftStyle: "solid",
      borderLeftColor: theme.palette.secondary.main,
      margin: "1.5em 0",
      padding: "0.5em 10px",
    },
    "& a": {
      color: theme.palette.primary.main,
    },
    "& h2": {
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
      borderBottomColor: theme.palette.primary.main,
    },
    "& div.gatsby-highlight": {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  },
  cover: {
    margin: "0px -10vw -165px",
    background: "center center / cover rgb(197, 210, 217)",
    height: 700,
    width: "auto",
    borderRadius: theme.shape.borderRadius,
  },
}));

const Blog: FC<BlogProps> = memo(({ data }) => {
  const classes = useStyles();

  const frontmatter = data.markdownRemark
    .frontmatter as MarkdownRemarkFrontmatter;
  const slug = (data.markdownRemark.fields as MarkdownRemarkFields)
    .slug as string;
  const imgFluid = frontmatter.cover
    ? (((frontmatter.cover as File).childImageSharp as ImageSharp)
        .fluid as ImageSharpFluid)
    : null;
  const tags = frontmatter.tags as string[];

  return (
    <>
      <SEO
        title={frontmatter.title as string}
        description={data.markdownRemark.excerpt as string}
      >
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={data.site.siteMetadata.baseUrl + `/blogs${slug}`}
        />
        {frontmatter.cover &&
          frontmatter.cover.childImageSharp &&
          frontmatter.cover.childImageSharp.fluid && (
            <meta
              property="og:image"
              content={`${data.site.siteMetadata.baseUrl}${frontmatter.cover.childImageSharp.fluid.src}`}
            />
          )}
        <meta property="article:published_time" content={frontmatter.date} />
        {/* not sure if modified time possible */}
        {/* <meta property="article:modified_time" content="2018-08-20T15:12:00.000Z" /> */}
        {frontmatter.tags && (
          <meta
            property="article:tag"
            content={frontmatter.tags[0] as string}
          />
        )}
        <meta
          property="article:author"
          content={data.site.siteMetadata.author}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={frontmatter.title as string} />
        <meta
          name="twitter:description"
          content={data.markdownRemark.excerpt as string}
        />
        <meta
          name="twitter:url"
          content={data.site.siteMetadata.baseUrl + `/blogs${slug}`}
        />
        {frontmatter.cover &&
          frontmatter.cover.childImageSharp &&
          frontmatter.cover.childImageSharp.fluid && (
            <meta
              name="twitter:image"
              content={`${data.site.siteMetadata.baseUrl}${frontmatter.cover.childImageSharp.fluid.src}`}
            />
          )}
        <meta name="twitter:label2" content="Filed under" />
        {frontmatter.tags && (
          <meta name="twitter:data2" content={frontmatter.tags[0] as string} />
        )}
        <meta name="twitter:site" content={data.site.siteMetadata.author} />
        <meta name="twitter:creator" content={data.site.siteMetadata.author} />
      </SEO>
      <Container maxWidth={"md"}>
        <Typography
          variant={"h2"}
          classes={{ root: classes.title }}
          align={"center"}
        >
          {frontmatter.title}
        </Typography>
        {!!tags.length && (
          <Grid container justify={"center"} alignItems={"center"} spacing={1}>
            {tags.map((tag, index) => (
              <Grid item key={index}>
                <Chip label={tag} clickable color={"primary"} size={"small"} />
              </Grid>
            ))}
          </Grid>
        )}
        <Typography
          variant={"caption"}
          display={"block"}
          align={"center"}
          classes={{ root: classes.dateTime }}
        >
          {frontmatter.date} | {data.markdownRemark.timeToRead} min read
        </Typography>
        {imgFluid && (
          <div className={classes.cover}>
            <Img
              style={{ height: 700, width: "auto" }}
              fluid={imgFluid as any}
            />
          </div>
        )}
        <Paper classes={{ root: classes.content }}>
          <Container maxWidth={"lg"}>
            <div
              dangerouslySetInnerHTML={{
                __html: data.markdownRemark.html as string,
              }}
            />
          </Container>
        </Paper>
        <Divider />
        <Navs socials={data.site.siteMetadata.socials} />
      </Container>
    </>
  );
});

export default Blog;

export const blogQuery = graphql`
  query($slug: String, $primaryTag: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      frontmatter {
        date(formatString: "MM/DD/YYYY - hh:mm")
        tags
        title
        cover {
          childImageSharp {
            fluid(maxWidth: 1080, fit: COVER, quality: 80) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      timeToRead
      fields {
        slug
      }
    }
    related: allMarkdownRemark(
      filter: {
        frontmatter: { tags: { in: [$primaryTag] } }
        fields: { slug: { ne: $slug } }
      }
      limit: 3
    ) {
      edges {
        node {
          excerpt
          frontmatter {
            title
            tags
          }
          timeToRead
          fields {
            slug
          }
        }
      }
    }
    site {
      siteMetadata {
        baseUrl
        author
        socials {
          link
          type
        }
      }
    }
  }
`;

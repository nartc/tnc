import Chip from "@material-ui/core/Chip";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { NavigateFn } from "@reach/router";
import { graphql } from "gatsby";
import Img, { FluidObject } from "gatsby-image";
import kebabCase from "lodash.kebabcase";
import React, { FC, memo, useCallback, useEffect, useRef } from "react";
import GoToTop from "../components/blog/go-to-top";
import HomeButton from "../components/blog/home-btn";
import NextPrev from "../components/blog/next-prev";
import WrittenBy from "../components/blog/written-by";
import SEO from "../components/seo";
import Socials from "../components/socials";
import {
  Lang,
  useLanguageChangerContext,
} from "../contexts/language-changer-context";
import {
  MarkdownRemark,
  MarkdownRemarkConnection,
  MarkdownRemarkFields,
  MarkdownRemarkFrontmatter,
  SiteSiteMetadataSocials,
} from "../graph-types";
import blogContentStyles from "../utils/blog-content";

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
  pageContext: {
    prev?: {
      fields: MarkdownRemarkFields;
      frontmatter: MarkdownRemarkFrontmatter;
    };
    next?: {
      fields: MarkdownRemarkFields;
      frontmatter: MarkdownRemarkFrontmatter;
    };
  };
  navigate: NavigateFn;
};

const useStyles = makeStyles(theme => ({
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
    fontSize: theme.typography.fontSize,
    background: theme.palette.background.default,
    ...blogContentStyles(theme),
  },
  cover: {
    margin: "0 0 -165px 0",
    background: "center center / cover rgb(197, 210, 217)",
    height: 700,
    width: "auto",
    borderRadius: theme.shape.borderRadius,
  },
  coverContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const Blog: FC<BlogProps> = memo(({ data, pageContext, navigate }) => {
  const classes = useStyles();
  const { lang, setLang } = useLanguageChangerContext();
  const previousLang = useRef(lang);

  const frontmatter = data.markdownRemark
    .frontmatter as MarkdownRemarkFrontmatter;
  const slug = (data.markdownRemark.fields as MarkdownRemarkFields)
    .slug as string;
  const langKey = (data.markdownRemark.fields as MarkdownRemarkFields)
    .langKey as Lang;
  const imgFluid = frontmatter.cover?.childImageSharp?.fluid;
  const tags = frontmatter.tags as string[];

  const onTagClick = useCallback(
    tag => () => {
      navigate(`/tags/${kebabCase(tag)}`);
    },
    [navigate]
  );

  useEffect(() => {
    setLang(langKey);
    const prevLang = previousLang.current;
    return () => {
      setLang(prevLang);
    };
  }, [langKey, setLang]);

  console.log(data);

  return (
    <>
      <SEO
        title={frontmatter.title as string}
        description={data.markdownRemark.excerpt as string}
      >
        <meta property="og:type" content="article" />
        <meta property="og:title" content={frontmatter.title as string} />
        <meta property="og:description" content={data.markdownRemark.excerpt as string} />
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
      <HomeButton />
      <Container maxWidth={"lg"}>
        <Typography
          variant={"h2"}
          classes={{ root: classes.title }}
          align={"center"}
        >
          {frontmatter.title}{" "}
        </Typography>
        {frontmatter.draft && (
          <Typography align={"center"} variant={"subtitle1"}>
            (Draft)
          </Typography>
        )}
        {!!tags.length && (
          <Grid container justify={"center"} alignItems={"center"} spacing={1}>
            {tags.map((tag, index) => (
              <Grid item key={index}>
                <Chip
                  label={tag}
                  onClick={onTagClick(tag)}
                  clickable
                  color={"primary"}
                  size={"small"}
                />
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
      </Container>
      <Container maxWidth={"xl"} classes={{ root: classes.coverContainer }}>
        {imgFluid && (
          <div className={classes.cover}>
            <Img
              style={{ height: 700, width: "auto" }}
              fluid={imgFluid as FluidObject}
            />
          </div>
        )}
      </Container>
      <Container maxWidth={"lg"}>
        <Paper classes={{ root: classes.content }}>
          <Container maxWidth={"xl"}>
            <div
              dangerouslySetInnerHTML={{
                __html: data.markdownRemark.html as string,
              }}
            />
          </Container>
        </Paper>
        <Divider />
        <NextPrev next={pageContext.next} prev={pageContext.prev} />
        <GoToTop />
        <Socials socials={data.site.siteMetadata.socials} />
        <WrittenBy />
      </Container>
    </>
  );
});

export default Blog;

export const blogQuery = graphql`
  query($slug: String, $primaryTag: String, $langKey: String) {
    markdownRemark(fields: { slug: { eq: $slug }, langKey: { eq: $langKey } }) {
      html
      excerpt
      frontmatter {
        date(formatString: "MM/DD/YYYY - hh:mm")
        tags
        draft
        title
        langs
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
        langKey
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
            draft
            langs
          }
          timeToRead
          fields {
            slug
            langKey
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

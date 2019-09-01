import Container from "@material-ui/core/Container";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import React, { FC, memo } from "react";
import BlogTagList from "../components/blogs/blog-tag-list";
import ParticlesBg from "../components/particles";
import SEO from "../components/seo";
import {
  File,
  ImageSharp,
  ImageSharpFluid,
  MarkdownRemark,
  MarkdownRemarkConnection,
  MarkdownRemarkFields,
  MarkdownRemarkFrontmatter,
  SitePageContextNext,
  SitePageContextPrev,
} from "../graph-types";
import Divider from "@material-ui/core/Divider";

type BlogProps = {
  data: {
    markdownRemark: MarkdownRemark;
    related: MarkdownRemarkConnection;
    site: {
      siteMetadata: {
        baseUrl: string;
        author: string;
      };
    };
  };
  pageContext: {
    next?: SitePageContextNext;
    prev?: SitePageContextPrev;
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
      <ParticlesBg />
      <Container
        maxWidth={"md"}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {imgFluid && <Img fluid={imgFluid as any} />}
        <Typography variant={"h3"} classes={{ root: classes.title }}>
          {frontmatter.title}
        </Typography>
        {!!tags.length && <BlogTagList tags={tags} />}
        <Typography
          variant={"caption"}
          display={"block"}
          classes={{ root: classes.dateTime }}
        >
          {frontmatter.date} | {data.markdownRemark.timeToRead} min read
        </Typography>
        <Divider />
        <div
          dangerouslySetInnerHTML={{
            __html: data.markdownRemark.html as string,
          }}
        />
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
      }
    }
  }
`;

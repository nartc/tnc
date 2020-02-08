import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import { NavigateFn } from "@reach/router";
import { graphql } from "gatsby";
import TagOutline from "mdi-material-ui/TagOutline";
import React, { FC, memo, useCallback } from "react";
import BlogListItem from "../components/blogs/blog-list-item";
import Navs from "../components/navs";
import SEO from "../components/seo";
import {
  MarkdownRemarkConnection,
  Site,
  SitePageContext,
  SiteSiteMetadata,
  SiteSiteMetadataSocials,
} from "../graph-types";

type TagsProps = {
  data: {
    allMarkdownRemark: MarkdownRemarkConnection;
    site: Site;
  };
  pageContext: SitePageContext;
  navigate: NavigateFn;
};

const Tags: FC<TagsProps> = memo(({ data, pageContext, navigate }) => {
  const { tag, totalCount, limit, currentPage, numPages } = pageContext;

  const onChangePage = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      console.log(page);
    },
    []
  );

  const navigateFn = useCallback(navigate, []);

  return (
    <>
      <SEO title={tag as string} />
      <Container maxWidth={"lg"}>
        <Typography variant={"h3"} gutterBottom>
          <TagOutline fontSize={"large"} /> Tag "{tag}"
        </Typography>
        <Typography variant={"h5"} gutterBottom>
          {totalCount} {totalCount === 1 ? "result" : "results"}
        </Typography>
        <Divider />

        <Grid container spacing={6}>
          {data.allMarkdownRemark.edges.map((edge, index) => {
            return (
              <Grid item key={index} xs={12} md={6}>
                <BlogListItem item={edge} navigate={navigateFn} />
              </Grid>
            );
          })}
        </Grid>

        {(numPages as number) > 1 && (
          <TablePagination
            labelRowsPerPage={null}
            rowsPerPage={limit as number}
            page={(currentPage as number) - 1}
            count={totalCount as number}
            onChangePage={onChangePage}
          />
        )}
        <Navs
          socials={
            (data.site.siteMetadata as SiteSiteMetadata)
              .socials as SiteSiteMetadataSocials[]
          }
        />
      </Container>
    </>
  );
});

export default Tags;

export const tagsQuery = graphql`
  query tagsQuery($skip: Int!, $limit: Int!, $tag: String!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: [DESC] }
      filter: { frontmatter: { draft: { ne: true }, tags: { in: [$tag] } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt
          timeToRead
          frontmatter {
            date(formatString: " MM/DD/YYYY")
            tags
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
          fields {
            slug
            langKey
          }
        }
      }
    }
    site {
      siteMetadata {
        socials {
          link
          type
        }
      }
    }
  }
`;

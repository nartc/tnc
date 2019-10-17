import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";
import { NavigateFn } from "@reach/router";
import { graphql } from "gatsby";
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

type BlogsProps = {
  data: {
    allMarkdownRemark: MarkdownRemarkConnection;
    site: Site;
  };
  pageContext: SitePageContext;
  navigate: NavigateFn;
};

const Blogs: FC<BlogsProps> = memo(({ data, pageContext, navigate }) => {
  const onChangePage = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      console.log(page);
    },
    []
  );

  const navigateFn = useCallback(navigate, []);

  return (
    <>
      <SEO title={"blogs"} />
      <Container maxWidth={"lg"}>
        <Typography variant={"h3"} gutterBottom>
          <LibraryBooksOutlinedIcon fontSize={"large"} /> Blogs
        </Typography>
        <Grid container spacing={6}>
          {data.allMarkdownRemark.edges.map((edge, index) => {
            return (
              <Grid item key={index} xs={12} md={6}>
                <BlogListItem item={edge} navigate={navigateFn} />
              </Grid>
            );
          })}
        </Grid>
        {(pageContext.numPages as number) > 1 && (
          <TablePagination
            labelRowsPerPage={null}
            rowsPerPage={pageContext.limit as number}
            page={(pageContext.currentPage as number) - 1}
            count={pageContext.total as number}
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

export default Blogs;

export const blogsQuery = graphql`
  query blogsQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: [DESC] }
      filter: { frontmatter: { draft: { ne: true } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt
          timeToRead
          frontmatter {
            date(formatString: "MM/DD/YYYY")
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
          fields {
            slug
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

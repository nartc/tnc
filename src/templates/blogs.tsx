import Container from "@material-ui/core/Container";
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
      <Container maxWidth={"md"}>
        <Typography variant={"h3"}>
          <LibraryBooksOutlinedIcon fontSize={"large"} /> Blogs
        </Typography>
        {data.allMarkdownRemark.edges.map((edge, index) => {
          return <BlogListItem item={edge} key={index} navigate={navigateFn} />;
        })}
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

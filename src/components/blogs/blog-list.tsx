import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";
import { NavigateFn } from "@reach/router";
import React, { FC, memo, useCallback } from "react";
import {
  MarkdownRemarkConnection,
  Site,
  SitePageContext,
  SiteSiteMetadata,
  SiteSiteMetadataSocials,
} from "../../graph-types";
import Navs from "../navs";
import SEO from "../seo";
import TagsList from "../tags-list";
import BlogListItem from "./blog-list-item";

export type BlogsProps = {
  data: {
    allMarkdownRemark: MarkdownRemarkConnection;
    site: Site;
  };
  pageContext: SitePageContext;
  navigate: NavigateFn;
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const BlogList: FC<BlogsProps> = memo(({ data, pageContext, navigate }) => {
  const classes = useStyles();
  const onChangePage = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      console.log(page);
    },
    []
  );
  const tags = (data.allMarkdownRemark?.group as unknown) as Array<{
    tag: string;
    totalCount: number;
  }>;

  const navigateFn = useCallback(navigate, []);

  return (
    <>
      <SEO title={"blogs"} />
      <Container maxWidth={"lg"}>
        <Typography variant={"h3"} gutterBottom>
          <LibraryBooksOutlinedIcon fontSize={"large"} /> Blogs
        </Typography>
        <TagsList tags={tags} />
        <Divider classes={{ root: classes.divider }} />
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

export default BlogList;

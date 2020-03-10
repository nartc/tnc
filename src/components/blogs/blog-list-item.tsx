import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { NavigateFn } from "@reach/router";
import React, { FC, memo, useCallback } from "react";
import {
  ImageSharp,
  ImageSharpFluid,
  MarkdownRemarkEdge,
  MarkdownRemarkFrontmatter,
} from "../../graph-types";
import BlogChipList from "./blog-chip-list";
import BlogTimeToRead from "./blog-time-to-read";

type BlogListItemProps = {
  item: MarkdownRemarkEdge;
  navigate: NavigateFn;
};

const useStyles = makeStyles(theme => ({
  cardRoot: {
    borderRadius: theme.shape.borderRadius,
  },
  excerptRoot: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minHeight: 70,
  },
  titleRoot: {
    minHeight: 80,
  },
}));

const BlogListItem: FC<BlogListItemProps> = memo(({ item, navigate }) => {
  const classes = useStyles();
  const frontmatter = item.node.frontmatter as MarkdownRemarkFrontmatter;
  const slug = item.node.fields?.slug;
  const langKey = item.node.fields?.langKey;
  const tags = frontmatter.tags as string[];
  const langs = frontmatter.langs as string[];
  const cover = frontmatter.cover;
  const coverImg = !!cover
    ? (((cover.childImageSharp as ImageSharp).fluid as ImageSharpFluid)
        .src as string)
    : "http://lorempixel.com/600/480/";

  const onItemClicked = useCallback(() => {
    const path = `/blogs/${(slug as string).replace("/", "")}`;
    navigate(langKey === "en" ? path : path.replace("/blogs/", "/blogs/vi/"));
  }, [slug, langKey, navigate]);

  return (
    <Card elevation={4} raised classes={{ root: classes.cardRoot }}>
      <CardActionArea onClick={onItemClicked}>
        <CardMedia
          component={"img"}
          alt={"blog image"}
          height={250}
          image={coverImg}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            classes={{ root: classes.titleRoot }}
          >
            {frontmatter.title}
          </Typography>
          {!!tags.length && <BlogChipList chips={tags} />}
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            classes={{ root: classes.excerptRoot }}
          >
            {item.node.excerpt}
          </Typography>
          <Grid container justify={"space-between"} alignItems={"center"}>
            <BlogTimeToRead timeToRead={item.node.timeToRead as number} />
            {langs && (
              <BlogChipList
                chips={langs.map(lang => lang.toUpperCase())}
                isOutline
              />
            )}
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

export default BlogListItem;

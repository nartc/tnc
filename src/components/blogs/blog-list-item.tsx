import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { NavigateFn } from "@reach/router";
import React, { FC, memo, useCallback } from "react";
import {
  ImageSharp,
  ImageSharpFluid,
  MarkdownRemarkEdge,
  MarkdownRemarkFields,
  MarkdownRemarkFrontmatter,
} from "../../graph-types";
import BlogTagList from "./blog-tag-list";
import BlogTimeToRead from "./blog-time-to-read";

type BlogListItemProps = {
  item: MarkdownRemarkEdge;
  navigate: NavigateFn;
};

const useStyles = makeStyles<Theme>(theme => ({
  cardRoot: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(5),
    borderRadius: theme.shape.borderRadius,
  },
  excerptRoot: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const BlogListItem: FC<BlogListItemProps> = memo(({ item, navigate }) => {
  const classes = useStyles();
  const frontmatter = item.node.frontmatter as MarkdownRemarkFrontmatter;
  const slug = (item.node.fields as MarkdownRemarkFields).slug;
  const tags = frontmatter.tags as string[];
  const cover = frontmatter.cover;
  const coverImg = !!cover
    ? (((cover.childImageSharp as ImageSharp).fluid as ImageSharpFluid)
        .src as string)
    : "http://lorempixel.com/600/480/";

  const onItemClicked = useCallback(() => {
    navigate(`/blogs/${(slug as string).replace("/", "")}`);
  }, [slug]);

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
          <Typography gutterBottom variant="h5" component="h2">
            {frontmatter.title}
          </Typography>
          {!!tags.length && <BlogTagList tags={tags} />}
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            classes={{ root: classes.excerptRoot }}
          >
            {item.node.excerpt}
          </Typography>
          <BlogTimeToRead timeToRead={item.node.timeToRead as number} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

export default BlogListItem;

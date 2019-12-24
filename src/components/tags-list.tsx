import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { Link } from "gatsby";
import kebabCase from "lodash.kebabcase";
import React, { FC, memo } from "react";

type TagsListProps = {
  tags: Array<{ tag: string; totalCount: number }>;
};

const useStyles = makeStyles<Theme>(theme => ({
  link: {
    display: "inline-block",
    color: theme.palette.primary.main,
  },
  title: {
    color: theme.palette.primary.main,
  },
  container: {
    marginBottom: theme.spacing(3),
  },
}));

const TagsList: FC<TagsListProps> = memo(({ tags }) => {
  const classes = useStyles();

  const tagItem = (tag: string, totalCount: number, index: number) => (
    <Link key={index} to={`/tags/${kebabCase(tag)}`} className={classes.link}>
      <Typography variant={"caption"} classes={{ root: classes.title }}>
        {tag} ({totalCount})
      </Typography>
    </Link>
  );

  return (
    <Grid container alignItems={"center"} classes={{ root: classes.container }}>
      {tags.map(({ tag, totalCount }, index) => {
        return index === tags.length - 1 ? (
          tagItem(tag, totalCount, index)
        ) : (
          <>{tagItem(tag, totalCount, index)},&nbsp;&nbsp;</>
        );
      })}
    </Grid>
  );
});

export default TagsList;

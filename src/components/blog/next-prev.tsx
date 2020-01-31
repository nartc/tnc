import Grid from "@material-ui/core/Grid";
import { makeStyles, withTheme, WithTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Link } from "gatsby";
import ChevronDoubleLeft from "mdi-material-ui/ChevronDoubleLeft";
import ChevronDoubleRight from "mdi-material-ui/ChevronDoubleRight";
import React, { FC, memo } from "react";
import {
  MarkdownRemarkFields,
  MarkdownRemarkFrontmatter,
} from "../../graph-types";

type ItemProps = {
  fields: MarkdownRemarkFields;
  frontmatter: MarkdownRemarkFrontmatter;
};

const useStyles = makeStyles(theme => ({
  link: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.primary.main,
  },
  title: {
    color: theme.palette.primary.main,
  },
}));

const Item: FC<ItemProps & {
  shouldAlignLeft?: boolean;
}> = memo(({ frontmatter, fields, shouldAlignLeft }) => {
  const classes = useStyles();
  return (
    <Grid item style={{ marginLeft: shouldAlignLeft ? "auto" : "initial" }}>
      <Link to={("/blogs" + fields.slug) as string} className={classes.link}>
        {shouldAlignLeft ? (
          <>
            <Typography variant={"subtitle1"} classes={{ root: classes.title }}>
              {frontmatter.title}
            </Typography>
            <ChevronDoubleRight />
          </>
        ) : (
          <>
            <ChevronDoubleLeft />
            <Typography variant={"subtitle1"} classes={{ root: classes.title }}>
              {frontmatter.title}
            </Typography>
          </>
        )}
      </Link>
    </Grid>
  );
});

Item.defaultProps = {
  shouldAlignLeft: false,
};

type NextPrevProps = {
  prev?: ItemProps;
  next?: ItemProps;
};

const NextPrev: FC<NextPrevProps & WithTheme> = memo(
  ({ next, prev, theme }) => {
    return (
      <Grid
        container
        justify={"space-between"}
        alignItems={"center"}
        style={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(1) }}
      >
        {prev && <Item frontmatter={prev.frontmatter} fields={prev.fields} />}
        {next && (
          <Item
            shouldAlignLeft
            frontmatter={next.frontmatter}
            fields={next.fields}
          />
        )}
      </Grid>
    );
  }
);

export default withTheme(NextPrev);

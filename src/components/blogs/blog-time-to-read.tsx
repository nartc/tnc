import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React, { FC, memo } from "react";

type BlogTimeToReadProps = {
  timeToRead: number;
};

const useStyles = makeStyles<Theme>(theme => ({
  timeToRead: {
    marginLeft: theme.spacing(1),
  },
}));

const BlogTimeToRead: FC<BlogTimeToReadProps> = memo(({ timeToRead }) => {
  const classes = useStyles();

  return (
    <Grid container alignItems={"center"}>
      <AccessTimeIcon fontSize={"small"} />
      <Typography variant={"caption"} className={classes.timeToRead}>
        {timeToRead} min
      </Typography>
    </Grid>
  );
});

export default BlogTimeToRead;

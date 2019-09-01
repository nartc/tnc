import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import React, { FC, memo } from "react";

type BlogTagListProps = {
  tags: string[];
};

const BlogTagList: FC<BlogTagListProps> = memo(({ tags }) => {
  return (
    <Grid container spacing={1}>
      {tags.map((tag, index) => (
        <Grid item key={index}>
          <Chip label={tag} clickable color={"primary"} size={"small"} />
        </Grid>
      ))}
    </Grid>
  );
});

export default BlogTagList;

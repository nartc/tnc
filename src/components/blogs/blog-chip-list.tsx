import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import React, { FC, memo } from "react";

type BlogChipListProps = {
  chips: string[];
  isOutline?: boolean;
};

const BlogChipList: FC<BlogChipListProps> = memo(({ chips, isOutline }) => {
  return (
    <Grid container spacing={1} style={{ width: "auto" }}>
      {chips.map((chip, index) => (
        <Grid item key={index}>
          <Chip
            label={chip}
            variant={isOutline === true ? "outlined" : "default"}
            clickable
            color={"primary"}
            size={"small"}
          />
        </Grid>
      ))}
    </Grid>
  );
});

BlogChipList.defaultProps = {
  isOutline: false,
};

export default BlogChipList;

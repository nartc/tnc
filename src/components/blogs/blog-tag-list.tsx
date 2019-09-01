import Chip from "@material-ui/core/Chip";
import React, { FC, memo } from "react";

type BlogTagListProps = {
  tags: string[];
};

const BlogTagList: FC<BlogTagListProps> = memo(({ tags }) => {
  return (
    <>
      {tags.map((tag, index) => (
        <Chip
          label={tag}
          key={index}
          clickable
          color={"primary"}
          size={"small"}
        />
      ))}
    </>
  );
});

export default BlogTagList;

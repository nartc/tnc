import { WithTheme, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { FC, memo } from "react";

const WrittenBy: FC<WithTheme> = memo(({ theme }) => {
  return (
    <Typography
      variant={"body1"}
      align={"center"}
      style={{ paddingBottom: theme.spacing(2) }}
    >
      <strong>Written by</strong> Chau Tran
    </Typography>
  );
});

export default withTheme(WrittenBy);

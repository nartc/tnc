import Link from "@material-ui/core/Link";
import { Theme, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { WithTheme } from "@material-ui/styles";
import React, { FC, memo } from "react";

const GoToTop: FC<WithTheme<Theme>> = memo(({ theme }) => {
  const onGoToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <Link
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        cursor: "pointer",
        textDecoration: "none",
      }}
      onClick={onGoToTop}
    >
      <Typography variant={"h6"}>⏫⏫⏫⏫</Typography>
    </Link>
  );
});

export default withTheme(GoToTop);
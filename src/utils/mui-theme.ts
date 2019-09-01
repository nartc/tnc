import { grey, teal } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";
import { Overrides } from "@material-ui/core/styles/overrides";
import { BlogTheme } from "../contexts/theme-changer-context";

const buildTheme = (blogTheme: BlogTheme) => {
  const theme = createMuiTheme({
    palette: {
      type: blogTheme,
      primary: {
        main: blogTheme === "light" ? teal["600"] : teal.A100,
      },
      secondary: {
        main: blogTheme === "light" ? grey["900"] : grey["100"],
      },
    },
    typography: {
      fontFamily: [
        "Nunito Sans",
        "-apple-system",
        '"Segoe UI"',
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      allVariants: {
        color: blogTheme === "light" ? "#000" : "#fff",
      },
      caption: {
        fontWeight: "bold",
        color: grey["500"],
      },
    },
    overrides: {
      MuiCssBaseline: {
        "@global": {
          "*": {
            transition:
              "250ms background ease-in-out, 250ms background-color ease-in-out",
          },
        },
      },
      MuiButton: {
        root: {
          textTransform: "none",
        },
      },
      MuiPaper: {
        root: {
          transition:
            "250ms background ease-in-out, 250ms background-color ease-in-out",
        },
      },
    },
  });

  (theme.overrides as Overrides).MuiLink = {
    root: {
      textDecoration: "none",
      color: theme.palette.primary.main,
    },
  };

  (theme.overrides as Overrides).MuiCssBaseline = {
    ...(theme.overrides as Overrides).MuiCssBaseline,
    "@global": {
      ...((theme.overrides as Overrides).MuiCssBaseline as any)["@global"],
      p: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
      },
    },
  };

  theme.shape.borderRadius = theme.shape.borderRadius * 5;

  return theme;
};

export default buildTheme;

import { grey, teal } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
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
        main: blogTheme === "light" ? grey["700"] : grey["100"],
      },
    },
    typography: {
      fontFamily: [
        "Be Vietnam",
        "Helvetica Neue",
        "-apple-system",
        "Segoe UI",
        "Arial",
        "sans-serif",
      ].join(","),
      allVariants: {
        color: blogTheme === "light" ? "#000" : "#fff",
      },
      caption: {
        fontWeight: "bold",
        color: blogTheme === "light" ? grey["400"] : grey["50"],
      },
      h2: {
        fontWeight: "bold",
      },
      fontSize: 18,
      htmlFontSize: 18,
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
      MuiGrid: {
        container: {
          width: "auto",
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

  return responsiveFontSizes(theme);
};

export default buildTheme;

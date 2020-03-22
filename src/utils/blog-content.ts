import { orange, pink } from "@material-ui/core/colors";
import { darken, lighten, StyleRules, Theme } from "@material-ui/core/styles";

const blogContentStyles = (theme: Theme) =>
  ({
    "&::before": {
      content: '""',
      position: "absolute",
      top: 15,
      left: -5,
      zIndex: -1,
      display: "block",
      width: 20,
      height: 200,
      background: theme.palette.secondary.main,
      opacity: 0.5,
      filter: "blur(5px)",
      transform: "rotate(-5deg)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 15,
      right: -5,
      zIndex: -1,
      display: "block",
      width: 20,
      height: 200,
      opacity: 0.5,
      background: theme.palette.secondary.main,
      filter: "blur(5px)",
      transform: "rotate(5deg)",
    },

    "& p": {
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: "2rem",
      textAlign: "justify",
      "& > span.gatsby-resp-image-wrapper": {
        maxWidth: "800px !important",
        "& ~ em": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "small",
        },
      },
      "& > img ~ em": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "smaller",
      },
      "& > img": {
        width: "80%",
        height: "auto",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
      },
    },
    "& li": {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(),
      "& > p": {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
      },
    },
    "& blockquote": {
      borderLeftWidth: theme.spacing(),
      borderLeftStyle: "solid",
      borderLeftColor: theme.palette.secondary.main,
      margin: "1.5em 0",
      padding: "0.25em 10px",
      color: darken(theme.typography.caption.color as string, 0.4),
      "& p": {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
      },
    },
    "& a": {
      color: theme.palette.primary.main,
    },
    "& h2": {
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
      borderBottomColor: theme.palette.primary.main,
    },
    "& div.gatsby-highlight": {
      '& pre[class*="language-"].line-numbers': {
        fontFamily: "Menlo, Consolas, ".concat(
          theme.typography.fontFamily as string
        ),
        "& span.line-numbers-rows": {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          fontSize: theme.typography.fontSize * 0.75,
          "& span": {
            "&::before": {
              lineHeight: "auto",
              borderBottom: "none",
              color: "rgba(248, 248, 242, 0.75)",
            },
          },
        },
      },
      '& code[class*="language-"]': {
        fontSize: theme.typography.fontSize * 0.75,
        fontFamily: "Menlo, Consolas,".concat(
          theme.typography.fontFamily as string
        ),
      },
    },
    '& :not(pre) > code[class*="language-"]': {
      background:
        theme.palette.type === "dark"
          ? lighten(theme.palette.background.default, 0.15)
          : darken(theme.palette.background.default, 0.04),
      color: theme.palette.type === "dark" ? orange["600"] : pink["500"],
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: theme.spacing(),
      paddingLeft: theme.spacing(),
      borderRadius: 5,
      fontFamily: "Menlo, Consolas,".concat(
        theme.typography.fontFamily as string
      ),
    },
    "& div.gatsby-code-button": {
      background: "#c4c4c4",
    },
    "& table": {
      border: "2px solid",
      borderColor: theme.palette.secondary.main,
      width: "100%",
      textAlign: "center",
      borderCollapse: "collapse",

      "& td, th": {
        border: "1px solid",
        borderColor: theme.palette.secondary.main,
        padding: "3px 4px",
      },
      "& tbody td": {
        fontSize: theme.typography.fontSize,
      },
      "& thead": {
        background: theme.palette.background,
        borderBottom: "4px solid",
        borderBottomColor: theme.palette.secondary.main,

        "& th": {
          fontSize: theme.typography.fontSize * 1.1,
          fontWeight: "bold",
          textAlign: "center",
          borderLeft: "2px solid",
          borderLeftColor: theme.palette.secondary.main,
          "&:first-child": {
            borderLeft: "none",
          },
        },
      },
    },
  } as StyleRules);

export default blogContentStyles;

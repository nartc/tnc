import { grey, pink } from "@material-ui/core/colors";
import { darken, Theme } from "@material-ui/core/styles";
import { StyleRules } from "@material-ui/styles";

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
      opacity: 0.15,
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
      background: theme.palette.secondary.main,
      filter: "blur(5px)",
      transform: "rotate(5deg)",
    },

    "& p": {
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: "1.5rem",
      textAlign: "justify",
      "& > span.gatsby-resp-image-wrapper ~ em": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "smaller",
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
      color: darken(theme.typography.caption.color, 0.4),
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
        fontFamily: "Menlo, Consolas, ".concat(theme.typography.fontFamily as string),
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
        fontFamily: "Menlo, ".concat(theme.typography.fontFamily as string),
      },
    },
    '& :not(pre) > code[class*="language-"]': {
      background: grey["100"],
      color: pink["500"],
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: theme.spacing(),
      paddingLeft: theme.spacing(),
      borderRadius: 5,
    },
    "& div.gatsby-code-button": {
      background: "#c4c4c4",
    },
  } as StyleRules);

export default blogContentStyles;

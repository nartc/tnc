import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { ReplaceComponentRendererArgs } from "gatsby";
import React, { FC, ReactElement, useMemo } from "react";
import Togglers from "../components/togglers";
import { LanguageChangerProvider } from "../contexts/language-changer-context";
import {
  ThemeChangerProvider,
  useThemeChangerContext,
} from "../contexts/theme-changer-context";
import useLanguageChange from "../utils/hooks/useLanguageChange";
import buildTheme from "../utils/mui-theme";

type LayoutProps = {
  children: ReactElement<ReplaceComponentRendererArgs["props"]>;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { theme } = useThemeChangerContext();
  // usePreferredColorScheme(setTheme);
  const muiTheme = useMemo(() => buildTheme(theme), [theme]);
  useLanguageChange(children.props);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Togglers />
      {children}
    </ThemeProvider>
  );
};

const LayoutWithThemeChanger: FC = ({ children }) => {
  const initialLang =
    (children as any).key && (children as any).key.includes("/vi")
      ? "vi"
      : "en";

  return (
    <ThemeChangerProvider>
      <LanguageChangerProvider initialLang={initialLang}>
        <Layout>{children as any}</Layout>
      </LanguageChangerProvider>
    </ThemeChangerProvider>
  );
};

export default LayoutWithThemeChanger;

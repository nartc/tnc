import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import React, { FC, useMemo } from "react";
import ThemeToggler from "../components/theme-toggler";
import {
  ThemeChangerProvider,
  useThemeChangerContext,
} from "../contexts/theme-changer-context";
import usePreferredColorScheme from "../utils/hooks/usePreferredColorScheme";
import buildTheme from "../utils/mui-theme";

const Layout: FC = ({ children }) => {
  const { theme, setTheme } = useThemeChangerContext();
  usePreferredColorScheme(setTheme);

  const muiTheme = useMemo(() => buildTheme(theme), [theme]);

  console.log(muiTheme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeToggler />
      {children}
    </ThemeProvider>
  );
};

const LayoutWithThemeChanger: FC = ({ children }) => {
  return (
    <ThemeChangerProvider>
      <Layout>{children}</Layout>
    </ThemeChangerProvider>
  );
};

export default LayoutWithThemeChanger;

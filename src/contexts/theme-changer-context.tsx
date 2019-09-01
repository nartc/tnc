import React, {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";

export type BlogTheme = "light" | "dark";

export type ThemeChangerContext = {
  theme: BlogTheme;
  setTheme: Dispatch<SetStateAction<BlogTheme>>;
};

const context = createContext<ThemeChangerContext | null>(null);

export const ThemeChangerProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState<BlogTheme>("light");

  return (
    <context.Provider value={{ theme, setTheme: useCallback(setTheme, []) }}>
      {children}
    </context.Provider>
  );
};

export const useThemeChangerContext = () => {
  const ctx = useContext(context) as ThemeChangerContext;

  if (ctx === undefined) {
    throw new Error(
      "useThemeChangerContext must be used within ThemeChangerProvider"
    );
  }

  return ctx;
};

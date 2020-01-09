import React, {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";

export type Lang = "en" | "vi";

export type LanguageChangerContext = {
  lang: Lang;
  setLang: Dispatch<SetStateAction<Lang>>;
};

const context = createContext<LanguageChangerContext | null>(null);

export const LanguageChangerProvider: FC = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <context.Provider value={{ lang, setLang: useCallback(setLang, []) }}>
      {children}
    </context.Provider>
  );
};

export const useLanguageChangerContext = () => {
  const ctx = useContext(context) as LanguageChangerContext;

  if (ctx === undefined) {
    throw new Error(
      "useLanguageChangerContext must be used within LanguageChangerProvider"
    );
  }

  return ctx;
};

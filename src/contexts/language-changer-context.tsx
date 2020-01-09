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

type LanguageChangerProviderProps = {
  initialLang: Lang;
};

export const LanguageChangerProvider: FC<LanguageChangerProviderProps> = ({
  children,
  initialLang,
}) => {
  const [lang, setLang] = useState<Lang>(initialLang);
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

import { ReplaceComponentRendererArgs } from "gatsby";
import { useEffect, useRef } from "react";
import { useLanguageChangerContext } from "../../contexts/language-changer-context";

export default (pageProps: ReplaceComponentRendererArgs["props"]) => {
  const firstRender = useRef(false);
  const { lang } = useLanguageChangerContext();
  const { path, navigate } = pageProps;

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
    } else {
      if (lang === "en") {
        if (path.startsWith("/blogs") || path.includes("/tags")) {
          navigate(path.replace("/vi", ""));
        }
      } else {
        if (path.startsWith("/blogs")) {
          navigate(path.replace("/blogs", "/blogs/vi"));
        } else if (path.includes("/tags")) {
          navigate(path.replace("/tags", "/vi/tags"));
        }
      }
    }
  }, [lang]);
};

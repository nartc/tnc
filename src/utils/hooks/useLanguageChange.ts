import { ReplaceComponentRendererArgs } from "gatsby";
import { useEffect, useRef } from "react";
import { useLanguageChangerContext } from "../../contexts/language-changer-context";

export default (pageProps: ReplaceComponentRendererArgs["props"]) => {
  const firstRender = useRef(false);
  const { lang } = useLanguageChangerContext();
  const { path, navigate, data } = pageProps;

  const isBlogItem = data && !!(data as any).markdownRemark;
  const langs = (data as any)?.markdownRemark?.frontmatter?.langs;

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
    } else {
      if (lang === "en") {
        if (path.startsWith("/blogs") || path.includes("/tags")) {
          navigate(path.replace("/vi", ""), { replace: true });
        }
      } else {
        if (isBlogItem) {
          if (langs && langs.length >= 2) {
            navigate(
              path.includes("/blogs/vi")
                ? path
                : path.replace("/blogs", "/blogs/vi"),
              { replace: true }
            );
          }
        } else {
          if (path.startsWith("/blogs")) {
            navigate(
              path.includes("/blogs/vi")
                ? path
                : path.replace("/blogs", "/blogs/vi"),
              { replace: true }
            );
          } else if (path.includes("/tags")) {
            navigate(
              path.includes("/tags/vi")
                ? path
                : path.replace("/tags", "/vi/tags"),
              { replace: true }
            );
          }
        }
      }
    }
  }, [lang]);
};

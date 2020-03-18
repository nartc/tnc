import { PageProps } from "gatsby";
import { useEffect, useRef } from "react";
import { useLanguageChangerContext } from "../../contexts/language-changer-context";
import { Query } from "../../graph-types";

export default (pageProps: PageProps<Query>) => {
  const firstRender = useRef(false);
  const { lang } = useLanguageChangerContext();
  const { path, navigate, data } = pageProps;

  const isBlogItem = data && !!data.markdownRemark;
  const langs = data?.markdownRemark?.frontmatter?.langs;

  console.log({ lang, path, navigate, data, isBlogItem, langs });

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
    } else {
      (async () => {
        if (lang === "en") {
          if (path.startsWith("/blogs") || path.includes("/tags")) {
            await navigate(path.replace("/vi", ""), { replace: true });
          }
        } else {
          if (isBlogItem) {
            if (langs && langs.length >= 2) {
              await navigate(
                path.includes("/blogs/vi")
                  ? path
                  : path.replace("/blogs", "/blogs/vi"),
                { replace: true }
              );
            }
          } else {
            if (path.startsWith("/blogs")) {
              await navigate(
                path.includes("/blogs/vi")
                  ? path
                  : path.replace("/blogs", "/blogs/vi"),
                { replace: true }
              );
            } else if (path.includes("/tags")) {
              await navigate(
                path.includes("/tags/vi")
                  ? path
                  : path.replace("/tags", "/vi/tags"),
                { replace: true }
              );
            }
          }
        }
      })();
    }
  }, [lang, isBlogItem, langs, path, firstRender.current]);
};

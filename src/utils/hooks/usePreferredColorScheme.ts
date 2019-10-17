import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { BlogTheme } from "../../contexts/theme-changer-context";

export const colorSchemes = {
  DARK: "(prefers-color-scheme: dark)",
  LIGHT: "(prefers-color-scheme: light)",
};

export default (setTheme: Dispatch<SetStateAction<BlogTheme>>) => {
  const isSettingUp = useRef(false);

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    const listener = (mql: MediaQueryListEvent) => {
      if (!mql || !mql.matches) {
        return;
      }

      const schemes = Object.keys(colorSchemes);
      for (let i = 0; i < schemes.length; i++) {
        const schemeName = schemes[i] as "DARK" | "LIGHT";
        if (mql.media === colorSchemes[schemeName]) {
          setTheme(schemeName.toLowerCase() as BlogTheme);
          break;
        }
      }
    };

    let activeMatches: MediaQueryList[] = [];
    Object.values(colorSchemes).forEach(scheme => {
      const mq = window.matchMedia(scheme);
      mq.addEventListener("change", listener);
      activeMatches.push(mq);
    });

    if (!isSettingUp.current) {
      for (let i = 0; i < activeMatches.length; i++) {
        const mq = activeMatches[i];
        if (mq.matches) {
          const _scheme = Object.keys(colorSchemes).find(key => {
            return colorSchemes[key as "DARK" | "LIGHT"] === mq.media;
          });
          // @ts-ignore
          setTheme(_scheme.toLowerCase() as BlogTheme);
          isSettingUp.current = true;
          break;
        }
      }
    }

    return () => {
      activeMatches.forEach(mq => mq.removeEventListener("change", listener));
      activeMatches = [];
    };
  });
};

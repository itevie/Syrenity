import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./lang/en.json";
import sk from "./lang/sk.json";
import { CommandPaletteProviderManager } from "./dawn-ui/components/CommandPaletteManager";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      sk: {
        translation: sk,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

CommandPaletteProviderManager.register({
  name: "Languages",
  exec: (query) => {
    if (["sk", "en", "..."].includes(query)) {
      return [
        {
          name: `Switch language to ${query}`,
          callback: () => {
            i18n.changeLanguage(query);
          },
        },
      ];
    }

    return [];
  },
});

// i18n.changeLanguage("sk");

export default i18n;

const t = i18n.t as any;
export { t as trans };

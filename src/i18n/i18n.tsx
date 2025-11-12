import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nothingPlaying": "Nothing is playing",
      "changeTheme": "Change theme",
    }
  },
  ru: {
    translation: {
      "nothingPlaying": "Ничего не играет",
      "changeTheme": "Сменить тему",
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
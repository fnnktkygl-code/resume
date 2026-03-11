import { createContext, useContext } from 'react';
import { getTranslation } from './translations';

export const TranslationContext = createContext('en');

export const useTranslation = () => {
  const lang = useContext(TranslationContext);
  return {
    t: (key) => getTranslation(lang, key),
    lang
  };
};

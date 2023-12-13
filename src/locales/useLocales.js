import { useTranslation } from 'react-i18next';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';
// components
import { useSettingsContext } from '../components/settings';
//
import { allLangs } from './config-lang';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n, t: translate } = useTranslation();

  const { onChangeDirectionByLang, themeDnsData } = useSettingsContext();

  const storageAvailable = localStorageAvailable();

  const langStorage = storageAvailable ? localStorage.getItem('i18nextLng') : themeDnsData?.setting_obj?.default_lang;

  const currentLang = allLangs.find((_lang) => _lang.value === langStorage) || themeDnsData?.setting_obj?.default_lang;
  const handleChangeLanguage = (newlang) => {
    i18n.changeLanguage(newlang);
    onChangeDirectionByLang(newlang);
  };

  return {
    onChangeLang: handleChangeLanguage,
    translate: (text, options) => translate(text, options),
    currentLang,
    allLangs,
  };
}

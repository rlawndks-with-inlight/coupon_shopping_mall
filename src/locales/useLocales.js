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

  // i18n 활성 언어를 우선 사용 (UI/국기가 항상 일치하도록). 없으면 localStorage → 기본 언어 순
  const langStorage = i18n.language
    || (storageAvailable ? localStorage.getItem('i18nextLng') : null)
    || (themeDnsData?.setting_obj?.default_lang ?? 'ko');

  const currentLang = allLangs.find((_lang) => _lang.value === langStorage)
    || allLangs.find((_lang) => _lang.value === String(langStorage).split('-')[0])
    || allLangs.find((_lang) => _lang.value === (themeDnsData?.setting_obj?.default_lang ?? 'ko'))
    || allLangs[0];

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

// @mui
import { enUS, zhCN, koKR, jaJP, esES } from '@mui/material/locale';
import { useSettingsContext } from 'src/components/settings';
import { getLocalStorage } from 'src/utils/local-storage';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Korean',
    value: 'ko',
    systemValue: koKR,
    icon: '/assets/icons/flags/ic_flag_kr.svg',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: '/assets/icons/flags/ic_flag_us.svg',
  },
  {
    label: 'Japanese',
    value: 'ja',
    systemValue: jaJP,
    icon: '/assets/icons/flags/ic_flag_jp.svg',
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: zhCN,
    icon: '/assets/icons/flags/ic_flag_cn.svg',
  },
  {
    label: 'Spanish',
    value: 'es',
    systemValue: esES,
    icon: '/assets/icons/flags/ic_flag_es.svg',
  },
]

export const defaultLang = allLangs[0];

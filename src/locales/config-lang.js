// @mui
import { enUS, frFR, zhCN, viVN, arSA, koKR, jaJP } from '@mui/material/locale';
import { useSettingsContext } from 'src/components/settings';
import { getLocalStorage } from 'src/utils/local-storage';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: '/assets/icons/flags/ic_flag_us.svg',
  },
  {
    label: 'Korean',
    value: 'ko',
    systemValue: koKR,
    icon: '/assets/icons/flags/ic_flag_kr.svg',
  },
  {
    label: 'Japanese',
    value: 'ja',
    systemValue: jaJP,
    icon: '/assets/icons/flags/ic_flag_jp.svg',
  },
  {
    label: 'French',
    value: 'fr',
    systemValue: frFR,
    icon: '/assets/icons/flags/ic_flag_fr.svg',
  },
  {
    label: 'Vietnamese',
    value: 'vi',
    systemValue: viVN,
    icon: '/assets/icons/flags/ic_flag_vn.svg',
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: zhCN,
    icon: '/assets/icons/flags/ic_flag_cn.svg',
  },
  {
    label: 'Arabic (Sudan)',
    value: 'ar',
    systemValue: arSA,
    icon: '/assets/icons/flags/ic_flag_sa.svg',
  },
]

export const defaultLang = allLangs[0];
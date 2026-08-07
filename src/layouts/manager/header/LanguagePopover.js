import { useState } from 'react';
// @mui
import { MenuItem, Stack } from '@mui/material';
// locales
import { useLocales } from '../../../locales';
// components
import Image from '../../../components/image';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const { allLangs, currentLang, onChangeLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeLang = (newLang) => {
    onChangeLang(newLang);
    handleClosePopover();
  };

  // lang_list 가 없거나 비어 있으면 전체 언어를 보여준다.
  // 백엔드는 예전부터 'lang_list 미설정 = 전체 언어'로 동작하는데 프론트만 걸러내고 있어서,
  // lang_list 가 없는 구형 브랜드에서는 아이콘은 떠도 드롭다운이 텅 비어 언어를 고를 수 없었다.
  // (lang_list 가 있는 브랜드는 기존 그대로 그 목록만 노출된다)
  const lang_list = themeDnsData?.setting_obj?.lang_list;
  const filtered_langs = lang_list?.length > 0 ? allLangs.filter((option) => lang_list.includes(option.value)) : [];
  const show_langs = filtered_langs.length > 0 ? filtered_langs : allLangs;

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          width: 40,
          height: 40,
          ...(openPopover && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        <Image disabledEffect src={currentLang.icon} alt={currentLang.label} />
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 180 }}>
        <Stack spacing={0.75}>
          {show_langs.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => handleChangeLang(option.value)}
            >
              <Image
                disabledEffect
                alt={option.label}
                src={option.icon}
                sx={{ width: 28, mr: 2 }}
              />
              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}

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
    window.location.reload();
  };

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
          {allLangs.map((option) => {
            if (themeDnsData?.setting_obj?.lang_list && themeDnsData?.setting_obj?.lang_list.includes(option.value)) {
              return <MenuItem
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
            }
          })}
        </Stack>
      </MenuPopover>
    </>
  );
}

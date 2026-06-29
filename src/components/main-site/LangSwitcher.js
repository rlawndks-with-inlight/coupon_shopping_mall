import { useState } from 'react';
import { Box, Stack, Menu, MenuItem, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocales } from 'src/locales';

// 메인 사이트 헤더용 언어 선택기 (5개국어 전체 노출)
export default function LangSwitcher({ dark = false }) {
  const { allLangs, currentLang, onChangeLang } = useLocales();
  const [anchor, setAnchor] = useState(null);
  const textColor = dark ? '#fff' : '#111';

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.6}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          cursor: 'pointer',
          px: 1,
          py: 0.5,
          borderRadius: 999,
          '&:hover': { bgcolor: dark ? 'rgba(255,255,255,0.1)' : '#f3f4ef' },
        }}
      >
        <Box
          component="img"
          src={currentLang?.icon}
          alt={currentLang?.value}
          sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
        <Icon icon="tabler:chevron-down" width={14} color={textColor} />
      </Stack>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1, minWidth: 150, borderRadius: 2 } }}
      >
        {allLangs.map((lang) => (
          <MenuItem
            key={lang.value}
            selected={lang.value === currentLang?.value}
            onClick={() => {
              onChangeLang(lang.value);
              setAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <Box
              component="img"
              src={lang.icon}
              alt={lang.value}
              sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', mr: 1.5 }}
            />
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{lang.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

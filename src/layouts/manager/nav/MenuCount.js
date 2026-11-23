import { Box } from '@mui/material';
import { 건수글자 } from 'src/utils/order-menu-counts';

// 관리자 왼쪽 메뉴 옆 건수 표시(해담수산 요청 2026-11-23). 0이면 null — 메뉴 칸에 빈 자리도 남기지 않는다.
//   이름: 마우스를 올리면 뜨는 설명과 화면 읽기 프로그램이 읽는 말(예: 「결제완료 3건」).
export const 메뉴건수 = (n, 이름) => {
  const 수 = Math.max(0, Number(n) || 0);
  if (!수) return null;
  return (
    <Box
      component="span"
      title={이름}
      aria-label={이름}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        px: 0.75,
        borderRadius: 10,
        bgcolor: 'error.main',
        color: 'error.contrastText',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      {건수글자(수)}
    </Box>
  );
};

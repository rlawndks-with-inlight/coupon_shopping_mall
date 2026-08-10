import { Chip } from '@mui/material';
import { getProductStatus } from 'src/utils/function';
import { useLocales } from 'src/locales';

// 표준 상태맵 전용 상품 상태 배지. 판매중(0)은 표시 안 함(잡음 방지).
// 새상품(3)=파란 칩, 품절(2)/중단됨(1)=회색 칩 + 딤 오버레이. (특수맵 데모 4/5에는 사용하지 않음)
export const ProductStatusBadge = ({ status }) => {
  // 상태 문구('판매중'·'품절'…)가 번역을 안 거쳐 다른 언어 화면에서도 한국어로 남았다.
  const { translate } = useLocales();
  const s = Number(status);
  const info = getProductStatus(s);
  if (s === 0 || !info?.text) return null;
  const blocked = s === 1 || s === 2;
  return (
    <>
      {blocked && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', borderRadius: 'inherit' }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.05em', color: '#555' }}>{s === 2 ? 'SOLD OUT' : translate('중단됨')}</span>
        </div>
      )}
      <Chip size="small" label={translate(info.text)} color={blocked ? 'default' : info.color} variant={blocked ? 'filled' : 'soft'}
        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 3, fontWeight: 700, pointerEvents: 'none' }} />
    </>
  );
};

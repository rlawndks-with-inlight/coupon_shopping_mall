import { useState } from 'react';
import {
  Box, Button, Card, Chip, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, OutlinedInput,
  Radio, RadioGroup, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useModal } from 'src/components/dialog/ModalProvider';
import { 금액표시, 금액입력 } from 'src/utils/money-input';
import { 추가배송비, 섬설정, 섬설정검사, 연륙겹침, 추가비상한, 규칙최대 } from 'src/utils/island-fee';
import { 기준일, 도서산간, 제주섬 } from 'src/utils/island-zips';

// 설정관리 › 기본설정 › 배송비설정 — 제주·도서산간 추가배송비(사장님 결정 2026-11-12).
//
// 몰마다 지역별로 「추가비 없음(기본) · 추가비 받기 · 배송 안 함」, 지역 기준은 SHOPGO 기준표 + 몰이 직접 고친 규칙.
// 값은 setting_obj.island_fee 에 저장된다. 판정·검사는 island-fee.js(서버와 같은 파일) — 여기서 따로 계산하지 않는다.
// 서버(brand.controller)가 저장 전에 같은 검사(섬설정검사)를 다시 한다.

const 지역들 = [
  { key: 'jeju', 이름: '제주', 설명: '제주 본섬(우편번호 63000~63644)' },
  { key: 'island', 이름: '제주 외 도서산간', 설명: '울릉도, 서해·남해의 섬, 제주 안의 섬(추자도·우도·가파도)' },
];
const 판정글 = { jeju: '제주', island: '제주 외 도서산간', normal: '일반 지역', overseas: '해외 주소(대상 아님)' };

const 규칙글 = (r) => (r.type === 'area' ? r.text : (r.from === r.to ? `우편번호 ${r.from}` : `우편번호 ${r.from} ~ ${r.to}`));

export default function IslandFeeSettings({ value, onChange }) {
  const { setModal } = useModal();
  const 설정 = 섬설정({ island_fee: value });
  const 원본 = value ?? {};
  const 바꾸기 = (다음) => onChange({ ...원본, ...다음 });
  const 지역값 = (key) => ({ mode: 원본?.[key]?.mode ?? 'none', amount: 원본?.[key]?.amount ?? '' });

  const [직접, set직접] = useState((설정.rules ?? []).length > 0);
  const [새규칙, set새규칙] = useState({ kind: 'add', type: 'zip', from: '', to: '', text: '' });
  const [규칙오류, set규칙오류] = useState('');
  const [확인칸, set확인칸] = useState('');
  const [목록보기, set목록보기] = useState(false);

  const 방식바꾸기 = (key, mode) => {
    const 적용 = () => 바꾸기({ [key]: { ...지역값(key), mode } });
    if (mode === 'block') {
      setModal({
        func: 적용,
        icon: 'material-symbols:block',
        title: `${key === 'jeju' ? '제주' : '제주 외 도서산간'} 지역은 배송하지 않을까요?`,
        content: '이 지역 주소로는 손님이 주문할 수 없습니다(결제 전에 막습니다).\n신선·냉동 상품처럼 섬까지 보내기 어려울 때만 고르세요.',
      });
      return;
    }
    적용();
  };

  const 규칙들 = Array.isArray(원본?.rules) ? 원본.rules : [];
  const 규칙추가 = () => {
    const 후보 = 새규칙.type === 'area'
      ? { kind: 새규칙.kind, type: 'area', text: 새규칙.text }
      : { kind: 새규칙.kind, type: 'zip', from: 새규칙.from, to: 새규칙.to || 새규칙.from };
    const 검사 = 섬설정검사({ rules: [후보] });
    if (검사.오류) { set규칙오류(검사.오류); return; }
    if (규칙들.length >= 규칙최대) { set규칙오류(`직접 고친 지역은 ${규칙최대}개까지 넣을 수 있습니다.`); return; }
    set규칙오류('');
    바꾸기({ rules: [...규칙들, 검사.값.rules[0]] });
    set새규칙({ ...새규칙, from: '', to: '', text: '' });
  };
  const 규칙삭제 = (i) => 바꾸기({ rules: 규칙들.filter((_, j) => j !== i) });
  const 기준바꾸기 = (v) => {
    if (v === 'base' && 규칙들.length) {
      setModal({
        func: () => { set직접(false); 바꾸기({ rules: [] }); },
        icon: 'material-symbols:restart-alt',
        title: '직접 고친 지역을 모두 지울까요?',
        content: `직접 고친 지역 ${규칙들.length}개가 지워지고 SHOPGO 기준표만 씁니다.`,
      });
      return;
    }
    set직접(v === 'custom');
  };

  // 주소 확인해 보기 — 지금 화면의(저장 전) 설정으로 판정한다
  const 확인값 = String(확인칸 ?? '').trim();
  const 확인 = 확인값 ? 추가배송비(/^\d{5}$/.test(확인값) ? { zonecode: 확인값 } : { addr: 확인값 }, { island_fee: value }) : null;

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">제주·도서산간 추가배송비</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            처음에는 두 지역 모두 「추가비 없음」이라 지금과 똑같이 받습니다. 무료배송 주문에도 추가배송비는 붙고, 주문 한 건에 한 번만 붙습니다.
          </Typography>
        </Stack>

        {지역들.map((지) => {
          const v = 지역값(지.key);
          return (
            <Stack key={지.key} spacing={0.75}>
              <Typography variant="subtitle2">{지.이름} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>({지.설명})</Typography></Typography>
              <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap columnGap={1.5} rowGap={1}>
                <RadioGroup row value={v.mode} onChange={(e) => 방식바꾸기(지.key, e.target.value)}>
                  <FormControlLabel value="none" control={<Radio size="small" />} label="추가비 없음" />
                  <FormControlLabel value="charge" control={<Radio size="small" />} label="추가비 받기" />
                  <FormControlLabel value="block" control={<Radio size="small" />} label="배송 안 함" />
                </RadioGroup>
                {v.mode === 'charge' && (
                  <FormControl variant="outlined" size="small" sx={{ width: 160 }}>
                    <InputLabel>추가배송비</InputLabel>
                    <OutlinedInput label="추가배송비" type="text" inputProps={{ inputMode: 'numeric' }}
                      value={금액표시(v.amount)}
                      endAdornment={<InputAdornment position="end">원</InputAdornment>}
                      onChange={(e) => 바꾸기({ [지.key]: { mode: 'charge', amount: 금액입력(e) } })} />
                  </FormControl>
                )}
                {v.mode === 'block' && <Chip size="small" color="error" variant="outlined" label="이 지역 주소는 주문할 수 없습니다" />}
              </Stack>
            </Stack>
          );
        })}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          금액은 쓰시는 택배사 요금에 맞춰 넣으세요(최대 {추가비상한.toLocaleString('ko-KR')}원). 예) 한진택배 공식 요금: 제주 3,000원, 섬 지역 5,000원 · 우체국택배 공식 요금표에는 섬 지역 추가요금이 없습니다.
        </Typography>

        <Stack spacing={1}>
          <Typography variant="subtitle2">어느 주소를 제주·도서산간으로 볼까요</Typography>
          <RadioGroup value={직접 ? 'custom' : 'base'} onChange={(e) => 기준바꾸기(e.target.value)}>
            <FormControlLabel value="base" control={<Radio size="small" />} label={`SHOPGO 기준표 그대로 쓰기 (권장, 기준 ${기준일})`} />
            <FormControlLabel value="custom" control={<Radio size="small" />} label="SHOPGO 기준표 + 우리 몰이 직접 고치기" />
          </RadioGroup>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            SHOPGO 기준표: 제주 63000~63644, 제주 외 도서산간 우편번호 {도서산간.length + 제주섬.length}개. 공개된 기준표 두 곳이 함께 섬으로 본 곳만 넣었고, 2025년 공정위가 지적한 「다리로 이어진 섬」은 뺐습니다.{' '}
            <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => set목록보기((x) => !x)}>
              {목록보기 ? '목록 접기' : '목록 보기'}
            </Box>
          </Typography>
          {목록보기 && (
            <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1, fontSize: 12.5, color: 'text.secondary', lineHeight: 1.9, wordBreak: 'keep-all' }}>
              제주 안의 섬: {제주섬.join(', ')}<br />
              그 밖의 섬: {도서산간.join(', ')}
            </Box>
          )}

          {직접 && (
            <Stack spacing={1.25} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                택배사에서 받은 도서산간 목록이 SHOPGO 기준표와 다를 때만 씁니다. 여기 넣은 내용이 기준표보다 먼저 적용됩니다.
              </Typography>
              {규칙들.length === 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>아직 고친 지역이 없습니다.</Typography>}
              {규칙들.map((r, i) => {
                const 겹침 = 연륙겹침(r);
                return (
                  <Stack key={i} direction="row" alignItems="center" flexWrap="wrap" useFlexGap columnGap={1} rowGap={0.5}>
                    <Chip size="small" color={r.kind === 'add' ? 'warning' : 'default'} label={r.kind === 'add' ? '도서산간에 더하기' : '일반으로 빼기'} />
                    <Typography variant="body2">{규칙글(r)}</Typography>
                    {겹침.length > 0 && (
                      <Chip size="small" color="error" variant="outlined"
                        label={`다리로 이어진 섬이 있습니다(${겹침.slice(0, 3).join(', ')}${겹침.length > 3 ? ' 등' : ''})`} />
                    )}
                    <Button size="small" color="inherit" onClick={() => 규칙삭제(i)}>삭제</Button>
                  </Stack>
                );
              })}
              <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap columnGap={1} rowGap={1}>
                <Select size="small" value={새규칙.kind} onChange={(e) => set새규칙({ ...새규칙, kind: e.target.value })}>
                  <MenuItem value="add">도서산간에 더하기</MenuItem>
                  <MenuItem value="remove">일반으로 빼기</MenuItem>
                </Select>
                <Select size="small" value={새규칙.type} onChange={(e) => set새규칙({ ...새규칙, type: e.target.value })}>
                  <MenuItem value="zip">우편번호</MenuItem>
                  <MenuItem value="area">시·군·구</MenuItem>
                </Select>
                {새규칙.type === 'zip' ? (
                  <>
                    <TextField size="small" placeholder="시작 번호" value={새규칙.from} inputProps={{ inputMode: 'numeric', maxLength: 5 }} sx={{ width: 110 }}
                      onChange={(e) => set새규칙({ ...새규칙, from: e.target.value.replace(/\D/g, '') })} />
                    <Typography variant="body2">~</Typography>
                    <TextField size="small" placeholder="끝 번호(선택)" value={새규칙.to} inputProps={{ inputMode: 'numeric', maxLength: 5 }} sx={{ width: 130 }}
                      onChange={(e) => set새규칙({ ...새규칙, to: e.target.value.replace(/\D/g, '') })} />
                  </>
                ) : (
                  <TextField size="small" placeholder="예: 전남 신안군" value={새규칙.text} sx={{ width: 200 }}
                    onChange={(e) => set새규칙({ ...새규칙, text: e.target.value })} />
                )}
                <Button size="small" variant="outlined" onClick={규칙추가}>추가</Button>
              </Stack>
              {규칙오류 && <Typography variant="caption" sx={{ color: 'error.main' }}>{규칙오류}</Typography>}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                「다리로 이어진 섬」 표시가 붙은 지역에 추가비를 받으면 2025년 공정위가 문제 삼은 사례처럼 될 수 있습니다. 택배사가 실제로 추가비를 받는지 확인하고 넣으세요.
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack spacing={0.75}>
          <Typography variant="subtitle2">주소 확인해 보기</Typography>
          <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap columnGap={1} rowGap={1}>
            <TextField size="small" placeholder="우편번호 5자리 또는 주소(예: 경북 울릉군 울릉읍)" value={확인칸} sx={{ width: 320 }}
              onChange={(e) => set확인칸(e.target.value)} />
            {확인 && (
              <Chip size="small"
                color={확인.blocked ? 'error' : 확인.fee > 0 ? 'warning' : 'default'}
                label={`${판정글[확인.region]} · ${확인.blocked ? '배송 안 함' : 확인.fee > 0 ? `+${확인.fee.toLocaleString('ko-KR')}원` : '추가비 없음'}`} />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            손님 문의를 받았을 때 그 주소에 추가배송비가 붙는지 바로 확인할 수 있습니다. 저장 전 설정으로 계산합니다.
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

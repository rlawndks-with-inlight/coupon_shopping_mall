import { useEffect, useRef, useState } from 'react';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import axios from 'axios';
import { commarNumber } from 'src/utils/function';
import { 기본택배사 } from 'src/data/couriers';
import { 송장엑셀읽기 } from 'src/utils/invoice-excel';

// 송장 엑셀 일괄 등록(가맹점 요청 2026-11-12 「엑셀에도 송장번호를 입력할 수 있게」).
//
// 내려받은 주문 엑셀의 「송장번호」 칸에 번호를 적어 올린다. 주문번호로 주문을 찾는다.
//   ① 파일을 고르면 서버가 미리 확인만 한다(저장 안 함) — 등록·변경·같음·오류를 줄마다 보여 준다.
//   ② 「N건 저장」을 누르면 서버가 지금 값으로 다시 판정해 등록·변경 줄만 저장한다. 주문마다 이력에 「(엑셀)」로 남는다.
// 판정 규칙은 서버 utils.js/invoice-bulk.js 한 곳에 있다(화면은 파일을 읽어 넘기기만 한다).

const 결과색 = { 등록: 'success', 변경: 'warning', 같음: 'default', 오류: 'error' };
const 보일순서 = { 오류: 0, 변경: 1, 등록: 2, 같음: 3 };

const InvoiceExcelDialog = ({ open, onClose, onDone, dns }) => {
  const [파일이름, set파일이름] = useState('');
  const [줄들, set줄들] = useState(null);     // 서버로 보낼 줄(송장 칸이 빈 줄은 뺐다)
  const [읽기오류, set읽기오류] = useState('');
  const [판정, set판정] = useState(null);
  const [바쁨, set바쁨] = useState(false);
  const 파일칸 = useRef(null);

  useEffect(() => {
    if (!open) return;
    set파일이름(''); set줄들(null); set읽기오류(''); set판정(null); set바쁨(false);
  }, [open]);

  // JSON 으로 보낸다. apiManager 의 create 는 multipart 인데 서버 multer 가 필드 500개까지만 받아서
  // 1,000줄(줄마다 칸 4개)이 넘어가지 않는다.
  const 확인 = async (rows, apply = false) => {
    set바쁨(true);
    try {
      const { data: r } = await axios.post('/api/transactions/invoice-bulk', { rows, apply: apply ? 1 : 0 });
      if (r?.result > 0) return r.data;
      toast.error(r?.message || '처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
      return null;
    } catch (err) {
      toast.error('처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
      return null;
    } finally {
      set바쁨(false);
    }
  };

  const 파일고름 = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    set파일이름(f.name); set판정(null); set읽기오류(''); set줄들(null);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const 읽음 = 송장엑셀읽기(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }));
      if (읽음.오류) { set읽기오류(읽음.오류); return; }
      set줄들(읽음.줄들);
      if (!읽음.줄들.length) { set읽기오류('「송장번호」 칸에 적힌 번호가 없습니다. 번호를 적은 뒤 다시 올려 주세요.'); return; }
      const r = await 확인(읽음.줄들);
      // 송장 칸이 빈 줄은 보내지 않았으므로 그 수는 화면이 센 값을 쓴다
      if (r) set판정({ ...r, 요약: { ...r.요약, 빈칸: 읽음.빈칸 } });
    } catch (err) {
      set읽기오류('파일을 읽지 못했습니다. 엑셀(.xlsx) 파일인지 확인해 주세요.');
    }
  };

  const 저장 = async () => {
    const r = await 확인(줄들, true);
    if (!r) return;
    const n = Number(r?.요약?.저장됨 ?? 0);
    toast.success(`송장 ${commarNumber(n)}건을 저장했습니다.`);
    onDone?.();
    onClose?.();
  };

  const 요약 = 판정?.요약;
  const 저장할수 = Number(요약?.등록 ?? 0) + Number(요약?.변경 ?? 0);
  const 보일줄 = [...(판정?.결과 ?? [])].sort((a, b) => (보일순서[a.결과] - 보일순서[b.결과]) || (a.줄 - b.줄));
  const 기본 = 기본택배사(dns);

  return (
    <Dialog open={open} onClose={바쁨 ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>송장 엑셀 등록</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="body2">
              「엑셀 내려받기」로 받은 주문 파일의 「송장번호」 칸에 번호를 적어 올리면 한 번에 등록됩니다. 주문번호로 주문을 찾습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              번호만 적으면 기본 택배사({기본 || '설정 안 됨: 번호만 저장'})로 들어갑니다. 다른 택배사는 「롯데택배-123456789」처럼 이름을 앞에 붙여 적거나, 「택배사」 칸을 새로 만들어 적어 주세요.
              송장번호 칸이 비어 있는 줄은 건너뜁니다. 한 번에 1,000건까지 올릴 수 있습니다.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="outlined" disabled={바쁨} onClick={() => 파일칸.current?.click()}>엑셀 파일 고르기</Button>
            <Typography variant="body2" color="text.secondary">{파일이름 || '고른 파일 없음'}</Typography>
            <input ref={파일칸} type="file" accept=".xlsx,.xls,.csv" hidden onChange={파일고름} />
          </Stack>

          {읽기오류 && <Alert severity="error">{읽기오류}</Alert>}
          {바쁨 && !판정 && <Typography variant="body2" color="text.secondary">확인하는 중…</Typography>}

          {요약 && <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip color="success" label={`새로 등록 ${commarNumber(요약.등록)}건`} />
              <Chip color="warning" label={`바뀜 ${commarNumber(요약.변경)}건`} />
              <Chip label={`같아서 건너뜀 ${commarNumber(요약.같음)}건`} />
              <Chip color="error" variant={요약.오류 ? 'filled' : 'outlined'} label={`저장 안 됨 ${commarNumber(요약.오류)}건`} />
              {요약.빈칸 > 0 && <Chip variant="outlined" label={`송장 칸 빈 줄 ${commarNumber(요약.빈칸)}줄`} />}
            </Stack>
            {Number(요약.변경) > 0 &&
              <Alert severity="warning">이미 송장이 있는 주문 {commarNumber(요약.변경)}건은 새 번호로 바뀝니다. 아래 「바뀜」 줄을 확인해 주세요.</Alert>}
            <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>엑셀 줄</TableCell>
                    <TableCell>주문번호</TableCell>
                    <TableCell>결과</TableCell>
                    <TableCell>내용</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {보일줄.map((x, i) => (
                    <TableRow key={`${x.줄}-${i}`}>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{x.줄}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{x.ord_num || '-'}</TableCell>
                      <TableCell><Chip size="small" color={결과색[x.결과]} variant={x.결과 === '같음' ? 'outlined' : 'filled'} label={x.결과 === '같음' ? '같음' : x.결과 === '오류' ? '저장 안 됨' : x.결과 === '변경' ? '바뀜' : '새로 등록'} /></TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        {x.결과 === '오류' ? x.사유 : x.결과 === '변경' ? `${x.이전} → ${x.새값}` : x.새값}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={바쁨}>닫기</Button>
        <Button variant="contained" disabled={!저장할수 || 바쁨} onClick={저장}>
          {바쁨 && 판정 ? '저장하는 중…' : `${commarNumber(저장할수)}건 저장`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceExcelDialog;

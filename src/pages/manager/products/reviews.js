import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Rating, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { apiManager } from "src/utils/api";
import { useSettingsContext } from "src/components/settings";
import { PATH_MANAGER } from "src/data/manager-data";
import { dateOnly } from "src/utils/review";

// 상품관리 › 후기관리 — 전 상품의 후기를 한 곳에서. 답글 · 숨김/해제 · BEST · 삭제.
// 켜고 끄기·작성 규칙은 설정관리 › 기본설정 › 「후기설정」 탭. (설계 문서 §8.1)
//
// 숨김(is_hidden)과 삭제(is_delete)는 다르다: 숨김은 손님 화면·집계에서만 빠지고 여기엔 남는다.
// 주문이 전액 취소되면 시스템이 「주문 취소」 사유로 숨긴다 — 그 후기도 여기서 다시 켤 수 있다.

const HIDE_REASONS = ['욕설·비방', '광고·홍보', '상품과 무관', '개인정보 노출', '기타'];

const ReviewManage = () => {
  const { setModal } = useModal();
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({ content: [], total: 0 }); // 빈 {} 면 ManagerTable 이 첫 렌더에 NaN 쪽수를 계산한다
  const [counts, setCounts] = useState({});
  const [settings, setSettings] = useState({});
  const [searchObj, setSearchObj] = useState({ page: 1, page_size: 20, s_dt: '', e_dt: '', search: '', scope: '', has_photo: 0, no_reply: 0, hidden: '', is_best: 0 });
  const [replyDlg, setReplyDlg] = useState({ open: false, row: null, text: '' });
  const [hideDlg, setHideDlg] = useState({ open: false, row: null, reason: HIDE_REASONS[0], memo: '' });
  const [photoDlg, setPhotoDlg] = useState({ open: false, images: [] });

  const reviewOff = themeDnsData?.setting_obj?.is_use_review !== undefined && Number(themeDnsData?.setting_obj?.is_use_review) !== 1;

  const defaultColumns = [
    {
      id: 'product', label: '상품',
      action: (row) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 180 }}>
          {row?.product_img && <Box component="img" src={row.product_img} alt="" sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }} />}
          <Typography variant="body2" sx={{ cursor: 'pointer', wordBreak: 'keep-all' }} onClick={() => router.push(`/manager/products/edit/${row?.product_id}`)}>
            {row?.product_name ?? `#${row?.product_id}`}
          </Typography>
        </Stack>
      ),
    },
    { id: 'scope', label: '별점', action: (row) => <Rating value={Number(row?.scope) || 0} precision={1} readOnly size="small" /> },
    {
      id: 'content', label: '후기',
      action: (row) => (
        <Box sx={{ minWidth: 260, maxWidth: 420 }}>
          {row?.option_text && <Typography variant="caption" sx={{ color: 'text.disabled' }}>{row.option_text}</Typography>}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row?.content}</Typography>
          {(row?.images?.length ?? 0) > 0 && (
            <Button size="small" sx={{ p: 0, minWidth: 0, fontSize: 12 }} onClick={() => setPhotoDlg({ open: true, images: row.images })}>
              사진 {row.images.length}장
            </Button>
          )}
        </Box>
      ),
    },
    {
      id: 'writer', label: '작성자',
      action: (row) => (
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <div>{row?.writer_name || '---'}</div>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row?.user_name}</Typography>
        </Box>
      ),
    },
    { id: 'ord_num', label: '주문번호', action: (row) => <span style={{ fontSize: 12 }}>{row?.ord_num ?? '---'}</span> },
    { id: 'created_at', label: '작성일', action: (row) => dateOnly(row?.created_at) },
    {
      id: 'reply', label: '답글',
      action: (row) => (
        <Stack spacing={0.5} sx={{ minWidth: 120 }}>
          {row?.reply_content
            ? <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.reply_content}</Typography>
            : <Typography variant="caption" sx={{ color: 'text.disabled' }}>없음</Typography>}
          <Button size="small" variant="outlined" onClick={() => setReplyDlg({ open: true, row, text: row?.reply_content ?? '' })}>
            {row?.reply_content ? '답글 수정' : '답글 달기'}
          </Button>
        </Stack>
      ),
    },
    {
      id: 'status', label: '상태',
      action: (row) => (
        <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.5 }}>
          {Number(row?.is_hidden) === 1
            ? <Tooltip title={row?.hidden_reason || ''}><Chip size="small" label={row?.hidden_reason === '주문 취소' ? '취소 숨김' : '숨김'} color="warning" /></Tooltip>
            : <Chip size="small" label="노출" variant="outlined" />}
          {Number(row?.is_best) === 1 && <Chip size="small" label="BEST" color="primary" />}
          {Number(row?.report_count) > 0 && <Chip size="small" label={`신고 ${row.report_count}`} color="error" />}
        </Stack>
      ),
    },
    {
      id: 'edit', label: '관리',
      action: (row) => (
        <Stack direction="row" spacing={0} sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title={Number(row?.is_best) === 1 ? 'BEST 해제' : 'BEST 지정(상품 맨 위 고정)'}>
            <span>
              <IconButton size="small" disabled={Number(row?.is_hidden) === 1} onClick={() => toggleBest(row)}>
                <Icon icon={Number(row?.is_best) === 1 ? 'material-symbols:star' : 'material-symbols:star-outline'} color={Number(row?.is_best) === 1 ? '#e8a317' : undefined} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={Number(row?.is_hidden) === 1 ? '다시 보이기' : '숨기기(손님 화면·평점에서 제외)'}>
            <IconButton size="small" onClick={() => Number(row?.is_hidden) === 1 ? unhide(row) : setHideDlg({ open: true, row, reason: HIDE_REASONS[0], memo: '' })}>
              <Icon icon={Number(row?.is_hidden) === 1 ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" onClick={() => setModal({
              func: () => { deleteItem(row?.id) },
              icon: 'material-symbols:delete-outline',
              title: '정말 삭제하시겠습니까? 손님도 자기 후기를 지울 수 있습니다. 규정 위반이면 삭제보다 숨김(사유)을 권합니다.',
            })}>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  useEffect(() => { setColumns(defaultColumns); onChangePage({ ...searchObj, page: 1 }); }, []);

  const onChangePage = async (obj) => {
    setSearchObj(obj);
    setData({ ...data, content: undefined });
    const q = { ...obj };
    for (const k of ['has_photo', 'no_reply', 'is_best']) if (!q[k]) delete q[k];
    if (q.hidden === '' || q.hidden === undefined) delete q.hidden;
    if (!q.scope) delete q.scope;
    const res = await apiManager('product-reviews/manage', 'list', q);
    if (res) {
      setData(res);
      setCounts(res?.counts ?? {});
      setSettings(res?.settings ?? {});
    }
  };
  const refresh = () => onChangePage(searchObj);

  const deleteItem = async (id) => {
    const ok = await apiManager('product-reviews', 'delete', { id });
    if (ok) { toast.success('삭제되었습니다.'); refresh(); }
  };
  const toggleBest = async (row) => {
    const ok = await apiManager(`product-reviews/${row.id}/best`, 'update', { is_best: Number(row?.is_best) === 1 ? 0 : 1 });
    if (ok) { toast.success(Number(row?.is_best) === 1 ? 'BEST 를 해제했습니다.' : 'BEST 로 지정했습니다. 상품 맨 위에 고정됩니다.'); refresh(); }
  };
  const unhide = async (row) => {
    const ok = await apiManager(`product-reviews/${row.id}/hide`, 'update', { is_hidden: 0 });
    if (ok) { toast.success('다시 보입니다.'); refresh(); }
  };
  const submitHide = async () => {
    const reason = hideDlg.reason === '기타' ? (hideDlg.memo.trim() || '기타') : hideDlg.reason;
    const ok = await apiManager(`product-reviews/${hideDlg.row.id}/hide`, 'update', { is_hidden: 1, hidden_reason: reason });
    if (ok) { toast.success('숨겼습니다. 손님 화면과 평점에서 빠집니다.'); setHideDlg({ open: false, row: null, reason: HIDE_REASONS[0], memo: '' }); refresh(); }
  };
  const submitReply = async () => {
    const ok = await apiManager(`product-reviews/${replyDlg.row.id}/reply`, 'update', { reply_content: replyDlg.text.trim() });
    if (ok) { toast.success(replyDlg.text.trim() ? '답글을 저장했습니다.' : '답글을 지웠습니다.'); setReplyDlg({ open: false, row: null, text: '' }); refresh(); }
  };

  const filter = (patch) => onChangePage({ ...searchObj, ...patch, page: 1 });

  return (
    <>
      <Stack spacing={2} sx={{ px: { xs: 1, md: 3 }, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 1 }}>
          <Typography variant="h5">후기관리</Typography>
          <Button size="small" variant="text" onClick={() => router.push(`${PATH_MANAGER.settings.default}/${themeDnsData?.id}`)}>
            후기설정(켜기/끄기·작성 규칙) →
          </Button>
        </Stack>
        {reviewOff && (
          <Card sx={{ p: 1.5, bgcolor: 'warning.lighter' }}>
            <Typography variant="body2">지금 이 몰은 후기 기능이 <b>꺼져</b> 있습니다. 손님 화면에 후기·별점이 보이지 않고 새로 쓸 수도 없습니다. 설정관리 › 기본설정 › 「후기설정」 탭에서 켜 주세요.</Typography>
          </Card>
        )}
        {(counts?.no_reply > 0 || counts?.hidden > 0 || counts?.reported > 0) && (
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
            {counts?.no_reply > 0 && <Chip label={`답글 없음 ${counts.no_reply}`} onClick={() => filter({ no_reply: 1, hidden: '' })} variant={searchObj.no_reply ? 'filled' : 'outlined'} />}
            {counts?.hidden > 0 && <Chip label={`숨김 ${counts.hidden}`} onClick={() => filter({ hidden: 1, no_reply: 0 })} variant={String(searchObj.hidden) === '1' ? 'filled' : 'outlined'} color="warning" />}
            {counts?.reported > 0 && <Chip label={`신고 ${counts.reported}`} color="error" />}
          </Stack>
        )}
        <Card sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>별점</InputLabel>
              <Select label="별점" value={searchObj.scope} onChange={(e) => filter({ scope: e.target.value })}>
                <MenuItem value="">전체</MenuItem>
                {[5, 4, 3, 2, 1].map((s) => <MenuItem key={s} value={s}>{s}점</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>노출</InputLabel>
              <Select label="노출" value={searchObj.hidden} onChange={(e) => filter({ hidden: e.target.value })}>
                <MenuItem value="">전체</MenuItem>
                <MenuItem value={0}>노출 중</MenuItem>
                <MenuItem value={1}>숨김</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel control={<Checkbox size="small" checked={!!searchObj.has_photo} onChange={(e) => filter({ has_photo: e.target.checked ? 1 : 0 })} />} label="사진 있음" />
            <FormControlLabel control={<Checkbox size="small" checked={!!searchObj.no_reply} onChange={(e) => filter({ no_reply: e.target.checked ? 1 : 0 })} />} label="답글 없음" />
            <FormControlLabel control={<Checkbox size="small" checked={!!searchObj.is_best} onChange={(e) => filter({ is_best: e.target.checked ? 1 : 0 })} />} label="BEST 만" />
          </Stack>
        </Card>
        <Card>
          <ManagerTable data={data} columns={columns} searchObj={searchObj} onChangePage={onChangePage} />
        </Card>
      </Stack>

      <Dialog open={replyDlg.open} onClose={() => setReplyDlg({ open: false, row: null, text: '' })} fullWidth maxWidth="sm">
        <DialogTitle>판매자 답글</DialogTitle>
        <DialogContent>
          {replyDlg.row && (
            <Box sx={{ p: 1.25, mb: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Rating value={Number(replyDlg.row.scope) || 0} readOnly size="small" />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{replyDlg.row.content}</Typography>
            </Box>
          )}
          <TextField autoFocus fullWidth multiline minRows={4} inputProps={{ maxLength: 1000 }} value={replyDlg.text}
            onChange={(e) => setReplyDlg((d) => ({ ...d, text: e.target.value }))}
            placeholder="손님에게 그대로 보입니다. 비우고 저장하면 답글이 지워집니다." />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={() => setReplyDlg({ open: false, row: null, text: '' })}>취소</Button>
          <Button variant="contained" onClick={submitReply}>저장</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={hideDlg.open} onClose={() => setHideDlg({ ...hideDlg, open: false })} fullWidth maxWidth="xs">
        <DialogTitle>후기 숨기기</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>손님 화면과 평점에서 빠집니다. 지워지지는 않으며 여기서 다시 보이게 할 수 있습니다.</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>사유</InputLabel>
            <Select label="사유" value={hideDlg.reason} onChange={(e) => setHideDlg((d) => ({ ...d, reason: e.target.value }))}>
              {HIDE_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          {hideDlg.reason === '기타' && (
            <TextField fullWidth size="small" sx={{ mt: 1.5 }} inputProps={{ maxLength: 100 }} value={hideDlg.memo}
              onChange={(e) => setHideDlg((d) => ({ ...d, memo: e.target.value }))} placeholder="사유를 적어 주세요(손님에게는 보이지 않습니다)" />
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={() => setHideDlg({ ...hideDlg, open: false })}>취소</Button>
          <Button variant="contained" color="warning" onClick={submitHide}>숨기기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={photoDlg.open} onClose={() => setPhotoDlg({ open: false, images: [] })} maxWidth="md">
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
            {photoDlg.images.map((u) => <Box key={u} component="img" src={u} alt="" sx={{ maxWidth: 260, maxHeight: 260, borderRadius: 1, objectFit: 'contain' }} />)}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

ReviewManage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ReviewManage;

import { useState } from 'react';
import { Button, Card, CardContent, Divider, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import ShopLayout from 'src/layouts/shop/ShopLayout';
import { apiShop } from 'src/utils/api';
import { sanitizePhoneInput } from 'src/utils/function';
import { useRouter } from 'next/router';

// 비회원 1:1문의 조회.
//
// 비회원에게는 계정이 없어서 '내가 쓴 문의'를 찾을 방법이 없다.
// 게다가 이 시스템에는 문자 게이트웨이도 고객 이메일도 없어 답변 알림을 보낼 수단이 아예 없다
// (회원도 마찬가지로 직접 들어와서 확인하는 구조다).
// 그래서 비회원 주문조회와 똑같이 **연락처 + 글비밀번호**로 다시 찾아 들어오게 한다.
//
// 비밀번호는 URL 에 남으면 안 되므로 POST 로 보낸다(백엔드 /api/shop/post/guest-check).

const Wrappers = styled.div`
  max-width: 640px;
  width: 92%;
  min-height: 70vh;
  margin: 4vh auto 8vh;
`;

const InquiryCheck = () => {
  const router = useRouter();
  const [form, setForm] = useState({ none_user_phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  // undefined = 아직 조회 전, [] = 조회했지만 없음
  const [rows, setRows] = useState(undefined);

  const onSearch = async () => {
    if (!String(form.none_user_phone || '').trim()) {
      toast.error('연락처를 입력해 주세요.');
      return;
    }
    if (!String(form.password || '')) {
      toast.error('글 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiShop('post/guest-check', 'create', form);
      // apiShop 은 실패를 false 로 돌려준다(사유는 toast 로 이미 표시됨).
      setRows(data === false ? undefined : (data?.content ?? []));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrappers>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>비회원 문의 조회</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        문의를 남기실 때 입력한 <b>연락처</b>와 <b>글 비밀번호</b>로 답변을 확인하실 수 있습니다.
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <TextField
              size="small" fullWidth label="연락처" placeholder="010-0000-0000"
              value={form.none_user_phone}
              onChange={(e) => setForm({ ...form, none_user_phone: sanitizePhoneInput(e.target.value) })}
            />
            <TextField
              size="small" fullWidth label="글 비밀번호" type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              // 엔터로도 조회되게 한다 — 입력칸이 둘뿐이라 버튼까지 가는 게 번거롭다.
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
            />
            <Button variant="contained" size="large" disabled={loading} onClick={onSearch}>
              {loading ? '조회 중…' : '조회하기'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {rows !== undefined &&
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            {rows.length === 0 ?
              <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
                일치하는 문의가 없습니다. 연락처와 비밀번호를 다시 확인해 주세요.
              </Typography>
              :
              <Stack divider={<Divider />}>
                {rows.map((row) => (
                  <Stack
                    key={row?.id}
                    sx={{ py: 1.5, cursor: 'pointer' }}
                    onClick={() => {
                      // 상세도 같은 두 값으로 본인임을 증명해야 열린다(백엔드 post.get).
                      router.push({
                        pathname: `/shop/service/${row?.category_id}/${row?.id}`,
                        query: {
                          none_user_phone: form.none_user_phone,
                          password: form.password,
                        },
                      });
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row?.post_title || '(제목 없음)'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: row?.reply_count > 0 ? 'primary.main' : 'text.disabled' }}
                      >
                        {row?.reply_count > 0 ? '답변완료' : '답변대기'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {row?.post_category_title} · {String(row?.created_at ?? '').slice(0, 10)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>}
          </CardContent>
        </Card>}
    </Wrappers>
  );
};

InquiryCheck.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;

export default InquiryCheck;

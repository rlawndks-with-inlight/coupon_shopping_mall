import { Stack, TextField } from '@mui/material';
import { sanitizePhoneInput } from 'src/utils/function';
import { useLocales } from 'src/locales';

// 비회원 1:1문의 작성 시 추가로 받는 칸 — 이름 · 연락처 · 글비밀번호.
//
// [왜 필요한가]
// 비회원에게는 계정이 없어서 '내가 쓴 글'을 다시 찾을 방법이 없다.
// 이 시스템에는 문자 게이트웨이도 고객 이메일도 없어 답변 알림을 보낼 수단이 아예 없다
// (회원도 마찬가지로 직접 들어와서 확인하는 구조다).
// 그래서 비회원 주문조회와 같은 방식으로 **연락처 + 글비밀번호**를 받아 두고,
// 나중에 그 둘로 본인 글을 찾아 들어오게 한다.
//
// 로그인한 고객에게는 이 블록을 아예 그리지 않는다(호출부에서 user 유무로 분기).
export const GUEST_INQUIRY_EMPTY = {
    none_user_name: '',
    none_user_phone: '',
    password: '',
};

// 저장 직전 검사. 통과하면 null, 실패하면 사용자에게 보여줄 문구를 돌려준다.
// 백엔드(shop.controller post.create)와 같은 기준을 유지할 것.
export const validateGuestInquiry = (obj = {}) => {
    if (!String(obj?.none_user_name ?? '').trim()) return '이름을 입력해 주세요.';
    if (!String(obj?.none_user_phone ?? '').trim()) return '연락처를 입력해 주세요.';
    if (String(obj?.password ?? '').length < 4) return '글 비밀번호를 4자 이상 입력해 주세요.';
    return null;
};

const GuestInquiryFields = ({ value = GUEST_INQUIRY_EMPTY, onChange, disabled = false }) => {
  const { translate } = useLocales();
    const set = (key, v) => onChange?.({ ...value, [key]: v });
    return (
        <Stack spacing={2} sx={{ mb: 2 }}>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                {/* 예전엔 <b> 로 문장을 쪼개 놨다. 조각을 따로 번역하면 어순이 다른 언어에서
                    문장이 깨지므로(한국어는 조사가 붙는다) 한 문장을 통째로 번역한다. */}
                {translate('답변은 연락처와 글 비밀번호로 다시 확인하실 수 있습니다. 비밀번호를 잊으면 찾을 수 없으니 기억해 주세요.')}
            </div>
            <TextField
                size="small" fullWidth label={translate('이름')} disabled={disabled}
                value={value?.none_user_name ?? ''}
                onChange={(e) => set('none_user_name', e.target.value)}
            />
            <TextField
                size="small" fullWidth label={translate('연락처')} placeholder="010-0000-0000" disabled={disabled}
                value={value?.none_user_phone ?? ''}
                onChange={(e) => set('none_user_phone', sanitizePhoneInput(e.target.value))}
            />
            <TextField
                size="small" fullWidth label={translate('글 비밀번호')} type="password" disabled={disabled}
                placeholder={translate('4자 이상')}
                value={value?.password ?? ''}
                onChange={(e) => set('password', e.target.value)}
            />
        </Stack>
    );
};

export default GuestInquiryFields;

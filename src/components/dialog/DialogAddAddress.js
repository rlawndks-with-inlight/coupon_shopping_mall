// ** React Imports
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiManager } from 'src/utils/api'
import { isValidPhoneNumber, sanitizePhoneInput } from 'src/utils/function'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Box, Card, Checkbox, CircularProgress, DialogContentText, FormControlLabel, Paper, RadioGroup, Stack, TextField } from '@mui/material'
import { Row, postCodeStyle, themeObj } from '../elements/styled-components'
import DaumPostcode from 'react-daum-postcode';



const STEPS = ['배송지 확인', '결제하기'];

// 주소록 한 건의 편집 대상 필드.
//
// 예전엔 이 다이얼로그가 주소·상세주소 두 칸만 받았다. 그런데 user_addresses 에는
// 받는사람·연락처·우편번호·기본배송지가 함께 있고(2026-07-28 확장), 주문서는 그 값들을 읽어
// 배송 정보를 채운다. 그래서 마이페이지·회원정보수정에서 만든 배송지는 늘 반쪽이었고,
// 고객은 주문할 때마다 받는사람·연락처를 다시 입력해야 했다. 기본배송지 지정도 불가능했다.
// 이 다이얼로그는 주문서·마이페이지(프레임1·2)·회원정보수정(전 프레임)이 모두 쓰는 하나뿐인
// 주소 입력 통로라, 여기만 채우면 전부 해결된다.
const EMPTY_FORM = {
  addr: '',
  detail_addr: '',
  receiver: '',
  phone: '',
  zonecode: '',
  is_default: false,
  is_open_daum_post: false,
};

const DialogAddAddress = (props) => {

  // ** State
  // onDeleteAddress 는 더 이상 저장 경로에서 쓰지 않는다(수정은 update 로 처리).
  // 호출부들이 계속 넘겨주고 있어 하위호환으로 받기만 한다.
  const { addAddressOpen, setAddAddressOpen, onAddAddress, type, id, onDeleteAddress } = props;

  const isUpdate = type == 'update';

  const [addAddressObj, setAddAddressObj] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false);

  const emptyObj = { ...EMPTY_FORM };
  const setField = (key, value) => setAddAddressObj((prev) => ({ ...prev, [key]: value }));

  // 수정 모드로 열리면 기존 배송지를 불러와 폼을 채운다.
  //
  // 예전엔 이 다이얼로그가 props 로 id 만 받고 기존 행을 읽지 않아서
  // '수정'을 눌러도 빈 폼이 떴다. 그 상태로 저장하면 기존 행을 지우고
  // 폼 내용으로 새로 만들었기 때문에, 받는사람·연락처·우편번호·기본배송지 같은
  // 이 폼에 없는 값들이 통째로 사라지고 id 도 바뀌었다.
  // (게다가 삭제가 await 되지 않아 순서가 뒤집히면 방금 만든 걸 지울 수도 있었다)
  //
  // ⚠ 이제 이 폼이 그 값들도 '보내기' 때문에, 불러오기도 반드시 전부 해야 한다.
  //    한 칸이라도 빼면 저장할 때 빈 문자열로 덮어써진다(백엔드 updateQuery 는
  //    보내지 않은 키만 건너뛰고, 빈 문자열은 '비우겠다'는 뜻으로 그대로 저장한다).
  useEffect(() => {
    let alive = true;
    if (!addAddressOpen || !isUpdate || !(id > 0)) return;
    (async () => {
      const data = await apiManager('user-addresses', 'get', { id });
      if (!alive || !data) return;
      setAddAddressObj({
        addr: data?.addr ?? '',
        detail_addr: data?.detail_addr ?? '',
        receiver: data?.receiver ?? '',
        phone: data?.phone ?? '',
        zonecode: data?.zonecode ?? '',
        is_default: Number(data?.is_default) === 1,
        is_open_daum_post: false,
      });
    })();
    return () => { alive = false; };
  }, [addAddressOpen, isUpdate, id])

  const onSelectAddress = (data) => {
    setAddAddressObj({
      ...addAddressObj,
      // 도로명이 없는 지역이 있어 지번(address)으로 폴백한다(주문서 onCompletePost 와 같은 규칙).
      addr: data?.roadAddress || data?.address || '',
      zonecode: data?.zonecode ?? '',
      detail_addr: '',
      is_open_daum_post: false,
    })
  }

  const closeAndReset = () => {
    setAddAddressObj({ ...EMPTY_FORM });
    setAddAddressOpen(false);
  };

  return (
    <>
      <Dialog
        open={addAddressOpen}
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 700}
        onClose={closeAndReset}
        PaperProps={{
          style: {
            width: `${typeof window !== 'undefined' && window.innerWidth >= 700 ? '600px' : '100%'}`,
            maxWidth: '100%',
          }
        }}
      >
        {addAddressObj.is_open_daum_post ?
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid #eee' }}>
              <Box sx={{ fontWeight: 700 }}>우편번호 검색</Box>
              <Button size="small" color="inherit" onClick={() => setField('is_open_daum_post', false)}>
                닫기
              </Button>
            </Box>
            <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
          </>
          :
          <>
            <DialogTitle>{isUpdate ? `주소지 수정` : `주소지 추가`}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {isUpdate ? `수정하실 내용을 입력 후 저장을 눌러주세요.` : `새 배송지를 입력 후 저장을 눌러주세요.`}
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.receiver}
                margin="dense"
                label="받는 사람"
                onChange={(e) => setField('receiver', e.target.value)}
              />
              <TextField
                fullWidth
                value={addAddressObj.phone}
                margin="dense"
                label="연락처"
                placeholder="010-0000-0000"
                onChange={(e) => setField('phone', sanitizePhoneInput(e.target.value))}
              />
              <TextField
                fullWidth
                value={addAddressObj.zonecode}
                margin="dense"
                label="우편번호"
                InputProps={{ readOnly: true }}
                placeholder="우편번호 검색으로 입력"
                onClick={() => setField('is_open_daum_post', true)}
              />
              <TextField
                fullWidth
                value={addAddressObj.addr}
                margin="dense"
                label="주소"
                aria-readonly='true'
                InputProps={{ readOnly: true }}
                placeholder="눌러서 우편번호 검색"
                onClick={() => setField('is_open_daum_post', true)}
              />
              <TextField
                fullWidth
                value={addAddressObj.detail_addr}
                margin="dense"
                label="상세주소"
                onChange={(e) => setField('detail_addr', e.target.value)}
              />
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    checked={!!addAddressObj.is_default}
                    onChange={(e) => setField('is_default', e.target.checked)}
                  />
                }
                label="기본 배송지로 설정"
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" disabled={saving} onClick={async () => {
                // 주소가 비면 저장하지 않는다. 예전엔 빈 폼 그대로 저장되면서
                // 멀쩡한 배송지가 빈 주소로 바뀌었다.
                if (!addAddressObj.addr) {
                  toast.error('주소를 입력해 주세요.');
                  return;
                }
                // 받는사람·연락처는 배송에 필요하다. 다만 '명백히 잘못된 값'만 막는다
                // (형식 강제는 하지 않는다 — 주문서 guardBeforePay 와 같은 기준).
                if (!String(addAddressObj.receiver || '').trim()) {
                  toast.error('받는 분 성함을 입력해 주세요.');
                  return;
                }
                if (!isValidPhoneNumber(addAddressObj.phone)) {
                  toast.error('받는 분 연락처를 정확히 입력해 주세요.');
                  return;
                }
                setSaving(true);
                try {
                  // is_open_daum_post 는 화면 상태일 뿐이라 서버로 보내지 않는다.
                  const { is_open_daum_post, ...form } = addAddressObj;
                  const payload = {
                    ...form,
                    receiver: String(form.receiver || '').trim(),
                    // 체크 해제를 multipart 로 보내면 문자열 "false" 가 되어 백엔드에서 truthy 가 된다.
                    // 백엔드가 isTruthyFlag 로 걸러주지만, 여기서도 0/1 로 못 박아 애매함을 없앤다.
                    is_default: form.is_default ? 1 : 0,
                  };
                  // 수정 모드에서는 id 를 함께 넘긴다.
                  // 호출부의 onAddAddress 가 id 유무로 create / update 를 가른다.
                  // (예전엔 여기서 삭제 후 재생성을 했다 — 받는사람·연락처·기본배송지가 날아가고 id 도 바뀌었다)
                  await onAddAddress(isUpdate ? { ...payload, id } : payload);
                  setAddAddressObj({ ...EMPTY_FORM });
                  setAddAddressOpen(false);
                } finally {
                  setSaving(false);
                }
              }}>
                저장
              </Button>
              <Button color="inherit" onClick={closeAndReset}>
                취소
              </Button>
            </DialogActions>
          </>}
      </Dialog>
    </>
  )
}

export default DialogAddAddress

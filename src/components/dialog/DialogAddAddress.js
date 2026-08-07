// ** React Imports
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiManager } from 'src/utils/api'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Box, Card, CircularProgress, DialogContentText, Paper, RadioGroup, Stack, TextField } from '@mui/material'
import { Row, postCodeStyle, themeObj } from '../elements/styled-components'
import DaumPostcode from 'react-daum-postcode';



const STEPS = ['배송지 확인', '결제하기'];
const DialogAddAddress = (props) => {

  // ** State
  // onDeleteAddress 는 더 이상 저장 경로에서 쓰지 않는다(수정은 update 로 처리).
  // 호출부들이 계속 넘겨주고 있어 하위호환으로 받기만 한다.
  const { addAddressOpen, setAddAddressOpen, onAddAddress, type, id, onDeleteAddress } = props;

  const isUpdate = type == 'update';

  const [addAddressObj, setAddAddressObj] = useState({
    addr: '',
    detail_addr: '',
    is_open_daum_post: false,
  })
  const [saving, setSaving] = useState(false);

  const emptyObj = { addr: '', detail_addr: '', is_open_daum_post: false };

  // 수정 모드로 열리면 기존 배송지를 불러와 폼을 채운다.
  //
  // 예전엔 이 다이얼로그가 props 로 id 만 받고 기존 행을 읽지 않아서
  // '수정'을 눌러도 빈 폼이 떴다. 그 상태로 저장하면 기존 행을 지우고
  // 폼 내용으로 새로 만들었기 때문에, 받는사람·연락처·우편번호·기본배송지 같은
  // 이 폼에 없는 값들이 통째로 사라지고 id 도 바뀌었다.
  // (게다가 삭제가 await 되지 않아 순서가 뒤집히면 방금 만든 걸 지울 수도 있었다)
  useEffect(() => {
    let alive = true;
    if (!addAddressOpen || !isUpdate || !(id > 0)) return;
    (async () => {
      const data = await apiManager('user-addresses', 'get', { id });
      if (!alive || !data) return;
      setAddAddressObj({
        addr: data?.addr ?? '',
        detail_addr: data?.detail_addr ?? '',
        is_open_daum_post: false,
      });
    })();
    return () => { alive = false; };
  }, [addAddressOpen, isUpdate, id])
  const onSelectAddress = (data) => {
    setAddAddressObj({
      ...addAddressObj,
      addr: data?.address,
      detail_addr: '',
      is_open_daum_post: false,
    })
  }
  return (
    <>
      <Dialog
        open={addAddressOpen}
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 700}
        onClose={() => {
          setAddAddressObj({
            addr: '',
            detail_addr: '',
            is_open_daum_post: false,
          })
          setAddAddressOpen(false);
        }}
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
              <Button size="small" color="inherit" onClick={() => setAddAddressObj({ ...addAddressObj, is_open_daum_post: false })}>
                닫기
              </Button>
            </Box>
            <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
          </>
          :
          <>
            <DialogTitle>{type == 'update' ? `주소지 수정` : `주소지 추가`}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {type == 'update' ? `수정하실 주소를 입력 후 저장을 눌러주세요.` : `새 주소를 입력 후 저장을 눌러주세요.`}
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.addr}
                margin="dense"
                label="주소"
                aria-readonly='true'
                onClick={() => {
                  setAddAddressObj({
                    ...addAddressObj,
                    is_open_daum_post: true,
                  })
                }}
              />
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.detail_addr}
                margin="dense"
                label="상세주소"
                onChange={(e) => {
                  setAddAddressObj({
                    ...addAddressObj,
                    detail_addr: e.target.value
                  })
                }}
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
                setSaving(true);
                try {
                  // 수정 모드에서는 id 를 함께 넘긴다.
                  // 호출부의 onAddAddress 가 id 유무로 create / update 를 가른다.
                  // (예전엔 여기서 삭제 후 재생성을 했다 — 받는사람·연락처·기본배송지가 날아가고 id 도 바뀌었다)
                  await onAddAddress(isUpdate ? { ...addAddressObj, id } : addAddressObj);
                  setAddAddressObj(emptyObj);
                  setAddAddressOpen(false);
                } finally {
                  setSaving(false);
                }
              }}>
                저장
              </Button>
              <Button color="inherit" onClick={() => {
                setAddAddressObj({
                  addr: '',
                  detail_addr: '',
                  is_open_daum_post: false,
                })
                setAddAddressOpen(false);
              }}>
                취소
              </Button>
            </DialogActions>
          </>}
      </Dialog>
    </>
  )
}

export default DialogAddAddress

// ** React Imports
import { useState } from 'react'

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
  const { addAddressOpen, setAddAddressOpen, onAddAddress, type, id, onDeleteAddress } = props;

  const [addAddressObj, setAddAddressObj] = useState({
    addr: '',
    detail_addr: '',
    is_open_daum_post: false,
  })
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
            width: `${window.innerWidth >= 700 ? '500px' : '90vw'}`,
          }
        }}
      >
        {addAddressObj.is_open_daum_post ?
          <>
            <Row>
              <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
            </Row>
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
              <Button variant="contained" onClick={() => {
                if (type == 'update') {
                  onDeleteAddress(id)
                  setAddAddressObj({
                    addr: '',
                    detail_addr: '',
                    is_open_daum_post: false,
                  })
                  setAddAddressOpen(false);
                  onAddAddress(addAddressObj)
                } else {
                  setAddAddressObj({
                    addr: '',
                    detail_addr: '',
                    is_open_daum_post: false,
                  })
                  setAddAddressOpen(false);
                  onAddAddress(addAddressObj)
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

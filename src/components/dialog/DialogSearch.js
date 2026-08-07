// ** React Imports
import { useState } from 'react'

// ** MUI Imports
// Button, DialogActions 는 이 파일에서 실제로 쓰이는 곳이 없어 제거했다(Typography 는 아래에서 사용 중).
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import { Icon } from '@iconify/react'
import { InputAdornment, TextField } from '@mui/material'
import styled from 'styled-components'
import { themeObj } from '../elements/styled-components'
import { useRouter } from 'next/router'

const Title = styled.div`
font-size: 0.9rem;
padding: 0 0 1rem 0;
`
const Content = styled.div`
display:flex;
padding:0.5rem 0;
font-size: 0.9rem;
cursor:pointer;
margin-left:0.5rem;
font-weight:bold;
`
// 검색 입력창과 닫기(X) 버튼을 같은 행에 묶는다.
// 기존에는 입력창이 화면 정중앙(width 80%/max 700px)이고 X 는 position:absolute 로 뷰포트 오른쪽 끝(right:10px)에
// 붙어 있어서, 넓은 화면일수록 둘이 멀어졌다(1920px 기준 약 570px). 폭은 700px 그대로 두고 X 만 옆에 붙인다.
const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80%;
  max-width: 748px;   /* 입력 700 + gap 8 + 버튼 40 — 기존 입력폭 700 을 그대로 보존 */
  margin: 0 auto;
  @media (max-width: 600px) {
    width: 100%;
    gap: 4px;
  }
`
const testSearchList = [

]
const DialogSearch = (props) => {
  // ** State
  const { open, handleClose, onKeepGoing, style, root_path } = props;

  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  return (
    <Dialog fullScreen onClose={handleClose} open={open}>
      <DialogTitle id='full-screen-dialog-title' style={{ paddingBottom: '2rem' }}>
        <Typography variant='h6' component='span'>
          <SearchRow>
            <TextField
              label='통합검색'
              id='size-small'
              size='small'
              onChange={(e) => {
                setKeyword(e.target.value)
              }}
              value={keyword}
              // 폭은 SearchRow 가 잡는다. flex:1 로 남은 공간을 채우고, minWidth:0 은 flex 아이템 축소를 허용한다.
              sx={{ flex: 1, minWidth: 0 }}
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                  router.push(`${root_path}${keyword}`)
                  handleClose();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => {
                        router.push(`${root_path}${keyword}`)
                        setKeyword('')
                        handleClose();
                      }}
                      // 복붙 잔재였던 'toggle password visibility' 를 실제 동작에 맞게 교정
                      aria-label='검색'
                    >
                      <Icon icon={'tabler:search'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {/* 닫기 버튼 — absolute 를 걷어내고 입력창 바로 옆에 둔다 */}
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={{ color: 'grey.500', flexShrink: 0 }}
            >
              <Icon icon='tabler:x' />
            </IconButton>
          </SearchRow>
        </Typography>
      </DialogTitle>
      <div style={{ borderTop: `1px solid ${themeObj.grey[300]}` }} />
      <DialogContent style={{ maxWidth: '750px', margin: '1rem auto', width: '80%' }}>
        {/* <Title>인기 검색어</Title>
        {testSearchList.map((item, idx) => (
          <>
            <Content>
              <div style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{idx + 1}</div>
              <div>{item.title}</div>
            </Content>
          </>
        ))} */}
      </DialogContent>
    </Dialog>
  )
}

export default DialogSearch

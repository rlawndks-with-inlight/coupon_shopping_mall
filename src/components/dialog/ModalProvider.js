import { Icon } from '@iconify/react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { Row } from '../elements/styled-components'
import { useLocales } from 'src/locales';

const ModalContext = React.createContext()

const Modal = ({ modal, unSetModal }) => {
  const { translate } = useLocales();
  useEffect(() => {
    const bind = e => {
      if (e.keyCode !== 27) {
        return
      }
      if (document.activeElement && ['INPUT', 'SELECT'].includes(document.activeElement.tagName)) {
        return
      }
      unSetModal()
    }
    document.addEventListener('keyup', bind)
    return () => document.removeEventListener('keyup', bind)

  }, [modal, unSetModal])

  return (
    <Dialog
      onClose={() => unSetModal()}
      open={true}
      sx={{
      }}
      PaperProps={{
        sx: {
          minWidth: '300px'
        }
      }}
    >
      {modal?.icon &&
        <>
          <Row>
            <Icon icon={modal?.icon} style={{
              margin: '1rem auto 0 auto',
              fontSize: '3rem'
            }} />
          </Row>
        </>}
      <DialogTitle sx={{ margin: '0 auto' }}>{modal?.title}</DialogTitle>
      <DialogContent>
        {/* content 는 선택 — 제목만 쓰던 기존 확인창은 그대로다. 줄바꿈(
)을 그대로 보여준다. */}
        <DialogContentText id="alert-dialog-description" sx={{ whiteSpace: 'pre-line', maxWidth: 520 }}>
          {modal?.content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ margin: '0 auto' }}>
        <Button focusVisible variant='contained' onClick={() => {
          modal?.func()
          unSetModal()
        }}>{translate('확인')}</Button>
        <Button variant='outlined' onClick={() => unSetModal()}>{translate('취소')}</Button>
      </DialogActions>
    </Dialog>
  )
}

const ModalProvider = props => {
  const [modal, setModal] = useState()
  const unSetModal = useCallback(() => {
    setModal()
  }, [setModal])

  return (
    <ModalContext.Provider value={{ unSetModal, setModal }} {...props} >
      {props.children}
      {modal && <Modal modal={modal} unSetModal={unSetModal} />}
    </ModalContext.Provider>
  )
}

const useModal = () => {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a UserProvider')
  }
  return context
}

export { ModalProvider, useModal }

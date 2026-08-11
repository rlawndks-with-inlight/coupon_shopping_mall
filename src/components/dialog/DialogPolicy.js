import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import Policy from 'src/pages/shop/auth/policy';
import { useLocales } from 'src/locales';

// 블로그형(프레임4~11) 약관 모달 공용 컴포넌트.
//
// 기존에는 Drawer(anchor='bottom') 바텀시트에 policy 페이지를 그대로 끼웠는데,
// Paper 에 overflow 지정이 없어 MUI 기본값(overflowY:auto)이 Paper 전체에 걸렸다.
// → 로고와 닫기(X)가 본문과 함께 위로 밀려 사라지고, 약관을 끝까지 읽으면
//   닫을 방법이 없어 다시 맨 위까지 스크롤해야 했다. 스크롤바도 둥근 모서리를 잘라먹었다.
//
// Dialog scroll="paper" 는 MUI 가 Paper 를 flex column + overflow hidden 으로 잡고
// DialogContent 에만 overflow-y:auto 를 건다. 제목·닫기는 위, 버튼은 아래에 고정되고 본문만 스크롤된다.
//
// props
//  - open    (bool) 열림 여부
//  - type    (0|1|2|3) policy.js 의 type 규약과 동일 — 0=이용약관, 1=개인정보처리방침, 2=저작권정책, 3=쇼핑몰 이용안내
//  - onClose (fn)  닫기
//  - onAgree (fn, 선택) 주면 버튼이 '동의하고 닫기' 가 되고, 누르면 onAgree 실행 후 닫힌다.
const POLICY_TITLES = ['이용약관', '개인정보처리방침', '저작권정책', '쇼핑몰 이용안내'];

const DialogPolicy = (props) => {
  const { translate } = useLocales();
  const { open, type, onClose, onAgree } = props;

  // 호출부가 숫자로 넘기든 문자로 넘기든 같은 제목이 나오게 정규화한다.
  // 닫혀 있을 때 type 이 '' 인 호출부가 있어 빈 값은 -1 로 떨어뜨린다(제목 오표기 방지).
  const typeNum = type === '' || type === null || type === undefined ? -1 : Number(type);
  const title = POLICY_TITLES[typeNum] || '약관';

  // 모바일은 전체화면. 좁은 폭에서 시트로 읽는 것보다 낫다.
  const fullScreen = useMediaQuery('(max-width:600px)');

  const handleAgree = () => {
    onAgree?.();
    onClose?.();
  };

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          // 기존 500px 고정 높이는 큰 화면에서 지나치게 짧았다. 뷰포트 비율로 잡는다.
          maxHeight: fullScreen ? '100%' : '80vh',
        },
      }}
    >
      <DialogTitle sx={{ pr: 6, fontSize: 18, fontWeight: 700 }}>
        {title}
        <IconButton
          aria-label={translate('닫기')}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.600' }}
        >
          <Icon icon="ic:round-close" fontSize="1.75rem" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* embedded — 페이지용 min-height:90vh / 좌우 여백 / 중복 제목을 끄는 모드 */}
        <Policy type={type} embedded />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onAgree ? handleAgree : onClose}
        >
          {onAgree ? '동의하고 닫기' : '닫기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPolicy;

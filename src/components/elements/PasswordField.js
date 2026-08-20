import { useState } from 'react';
import { IconButton, InputAdornment, OutlinedInput, TextField } from '@mui/material';
import { Icon } from '@iconify/react';

// 비밀번호 입력칸 — 눈 아이콘으로 보였다 감췄다 한다.
//
// 왜 필요한가:
//   비밀번호 칸이 전부 점(●)으로만 보여서, 오타를 확인할 방법이 없었다. 특히
//   회원가입·비밀번호 변경처럼 두 번 입력해 맞춰야 하는 자리에서 '왜 안 맞는지'를
//   눈으로 확인할 수 없어 몇 번씩 다시 치게 된다. 모바일 자판이면 더하다.
//
// 쓰는 법 — TextField 를 그대로 대신한다. type 은 이 컴포넌트가 정하므로 넘기지 않는다.
//   <PasswordField label='비밀번호' value={pw} onChange={...} />
//
// ⚠ InputProps 를 넘기는 곳이 있다. endAdornment 를 통째로 덮어쓰면 눈 아이콘이 사라지므로
//   넘어온 값을 살려 두고 눈만 덧붙인다.
const PasswordField = ({ InputProps, ...rest }) => {
    const [보임, set보임] = useState(false);
    return (
        <TextField
            {...rest}
            type={보임 ? 'text' : 'password'}
            InputProps={{
                ...InputProps,
                endAdornment: (
                    <>
                        {InputProps?.endAdornment}
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => set보임((v) => !v)}
                                edge="end"
                                size="small"
                                // 스크린리더·키보드 사용자를 위한 이름. 눈 모양만으로는 뜻이 안 전해진다.
                                aria-label={보임 ? '비밀번호 숨기기' : '비밀번호 보기'}
                                // 폼 안에서 엔터·탭이 이 버튼에 걸려 저장이 막히지 않게 한다.
                                type="button"
                                tabIndex={-1}
                            >
                                <Icon icon={보임 ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                            </IconButton>
                        </InputAdornment>
                    </>
                ),
            }}
        />
    );
};
export default PasswordField;

// FormControl + InputLabel + OutlinedInput 짜임으로 된 자리용.
//
// 그 자리는 TextField 로 바꿀 수 없다 — 라벨(InputLabel)이 형제로 따로 있고 테두리 홈을
// label 값으로 맞추기 때문에, 통째로 바꾸면 라벨이 겹치거나 홈이 안 뚫린다.
// (기본 택배사 칸에서 실제로 겪은 겹침이 같은 원인이었다)
// 그래서 껍데기는 그대로 두고 눈 아이콘만 붙인다.
export const PasswordOutlinedInput = ({ endAdornment, ...rest }) => {
    const [보임, set보임] = useState(false);
    return (
        <OutlinedInput
            {...rest}
            type={보임 ? 'text' : 'password'}
            endAdornment={
                <>
                    {endAdornment}
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => set보임((v) => !v)}
                            edge="end"
                            size="small"
                            aria-label={보임 ? '비밀번호 숨기기' : '비밀번호 보기'}
                            type="button"
                            tabIndex={-1}
                        >
                            <Icon icon={보임 ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                    </InputAdornment>
                </>
            }
        />
    );
};

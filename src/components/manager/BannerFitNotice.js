import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

// 올린 배너가 화면에서 어떻게 보일지 미리 알려준다.
//
// 왜 필요한가:
//   배너는 절대 자르지 않는다(contain). 그래서 권장 비율과 다른 이미지를 올리면
//   잘리는 대신 **여백**이 생긴다. 그런데 편집기에서는 썸네일만 보여서 그 사실을
//   저장하고 고객 화면을 열어 봐야 알 수 있었다.
//   규격 안내(2000x850)를 못 읽거나 대충 맞춘 가맹점이 그 자리에서 알게 하는 것이 목적이다.
//   (로고 미리보기와 같은 생각이다 — 결과를 올리는 순간 보여준다)
//
// ⚠ 이미지 크기는 브라우저가 실제로 받아 본 뒤에야 안다. 그래서 Image 로 한 장씩 읽는다.
//   cross-origin 이라도 naturalWidth 는 읽을 수 있다(캔버스와 달리 오염 문제가 없다).
const BannerFitNotice = ({ srcList = [], ratio }) => {
    const [잰것, set잰것] = useState([]);

    useEffect(() => {
        let 살아있음 = true;
        const 목록 = (srcList ?? []).filter(Boolean);
        if (!목록.length) { set잰것([]); return () => { }; }

        Promise.all(목록.map((src) => new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve({ src, w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve(null);          // 못 읽으면 조용히 건너뛴다
            img.src = src;
        }))).then((결과) => { if (살아있음) set잰것(결과.filter(Boolean)); });

        return () => { 살아있음 = false; };
    }, [JSON.stringify(srcList)]);

    if (!잰것.length) return null;

    const 목표 = ratio?.aspect || (2000 / 850);
    const 판정 = 잰것.map((x) => {
        const 비 = x.w / x.h;
        // 1% 안쪽이면 같은 비율로 본다(리사이즈 반올림까지 문제 삼을 필요는 없다).
        const 차이 = Math.abs(비 - 목표) / 목표;
        if (차이 <= 0.01) return { ...x, 비, 종류: '맞음' };
        // contain 이므로, 이미지가 더 넓으면 위아래가 남고 더 좁으면 좌우가 남는다.
        const 여백비율 = 비 > 목표 ? 1 - (목표 / 비) : 1 - (비 / 목표);
        return { ...x, 비, 종류: 비 > 목표 ? '위아래' : '좌우', 여백: Math.round(여백비율 * 100) };
    });

    const 어긋난것 = 판정.filter((x) => x.종류 !== '맞음');

    return (
        <Box sx={{ mt: 1, p: 1.25, borderRadius: 1, border: '1px solid', borderColor: 어긋난것.length ? 'warning.light' : 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Icon icon={어긋난것.length ? 'material-symbols:info-outline' : 'material-symbols:check-circle-outline'} />
                {어긋난것.length
                    ? `${어긋난것.length}장이 권장 비율(${ratio?.label ?? '2000x850'})과 다릅니다`
                    : `모두 권장 비율(${ratio?.label ?? '2000x850'})에 맞습니다`}
            </Typography>
            {어긋난것.length > 0 &&
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.75 }}>
                    배너는 이미지를 자르지 않습니다. 비율이 다르면 잘리는 대신 여백이 생깁니다.
                </Typography>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {판정.map((x, i) => (
                    <Typography key={i} sx={{ fontSize: 12, color: x.종류 === '맞음' ? 'text.disabled' : 'text.secondary' }}>
                        {`${i + 1}. ${x.w}×${x.h} (${x.비.toFixed(2)}:1) — `}
                        {x.종류 === '맞음'
                            ? '여백 없이 꽉 찹니다'
                            : `${x.종류}에 여백이 약 ${x.여백}% 생깁니다`}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

export default BannerFitNotice;

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Divider, Pagination, Stack, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { commarNumber, getPointType, makeMaxPage } from 'src/utils/function';
import { 포인트쓰는몰, 포인트정책 } from 'src/data/point-policy';

// 내 포인트 — 프레임 구분 없는 공용 패널.
//
// [왜 필요한가]
//   고객이 자기 포인트를 볼 곳이 아예 없었다. 마이페이지의 포인트 표시는 '기능 미완성'을
//   이유로 주석 처리돼 있었는데, 그 이유(사용분을 차감하는 코드가 없다)는 이미 해소됐다 —
//   결제에서 원장에 음수 행을 남기고 잔액도 검증한다(pay.controller). 주석만 남아 있었다.
//   잔액을 못 보면 주문서에서 '보유 0P'가 맞는지 틀린지도 알 수 없다.
//
// [안 쓰는 가맹점에는 안 보인다]
//   최대사용·적립률이 둘 다 0 이면 아무것도 그리지 않는다(포인트쓰는몰). 기본값이 0 이라
//   설정을 안 한 가맹점은 저절로 여기 걸린다 — 쓰지도 않는 메뉴가 뜨는 일이 없다.
//
// [레이아웃]
//   껍데기를 갖지 않는다. card={false} 면 카드 테두리 없이 내용만 그린다(이미 카드 안인 화면용).

const PointPanel = ({ card = true, title }) => {
    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const { translate } = useLocales();
    const [content, setContent] = useState({});
    const [searchObj, setSearchObj] = useState({ page: 1, page_size: 10 });

    const 정책 = 포인트정책(themeDnsData);

    const 불러오기 = async (obj) => {
        setSearchObj(obj);
        const data = await apiManager('points', 'list', obj);
        if (data) setContent(data);
    };

    useEffect(() => {
        // 로그인 전에는 부르지 않는다 — 서버가 거부하고 실패 알림만 뜬다.
        if (!user?.id) return;
        불러오기({ page: 1, page_size: 10 });
    }, [user?.id]);

    // 훅을 전부 부른 뒤에 걸러야 훅 순서가 깨지지 않는다.
    if (!포인트쓰는몰(themeDnsData) || !user?.id) return null;

    const maxPage = makeMaxPage(content?.total, content?.page_size) || 0;
    const body = (
        <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {translate('보유 포인트')}
                </Typography>
                <Typography variant="h6">{commarNumber(user?.point ?? 0)}P</Typography>
            </Stack>
            {정책.적립률 > 0 &&
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {translate('구매금액의')} {정책.적립률}% {translate('적립')}
                </Typography>}
            {/* 언제부터 쓸 수 있는지 — 이 조건을 모르면 '왜 안 써지냐'가 된다.
                두 조건은 택일이 아니라 둘 다 걸린다(data/point-policy.js 주석 참고). */}
            {정책.최소보유 > 0 &&
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {commarNumber(정책.최소보유)}P {translate('이상 모이면 사용할 수 있습니다.')}
                </Typography>}
            {정책.최소주문금액 > 0 &&
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {commarNumber(정책.최소주문금액)}{translate('원')} {translate('이상 주문할 때 사용할 수 있습니다.')}
                </Typography>}
            <Divider />
            {(content?.content ?? []).length > 0 ?
                (content?.content ?? []).map((row) => (
                    <Stack key={row?.id} direction="row" justifyContent="space-between" alignItems="baseline">
                        <Stack>
                            <Typography variant="body2">
                                {translate(getPointType(row))}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {String(row?.created_at ?? '').slice(0, 10)}
                            </Typography>
                        </Stack>
                        {/* 쌓인 것과 쓴 것을 색으로 가른다 — 숫자 앞의 부호만으로는 잘 안 읽힌다. */}
                        <Typography
                            variant="subtitle2"
                            sx={{ color: Number(row?.point) < 0 ? 'error.main' : 'success.main' }}
                        >
                            {Number(row?.point) > 0 ? '+' : ''}{commarNumber(row?.point ?? 0)}P
                        </Typography>
                    </Stack>
                ))
                :
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
                    {translate('포인트 내역이 없습니다.')}
                </Typography>}
            {maxPage > 1 &&
                <Stack alignItems="center" sx={{ pt: 1 }}>
                    <Pagination
                        count={maxPage}
                        page={content?.page ?? 1}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        onChange={(e, num) => 불러오기({ ...searchObj, page: num })}
                    />
                </Stack>}
        </Stack>
    );

    if (!card) return body;
    return (
        <Card>
            <CardHeader title={title ?? translate('내 포인트')} />
            <CardContent sx={{ pt: 0 }}>{body}</CardContent>
        </Card>
    );
};
export default PointPanel;

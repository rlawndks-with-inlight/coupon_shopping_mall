import { Breadcrumbs, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { getAllIdsWithParents } from 'src/utils/function';

// 블로그형 프레임(3·4)의 카테고리 이동 수단.
//
// [왜 헤더가 아니라 여기인가]
//   이 프레임들은 헤더가 position:fixed 인데 본문 상단 여백을 각 화면이 직접 하드코딩한다
//   (홈 48px, 나머지 56px). 헤더에 줄을 하나 더 넣으면 그 프레임의 모든 화면을 같이 고쳐야 하고,
//   폰(390px)에서는 로고·아이콘을 빼고 남는 폭이 39px 뿐이라 칩이 애초에 안 들어간다.
//   헤더에는 이미 /shop/items 로 가는 격자 아이콘이 있으므로, 카테고리는 그 화면에서 펼친다.
//   → 헤더 높이가 1px 도 안 바뀌므로 어떤 화면의 오프셋도 건드리지 않는다.

// 칩을 다는 프레임.
//   프레임3 = blog:1, 프레임4 = blog:2 (frameList.js 의 no → key 매핑).
//   프레임5·6(blog:4·blog:9)은 단일 상품에 맞춰 만든 화면이라 손대지 않는다 —
//   /shop/items 는 블로그형 브랜드가 전부 같은 화면을 쓰므로, 막지 않으면 5·6 까지 바뀐다.
export const 카테고리칩쓰는프레임 = (dns) => {
    if ((Number(dns?.shop_demo_num) || 0) > 0) return false;   // 쇼핑몰형은 헤더에 이미 카테고리가 있다
    return [1, 2].includes(Number(dns?.blog_demo_num) || 0);
};

const ChipRow = styled.div`
display: flex;
gap: 0.5rem;
overflow-x: auto;
padding: 0.25rem 0;
> * {
  flex-shrink: 0;
}
`

// 뿌리부터 해당 카테고리까지의 줄기. 없으면 빈 배열.
// 화면 제목에도 쓰라고 밖으로 뺀다 — 같은 계산을 두 곳에서 따로 하면 어긋난다.
export const 카테고리경로 = (themeCategoryList, category_id) => {
    const 뿌리 = themeCategoryList?.[0]?.product_categories ?? [];
    if (!category_id || 뿌리.length < 1) return [];
    const 줄기 = getAllIdsWithParents(뿌리)
        .find((c) => c[c.length - 1]?.id == category_id);
    return 줄기 ?? [];
}

// 어떤 칩을 보여줄지 정한다. 훅을 안 쓰는 순수 계산이라 검사에서 그대로 돌린다.
//   뿌리에 있으면 최상위, 들어가 있으면 그 아래 단계.
//   더 내려갈 데가 없으면 형제를 보여준다 — 그래야 옆 카테고리로 바로 건너뛴다.
//   (자식만 보여주면 잎에서 칩이 통째로 사라져 뒤로가기 말고는 길이 없다)
export const 칩목록 = (themeCategoryList, category_id) => {
    const 뿌리 = themeCategoryList?.[0]?.product_categories ?? [];
    const 경로 = 카테고리경로(themeCategoryList, category_id);
    const 현재 = 경로[경로.length - 1];
    const 형제 = 경로.length > 1 ? (경로[경로.length - 2]?.children ?? []) : 뿌리;
    const 칩들 = !현재
        ? 뿌리
        : ((현재?.children ?? []).length > 0 ? 현재.children : 형제);
    return { 경로, 칩들 };
}

const CategoryChips = ({ router }) => {
    const { themeCategoryList, themeDnsData } = useSettingsContext();
    const { translate, currentLang } = useLocales();

    if (!카테고리칩쓰는프레임(themeDnsData)) return null;
    const 뿌리 = themeCategoryList?.[0]?.product_categories ?? [];
    // 카테고리를 아직 안 만든 가맹점에는 빈 줄조차 그리지 않는다.
    if (뿌리.length < 1) return null;

    const 현재id = router.query?.category_id;
    const { 경로, 칩들 } = 칩목록(themeCategoryList, 현재id);

    const 이동 = (id) => router.push(id ? `/shop/items?category_id=${id}` : '/shop/items');

    return (
        <>
            {경로.length > 0 &&
                <Breadcrumbs
                    separator={<Icon icon='material-symbols:navigate-next' />}
                    style={{ padding: '0.25rem 0', width: '100%', overflowX: 'auto' }}
                    className='none-scroll'
                >
                    <div style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => 이동()}>
                        {translate('전체')}
                    </div>
                    {경로.map((item, idx) => (
                        <div
                            key={item?.id}
                            style={{
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontWeight: idx == 경로.length - 1 ? 'bold' : undefined,
                            }}
                            onClick={() => 이동(item?.id)}
                        >{formatLang(item, 'category_name', currentLang)}</div>
                    ))}
                </Breadcrumbs>}
            <ChipRow className='none-scroll'>
                <Chip
                    label={translate('전체')}
                    onClick={() => 이동()}
                    color={현재id ? 'default' : 'primary'}
                    variant={현재id ? 'outlined' : 'filled'}
                />
                {칩들.map((item) => (
                    <Chip
                        key={item?.id}
                        label={formatLang(item, 'category_name', currentLang)}
                        onClick={() => 이동(item?.id)}
                        color={item?.id == 현재id ? 'primary' : 'default'}
                        variant={item?.id == 현재id ? 'filled' : 'outlined'}
                    />
                ))}
            </ChipRow>
        </>
    )
}
export default CategoryChips;

import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { test_categories } from "src/data/test-data";
import { forwardRef, useEffect, useState } from "react";
import styled from "styled-components";
import { alpha, styled as muiStyled } from '@mui/material/styles';
import { TreeView, TreeItem, treeItemClasses, useTreeItem } from '@mui/lab';
import { Button, Card, Grid, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Row } from "src/components/elements/styled-components";
import PropTypes from 'prop-types';
import clsx from "clsx";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useTheme } from "@emotion/react";
import { getAllIdsWithParents } from "src/utils/function";
import { useModal } from "src/components/dialog/ModalProvider";
import { useRouter } from "next/router";
import _ from "lodash";
import { apiManager } from "src/utils/api";
import { useSettingsContext } from "src/components/settings";

// ----------------------------------------------------------------------

const StyledTreeView = muiStyled(TreeView)({
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
});

const StyledTreeItem = muiStyled((props) => <TreeItem {...props} />)(({ theme }) => ({

    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
        height: 'auto'
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));
const CustomContent = forwardRef(function CustomContent(props, ref) {

    const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
        depth,
        category,
        onClickCategoryLabel,
        onChangeStatus,
        onClickAddIcon,
        onClickCategoryDelete,
        setModal,
        index,
        category_length,
        onChangeSequence,
        categoryGroup,
    } = props;
    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
    } = useTreeItem(nodeId);
    const [isExpansion, setIsExpansion] = useState(false);
    const icon = (expansionIcon || iconProp) && (categoryGroup?.max_depth == -1 || categoryGroup?.max_depth > depth + 1);
    const handleMouseDown = (event) => {
        preventSelection(event);
    };

    const handleExpansionClick = (event) => {
        setIsExpansion(!isExpansion)
        handleExpansion(event);
    };
    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            ref={ref}
        >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
            <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon ?
                    <>
                        {isExpansion ?
                            <>
                                <Icon icon='simple-line-icons:minus' />
                            </>
                            :
                            <>
                                <Tooltip title={`하위 ${categoryGroup?.category_group_name}를 확인하시려면 클릭해 주세요.`}>
                                    <Icon icon='simple-line-icons:plus' />
                                </Tooltip>
                            </>}
                    </>
                    :
                    <>
                        <div style={{ width: `${depth > 0 ? '20px' : ''}` }} />
                    </>}
            </div>
            <Typography
                component="div"
                className={classes.label}
                style={{
                    width: `${200 + 10 * parseInt(depth)}px`,
                }}
            >
                {label}
            </Typography>
            {categoryGroup?.is_show_header_menu == 1 &&
                <>
                    <Tooltip title={`해당 ${categoryGroup?.category_group_name}을(를) 헤더메뉴에 노출 ${category?.is_show_header_menu == 0 ? '안' : ''} 하시려면 클릭해주세요.`}>
                        <IconButton onClick={() => onChangeStatus('is_show_header_menu', category?.id, (category?.is_show_header_menu == 0 ? 1 : 0))}>
                            <Icon icon={'iconoir:star-solid'} fontSize={18} style={{ color: `${category?.is_show_header_menu == 1 ? 'rgb(250, 175, 0)' : 'rgba(145, 158, 171, 0.48)'}` }} />
                        </IconButton>
                    </Tooltip>
                </>}
            <Tooltip title={`해당 ${categoryGroup?.category_group_name}을(를) 수정하시려면 클릭해주세요.`}>
                <IconButton onClick={() => onClickCategoryLabel(category, depth)}>
                    <Icon icon='tabler:edit' fontSize={16} />
                </IconButton>
            </Tooltip>
            <Tooltip title={`해당 ${categoryGroup?.category_group_name}을(를) 노출 ${category?.status == 0 ? '안' : ''} 하시려면 클릭해주세요.`}>
                <IconButton onClick={() => onChangeStatus('status', category?.id, (category?.status == 0 ? 1 : 0))}>
                    <Icon icon={category?.status == 0 ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={18} />
                </IconButton>
            </Tooltip>
            {(categoryGroup?.max_depth == -1 || categoryGroup?.max_depth > depth + 1) &&
                <>
                    <Tooltip title={`하위 ${categoryGroup?.category_group_name}를 추가하시려면 클릭해 주세요.`}>
                        <IconButton onClick={() => {
                            onClickAddIcon(category, depth)
                        }}>
                            <Icon icon='uiw:plus' fontSize={14} />
                        </IconButton>
                    </Tooltip>
                </>}
            {categoryGroup?.sort_type == 0 &&
                <>
                    <Tooltip title={`해당 ${categoryGroup?.category_group_name}을(를) 한칸 올리시려면 클릭해 주세요.`}>
                        <IconButton sx={{ padding: '0.25rem' }} disabled={index == 0} onClick={() => { onChangeSequence(true, category, depth, index) }}>
                            <Icon icon={'grommet-icons:link-up'} fontSize={14} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={`해당 ${categoryGroup?.category_group_name}을(를) 한칸 내리시려면 클릭해 주세요.`}>
                        <IconButton sx={{ padding: '0.25rem' }} disabled={index == category_length - 1} onClick={() => { onChangeSequence(false, category, depth, index) }}>
                            <Icon icon={'grommet-icons:link-down'} fontSize={14} />
                        </IconButton>
                    </Tooltip>
                </>}
            {/* 삭제는 '이 카테고리 하나만' 숨긴다. 백엔드 delete 가 그 행 하나만 is_delete=1 로
                바꾸기 때문이다(product_category.controller.js).
                예전 툴팁은 '및 하위까지 삭제'라고 약속했지만 실제로는 자식이 그대로 남았고,
                부모가 사라진 자식은 트리에서 탈락해 관리화면·고객화면 어디에도 안 보이면서
                DB 에는 살아있는 고아가 됐다. 거기 걸린 상품도 카테고리로는 도달 불가가 됐다.
                → 약속을 지키게 만드는 대신, 지킬 수 있는 것만 약속한다.
                  하위가 있으면 막고 아래부터 지우게 한다. */}
            <Tooltip title={
                category?.children?.length > 0
                    ? `하위 ${categoryGroup?.category_group_name}이(가) ${category?.children?.length}개 있어 삭제할 수 없습니다. 하위부터 삭제해 주세요.`
                    : `해당 ${categoryGroup?.category_group_name}을(를) 삭제하시려면 클릭해 주세요.`
            }>
                {/* disabled 인 버튼은 이벤트를 안 내보내 Tooltip 이 안 뜬다 — span 으로 감싼다 */}
                <span>
                    <IconButton
                        disabled={category?.children?.length > 0}
                        onClick={() => {
                            setModal({
                                func: () => { onClickCategoryDelete(category) },
                                icon: 'material-symbols:delete-outline',
                                title: '정말 삭제하시겠습니까?'
                            })
                        }}>
                        <Icon icon='material-symbols:delete-outline' fontSize={16} />
                    </IconButton>
                </span>
            </Tooltip>
        </div>
    );
});

function CustomTreeItem(props) {
    // ContentProps={...props} 는 JSX 문법상 올바르지 않다(속성 값 자리에는 스프레드를 못 쓴다).
    // SWC 는 관대해서 `ContentProps: props` 로 컴파일해 왔지만, 표준 파서(babel 등)는 이 파일을
    // 통째로 읽지 못한다 — 린트·정적분석 도구가 이 파일만 건너뛰게 된다.
    // 컴파일 결과가 같은 형태(ContentProps={props})로 바로잡는다.
    return <StyledTreeItem ContentComponent={CustomContent} {...props} ContentProps={props} />
}
const Wrappers = styled.div`
width:100%;
display:flex;
`
const ItemTypes = { CARD: 'card' }
const CategoryList = () => {
    const { setModal } = useModal()
    const { settingPlatform } = useSettingsContext(); // 카테고리 CRUD 후 themeCategoryList 갱신용
    const defaultSetting = {
        category_file: '',
        category_name: '',
        category_en_name: '',
        category_description: '',
        category_type: 0,
        status: 0,
    }
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // 전체카테고리가 저장될 변수
    const [curCategories, setCurCategories] = useState([]); // 카테고리 깊이를 보여주기 용
    const [category, setCategory] = useState(defaultSetting); // 수정하거나 추가할때 사용될 디비 커넥트용 변수
    const [isAction, setIsAction] = useState(false);
    const [categoryGroup, setCategoryGroup] = useState({});

    useEffect(() => {
        getCategoryGroups();
        getCategories();
    }, [router.query?.id])
    const getCategoryGroups = async () => {
        let category_group_list = await apiManager('product-category-groups', 'list', {
            page: 1,
            page_size: 1000,
        });
        category_group_list = category_group_list?.content ?? [];
        // 단일 트리: 라우트 id 로 그룹을 찾되, 없으면(합성 그룹 id=0 등) 첫 실그룹을
        //  신규 카테고리의 컨테이너 그룹으로 사용(라벨/설정도 여기서 파생).
        let group = _.find(category_group_list, { id: parseInt(router.query?.id) }) || category_group_list[0];
        if (group) {
            setCategoryGroup(group);
        }
    }
    const getCategories = async () => {
        setIsAction(false);
        setCategory(defaultSetting);
        // 단일 트리: 그룹 필터 없이 브랜드 전체 카테고리 트리를 조회(백엔드 group 선택적).
        let category_list = await apiManager('product-categories', 'list', {
            page: 1,
            page_size: 1000,
        })
        if (category_list) {
            setCategories(category_list?.content);
        }
        setLoading(false);
    }
    const returnTree = (category, num, index, category_length) => {
        return (
            <>
                <CustomTreeItem
                    nodeId={category?.id}
                    label={category?.category_name}
                    onClickCategoryLabel={onClickCategoryLabel}
                    onChangeStatus={onChangeStatus}
                    onClickAddIcon={onClickAddIcon}
                    depth={num}
                    category={category}
                    onClickCategoryDelete={onClickCategoryDelete}
                    setModal={setModal}
                    index={index}
                    category_length={category_length}
                    onChangeSequence={onChangeSequence}
                    categoryGroup={categoryGroup}
                >
                    {category?.children && category?.children.length > 0 &&
                        <>
                            {category?.children.map((item, idx) => (
                                <>
                                    {returnTree(item, num + 1, idx, category?.children.length)}
                                </>
                            ))}
                        </>}
                </CustomTreeItem>
            </>
        )
    }
    const onChangeSequence = async (is_up, category, depth, index) => {//카테고리 위 또는 아래로 내리기
        let parent_list = getAllIdsWithParents(categories);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == category?.id) {
                use_list = parent_list[i];
                break;
            }
        }
        let obj = {
            source_id: -1,
            source_sort_idx: -1,
            dest_id: -1,
            dest_sort_idx: -1,
        }
        let my_type = is_up ? 'dest' : 'source';
        let other_type = is_up ? 'source' : 'dest';
        obj[`${my_type}_id`] = category?.id;
        obj[`${my_type}_sort_idx`] = category?.sort_idx
        if (use_list.length > 1) {
            obj[`${other_type}_id`] = use_list[depth - 1]?.children[index + (is_up ? (-1) : 1)]?.id;
            obj[`${other_type}_sort_idx`] = use_list[depth - 1]?.children[index + (is_up ? (-1) : 1)]?.sort_idx;
        } else {
            obj[`${other_type}_id`] = categories[index + (is_up ? (-1) : 1)]?.id;
            obj[`${other_type}_sort_idx`] = categories[index + (is_up ? (-1) : 1)]?.sort_idx;
        }
        let result = await apiManager(`util/product_categories/sort`, 'create', obj);
        if (result) {
            getCategories();
        }
    }
    const onClickAddIcon = (category, depth) => { // 하위 카테고리 추가
        setIsAction(true);
        let parent_list = getAllIdsWithParents(categories);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == category?.id) {
                use_list = parent_list[i];
                break;
            }
        }
        setCurCategories(use_list);
        setCategory({
            ...defaultSetting,
            parent_id: category?.id,
            parent: category,
        })
    }
    const onChangeStatus = async (column_name, id, value) => {
        const result = await apiManager(`util/product_categories/${column_name}`, 'create', {
            id: id,
            value: value,
        });
        // 실패해도 목록을 다시 그리면 서버가 거부한 값이 화면에는 바뀐 것처럼 보였다가
        // 다음 조회에서 슬그머니 되돌아간다. 거부 사유는 apiManager 가 이미 토스트로 띄운다.
        if (result === false) return;
        getCategories();
    }
    const onClickCategoryLabel = (category, depth) => { // 해당 카테고리 수정
        setIsAction(true);
        let parent_list = getAllIdsWithParents(categories);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == category?.id) {
                use_list = parent_list[i];
                break;
            }
        }
        setCurCategories(use_list);
        setCategory(category)
    }

    const onClickCategoryDelete = async (category) => { // 해당 카테고리 삭제
        setIsAction(false);
        // 백엔드가 하위 카테고리·연결 상품이 있으면 거부한다(-100).
        // 그때 apiManager 는 false 를 돌려주고 deleteItem 이 이미 사유 토스트를 띄우므로,
        // 여기서는 목록을 새로 그리지 않고 끝낸다(안 지워졌는데 갱신만 도는 걸 막는다).
        const result = await apiManager('product-categories', 'delete', category);
        setIsAction(false);
        if (result === false) return;
        getCategories();
        settingPlatform?.();   // 컨텍스트 themeCategoryList 갱신(삭제 반영)
    }
    const onSave = async () => {
        // 단일 트리: 신규 카테고리는 컨테이너 그룹(첫 실그룹)에 담는다. 그룹 레이어는 폐지 중이나
        //  product_category_group_id 컬럼(전환기 NOT NULL 가능)을 유효값으로 채우기 위함.
        const container_group_id = categoryGroup?.id ?? router.query?.id;
        // 이름이 비면 저장하지 않는다 — 백엔드에 검사가 없어 빈 이름 카테고리가 그대로 만들어졌고,
        // 그러면 고객 화면 메뉴에 빈 칸이 생긴다.
        if (!String(category?.category_name ?? '').trim()) {
            toast.error('카테고리 이름을 입력해 주세요.');
            return;
        }
        let result = undefined;
        if (category?.id) {//수정
            result = await apiManager('product-categories', 'update', { ...category, product_category_group_id: container_group_id })
        } else {//추가
            result = await apiManager('product-categories', 'create', { ...category, product_category_group_id: container_group_id })
        }
        // 저장 결과를 확인한다. 예전엔 결과를 받기만 하고 무조건 폼을 닫아버려서,
        // 서버가 거부해도 입력값이 사라지고 저장된 것처럼 보였다(삭제 경로에는 원래 이 가드가 있다).
        if (result === false) return;
        setIsAction(false);
        getCategories();
        settingPlatform?.();   // 컨텍스트 themeCategoryList 갱신 → 상품폼 등에서 새 카테고리 즉시 반영(새로고침 불필요)
    }
    return (
        <>
            {!loading &&
                <>
                    <Wrappers>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 2, height: '100%' }}>

                                    {categories.length > 0 ?
                                        <>
                                            <StyledTreeView defaultExpanded={['1']} style={{
                                                height: 'auto'
                                            }}>
                                                {categories.map((category, index) => (
                                                    <>
                                                        {returnTree(category, 0, index, categories.length)}
                                                    </>
                                                ))}
                                            </StyledTreeView>
                                            <Tooltip title={`새로운 대분류 ${categoryGroup?.category_group_name}를 추가하시려면 클릭해주세요.`} sx={{ margin: 'auto' }} >
                                                <Button variant="outlined" sx={{ width: '316px', marginTop: '0.5rem' }} onClick={() => {
                                                    setIsAction(true);
                                                    setCategory(defaultSetting)
                                                    setCurCategories([]);
                                                }}>
                                                    대분류 {categoryGroup?.category_group_name} 추가
                                                </Button>
                                            </Tooltip>
                                        </>
                                        :
                                        <>
                                            <Row style={{
                                                display: 'flex',
                                                height: '100%',
                                                width: '100%',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{ margin: 'auto auto 1rem auto' }}>{categoryGroup?.category_group_name}를 추가해 주세요.</div>
                                                <Tooltip title={`새로운 대분류 ${categoryGroup?.category_group_name}를 추가하시려면 클릭해주세요.`} sx={{ margin: 'auto' }} >
                                                    <Button variant="outlined" sx={{ width: '316px', margin: '0 auto auto auto' }} onClick={() => {
                                                        setIsAction(true);
                                                        setCategory(defaultSetting)
                                                        setCurCategories([]);
                                                    }}>
                                                        대분류 {categoryGroup?.category_group_name} 추가
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                        </>}
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 2, height: '100%' }}>
                                    <Stack spacing={1} style={{
                                        display: 'flex', flexDirection: 'column', height: '100%',
                                        minHeight: '700px'
                                    }}>
                                        {isAction ?
                                            <>
                                                {(category?.id || category?.parent || isAction) &&
                                                    <>
                                                        <Row>
                                                            <Row style={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                                                                {curCategories.map((item, idx) => (
                                                                    <>
                                                                        <div style={{ marginRight: '0.25rem' }}>
                                                                            {item.category_name}
                                                                        </div>
                                                                        {idx != curCategories.length - 1 &&
                                                                            <>
                                                                                <div style={{ marginRight: '0.25rem' }}>
                                                                                    {'>'}
                                                                                </div>
                                                                            </>}
                                                                    </>
                                                                ))}
                                                            </Row>
                                                            {category?.id &&
                                                                <>
                                                                    {categoryGroup?.category_group_name} 수정
                                                                </>}
                                                            {category?.parent &&
                                                                <>
                                                                    의 하위 {categoryGroup?.category_group_name} 추가
                                                                </>}
                                                            {!category?.id && !category?.parent &&
                                                                <>
                                                                    새로운 대분류 {categoryGroup?.category_group_name} 추가
                                                                </>}
                                                        </Row>
                                                    </>}
                                                {/* 카테고리 이미지 입력칸을 없앴다.
                                                    고객 화면에서 category_img 를 그리는 곳이 한 군데도 없다(테스트 데이터에만 있다).
                                                    올려 봐야 아무 데도 안 나오는 칸이라 가맹점 시간만 쓴다.
                                                    이미 올린 10건의 값은 DB 에 그대로 둔다 — 쓰기로 하면 그때 화면부터 만든다. */}
                                                <TextField label={`${categoryGroup?.category_group_name}명`} value={category.category_name} onChange={(e) => {
                                                    setCategory({
                                                        ...category,
                                                        ['category_name']: e.target.value
                                                    })
                                                }} />
                                                {categoryGroup?.is_use_en_name == 1 &&
                                                    <>
                                                        <TextField label={`${categoryGroup?.category_group_name} 영문명`} value={category.category_en_name} onChange={(e) => {
                                                            setCategory({
                                                                ...category,
                                                                ['category_en_name']: e.target.value
                                                            })
                                                        }} />
                                                    </>}
                                                {/* 카테고리 설명 입력칸을 없앴다.
                                                    이것도 고객 화면에서 그리는 곳이 없다. 그런데 385개 카테고리에 적혀 있다 —
                                                    가맹점들이 보이는 줄 알고 써 온 것이다. 값은 DB 에 그대로 둔다. */}
                                                <Button variant="contained" style={{ marginTop: '100px', height: '56px' }} onClick={() => {
                                                    setModal({
                                                        func: () => { onSave() },
                                                        icon: 'material-symbols:edit-outline',
                                                        title: '저장 하시겠습니까?'
                                                    })
                                                }}>{category?.id > 0 ? '수정' : '추가'}</Button>
                                            </>
                                            :
                                            <>
                                                <div style={{ margin: 'auto' }}>
                                                </div>
                                            </>}

                                    </Stack>
                                </Card>
                            </Grid>
                        </Grid>
                    </Wrappers>
                </>}
        </>
    )
}
CategoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default CategoryList

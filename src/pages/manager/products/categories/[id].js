import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { test_categories } from "src/data/test-data";
import { forwardRef, useEffect, useState } from "react";
import styled from "styled-components";
import { alpha, styled as muiStyled } from '@mui/material/styles';
import { TreeView, TreeItem, treeItemClasses, useTreeItem } from '@mui/lab';
import { Button, Card, Grid, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Row } from "src/components/elements/styled-components";
import { Upload } from "src/components/upload";
import PropTypes from 'prop-types';
import clsx from "clsx";
import { Icon } from "@iconify/react";
import { useTheme } from "@emotion/react";
import { getAllIdsWithParents } from "src/utils/function";
import { useModal } from "src/components/dialog/ModalProvider";
import { useRouter } from "next/router";
import _ from "lodash";
import { apiManager } from "src/utils/api";

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
            <Tooltip title={`해당 ${categoryGroup?.category_group_name} 및 하위 ${categoryGroup?.category_group_name}을(를) 삭제하시려면 클릭해 주세요.`}>
                <IconButton onClick={() => {
                    setModal({
                        func: () => { onClickCategoryDelete(category) },
                        icon: 'material-symbols:delete-outline',
                        title: '정말 삭제하시겠습니까?'
                    })
                }}>
                    <Icon icon='material-symbols:delete-outline' fontSize={16} />
                </IconButton>
            </Tooltip>
        </div>
    );
});

function CustomTreeItem(props) {
    return <StyledTreeItem ContentComponent={CustomContent} {...props} ContentProps={...props} />
}
const Wrappers = styled.div`
width:100%;
display:flex;
`
const ItemTypes = { CARD: 'card' }
const CategoryList = () => {
    const { setModal } = useModal()
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
            page_size: 100000,
        });
        category_group_list = category_group_list?.content ?? [];
        let group = _.find(category_group_list, { id: parseInt(router.query?.id) });
        if (group) {
            setCategoryGroup(group);
        }
    }
    const getCategories = async () => {
        setIsAction(false);
        setCategory(defaultSetting);
        let category_list = await apiManager('product-categories', 'list', {
            page: 1,
            page_size: 100000,
            product_category_group_id: router.query?.id
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
        await apiManager('product-categories', 'delete', category);
        setIsAction(false);
        getCategories();
    }
    const onSave = async () => {
        if (category?.id) {//수정
            let result = await apiManager('product-categories', 'update', { ...category, product_category_group_id: router.query?.id })
        } else {//추가
            let result = await apiManager('product-categories', 'create', { ...category, product_category_group_id: router.query?.id })
        }
        setIsAction(false);
        getCategories();
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
                                                <Upload file={category.category_file || category.category_img} onDrop={(acceptedFiles) => {
                                                    const newFile = acceptedFiles[0];
                                                    if (newFile) {
                                                        setCategory(
                                                            {
                                                                ...category,
                                                                ['category_file']: Object.assign(newFile, {
                                                                    preview: URL.createObjectURL(newFile),
                                                                })
                                                            }
                                                        );
                                                    }
                                                }} onDelete={() => {
                                                    setCategory(
                                                        {
                                                            ...category,
                                                            ['category_file']: undefined,
                                                            ['category_img']: '',
                                                        }
                                                    )
                                                }} />
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
                                                <TextField
                                                    fullWidth
                                                    label={`${categoryGroup?.category_group_name} 설명`}
                                                    multiline
                                                    rows={4}
                                                    value={category.category_description}
                                                    onChange={(e) => {
                                                        setCategory({
                                                            ...category,
                                                            ['category_description']: e.target.value
                                                        })
                                                    }}
                                                />
                                                <Button variant="contained" style={{ marginTop: 'auto', height: '56px' }} onClick={() => {
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

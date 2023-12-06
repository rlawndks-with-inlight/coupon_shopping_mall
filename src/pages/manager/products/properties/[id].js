import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { test_properties } from "src/data/test-data";
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
        property,
        onClickPropertyLabel,
        onChangeStatus,
        onClickAddIcon,
        onClickPropertyDelete,
        setModal,
        index,
        property_length,
        onChangeSequence,
        propertyGroup,
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
    const icon = (expansionIcon || iconProp) && (propertyGroup?.max_depth == -1 || propertyGroup?.max_depth > depth + 1);
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

            <Typography
                component="div"
                className={classes.label}
                style={{
                    width: `${200 + 10 * parseInt(depth)}px`,
                }}
            >
                {label}
            </Typography>
            <Tooltip title={`해당 ${propertyGroup?.property_group_name}을(를) 수정하시려면 클릭해주세요.`}>
                <IconButton onClick={() => onClickPropertyLabel(property, depth)}>
                    <Icon icon='tabler:edit' fontSize={16} />
                </IconButton>
            </Tooltip>
            <Tooltip title={`해당 ${propertyGroup?.property_group_name}을(를) 노출 ${property?.status == 0 ? '안' : ''} 하시려면 클릭해주세요.`}>
                <IconButton onClick={() => onChangeStatus('status', property?.id, (property?.status == 0 ? 1 : 0))}>
                    <Icon icon={property?.status == 0 ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={18} />
                </IconButton>
            </Tooltip>
            <Tooltip title={`해당 ${propertyGroup?.property_group_name}을(를) 한칸 올리시려면 클릭해 주세요.`}>
                <IconButton sx={{ padding: '0.25rem' }} disabled={index == 0} onClick={() => { onChangeSequence(true, property, depth, index) }}>
                    <Icon icon={'grommet-icons:link-up'} fontSize={14} />
                </IconButton>
            </Tooltip>
            <Tooltip title={`해당 ${propertyGroup?.property_group_name}을(를) 한칸 내리시려면 클릭해 주세요.`}>
                <IconButton sx={{ padding: '0.25rem' }} disabled={index == property_length - 1} onClick={() => { onChangeSequence(false, property, depth, index) }}>
                    <Icon icon={'grommet-icons:link-down'} fontSize={14} />
                </IconButton>
            </Tooltip>
            <Tooltip title={`해당 ${propertyGroup?.property_group_name}을(를) 삭제하시려면 클릭해 주세요.`}>
                <IconButton onClick={() => {
                    setModal({
                        func: () => { onClickPropertyDelete(property) },
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
    return <StyledTreeItem ContentComponent={CustomContent} {...props} ContentProps={...props} />;
}
const Wrappers = styled.div`
width:100%;
display:flex;
`
const PropertyList = () => {
    const { setModal } = useModal()
    const defaultSetting = {
        property_file: '',
        property_name: '',
        property_description: '',
        property_type: 0
    }
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]); // 전체특성이 저장될 변수
    const [curProperties, setCurProperties] = useState([]); // 특성 깊이를 보여주기 용
    const [property, setProperty] = useState(defaultSetting); // 수정하거나 추가할때 사용될 디비 커넥트용 변수
    const [isAction, setIsAction] = useState(false);
    const [propertyGroup, setPropertyGroup] = useState({});

    useEffect(() => {
        getPropertyGroups();
        getProperties();
    }, [router.query?.id])
    const getPropertyGroups = async () => {
        let property_group_list = await apiManager('product-property-groups', 'list', {
            page: 1,
            page_size: 100000,
        });
        property_group_list = property_group_list?.content ?? [];
        let group = _.find(property_group_list, { id: parseInt(router.query?.id) });
        if (group) {
            setPropertyGroup(group);
        }
    }
    const getProperties = async () => {
        setIsAction(false);
        setProperty(defaultSetting);
        let property_list = await apiManager('product-properties', 'list', {
            page: 1,
            page_size: 100000,
            product_property_group_id: router.query?.id
        })
        if (property_list) {
            setProperties(property_list?.content);
        }
        setLoading(false);
    }
    const returnTree = (property, num, index, property_length) => {
        return (
            <>
                <CustomTreeItem
                    nodeId={property?.id}
                    label={property?.property_name}
                    onClickPropertyLabel={onClickPropertyLabel}
                    onChangeStatus={onChangeStatus}
                    onClickAddIcon={onClickAddIcon}
                    depth={num}
                    property={property}
                    onClickPropertyDelete={onClickPropertyDelete}
                    setModal={setModal}
                    index={index}
                    property_length={property_length}
                    onChangeSequence={onChangeSequence}
                    propertyGroup={propertyGroup}
                >
                    {property?.children && property?.children.length > 0 &&
                        <>
                            {property?.children.map((item, idx) => (
                                <>
                                    {returnTree(item, num + 1, idx, property?.children.length)}
                                </>
                            ))}
                        </>}
                </CustomTreeItem>
            </>
        )
    }
    const onChangeSequence = async (is_up, property, depth, index) => {//특성 위 또는 아래로 내리기
        let parent_list = getAllIdsWithParents(properties);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == property?.id) {
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
        obj[`${my_type}_id`] = property?.id;
        obj[`${my_type}_sort_idx`] = property?.sort_idx
        if (use_list.length > 1) {
            obj[`${other_type}_id`] = use_list[depth - 1]?.children[index + (is_up ? (-1) : 1)]?.id;
            obj[`${other_type}_sort_idx`] = use_list[depth - 1]?.children[index + (is_up ? (-1) : 1)]?.sort_idx;
        } else {
            obj[`${other_type}_id`] = properties[index + (is_up ? (-1) : 1)]?.id;
            obj[`${other_type}_sort_idx`] = properties[index + (is_up ? (-1) : 1)]?.sort_idx;
        }
        let result = await apiManager(`util/product_properties/sort`, 'create', obj);
        if (result) {
            getProperties();
        }
    }
    const onClickAddIcon = (property, depth) => { // 하위 특성 추가
        setIsAction(true);
        let parent_list = getAllIdsWithParents(properties);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == property?.id) {
                use_list = parent_list[i];
                break;
            }
        }
        setCurProperties(use_list);
        setProperty({
            ...defaultSetting,
            parent_id: property?.id,
            parent: property,
        })
    }
    const onChangeStatus = async (column_name, id, value) => {
        const result = await apiManager(`util/product_properties/${column_name}`, 'create', {
            id: id,
            value: value,
        });
        getProperties();
    }
    const onClickPropertyLabel = (property, depth) => { // 해당 특성 수정
        setIsAction(true);
        let parent_list = getAllIdsWithParents(properties);
        let use_list = [];
        for (var i = 0; i < parent_list.length; i++) {
            if (parent_list[i][depth]?.id == property?.id) {
                use_list = parent_list[i];
                break;
            }
        }
        setCurProperties(use_list);
        setProperty(property)
    }
    const onClickPropertyDelete = async (property) => { // 해당 특성 삭제
        setIsAction(false);
        await apiManager('product-properties', 'delete', property);
        setIsAction(false);
        getProperties();
    }
    const onSave = async () => {
        if (property?.id) {//수정
            let result = await apiManager('product-properties', 'update', { ...property, product_property_group_id: router.query?.id })
        } else {//추가
            let result = await apiManager('product-properties', 'create', { ...property, product_property_group_id: router.query?.id })
        }
        setIsAction(false);
        getProperties();
    }
    return (
        <>
            {!loading &&
                <>
                    <Wrappers>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 2, height: '100%' }}>
                                    {properties.length > 0 ?
                                        <>
                                            <StyledTreeView defaultExpanded={['1']} style={{
                                                height: 'auto'
                                            }}>
                                                {properties.map((property, index) => (
                                                    <>
                                                        {returnTree(property, 0, index, properties.length)}
                                                    </>
                                                ))}
                                            </StyledTreeView>
                                            <Tooltip title={`새로운 ${propertyGroup?.property_group_name}를 추가하시려면 클릭해주세요.`} sx={{ margin: 'auto' }} >
                                                <Button variant="outlined" sx={{ width: '316px', marginTop: '0.5rem' }} onClick={() => {
                                                    setIsAction(true);
                                                    setProperty(defaultSetting)
                                                    setCurProperties([]);
                                                }}>
                                                    {propertyGroup?.property_group_name} 추가
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
                                                <div style={{ margin: 'auto auto 1rem auto' }}>{propertyGroup?.property_group_name}를 추가해 주세요.</div>
                                                <Tooltip title={`새로운  ${propertyGroup?.property_group_name}를 추가하시려면 클릭해주세요.`} sx={{ margin: 'auto' }} >
                                                    <Button variant="outlined" sx={{ width: '316px', margin: '0 auto auto auto' }} onClick={() => {
                                                        setIsAction(true);
                                                        setProperty(defaultSetting)
                                                        setCurProperties([]);
                                                    }}>
                                                        {propertyGroup?.property_group_name} 추가
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
                                                {(property?.id || property?.parent || isAction) &&
                                                    <>
                                                        <Row>
                                                            <Row style={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                                                                {curProperties.map((item, idx) => (
                                                                    <>
                                                                        <div style={{ marginRight: '0.25rem' }}>
                                                                            {item.property_name}
                                                                        </div>
                                                                        {idx != curProperties.length - 1 &&
                                                                            <>
                                                                                <div style={{ marginRight: '0.25rem' }}>
                                                                                    {'>'}
                                                                                </div>
                                                                            </>}
                                                                    </>
                                                                ))}
                                                            </Row>
                                                            {property?.id &&
                                                                <>
                                                                    {propertyGroup?.property_group_name} 수정
                                                                </>}

                                                            {!property?.id && !property?.parent &&
                                                                <>
                                                                    새로운 {propertyGroup?.property_group_name} 추가
                                                                </>}
                                                        </Row>
                                                    </>}
                                                <Upload file={property.property_file || property.property_img} onDrop={(acceptedFiles) => {
                                                    const newFile = acceptedFiles[0];
                                                    if (newFile) {
                                                        setProperty(
                                                            {
                                                                ...property,
                                                                ['property_file']: Object.assign(newFile, {
                                                                    preview: URL.createObjectURL(newFile),
                                                                })
                                                            }
                                                        );
                                                    }
                                                }} onDelete={() => {
                                                    setProperty(
                                                        {
                                                            ...property,
                                                            ['property_file']: undefined,
                                                            ['property_img']: '',
                                                        }
                                                    )
                                                }} />
                                                <TextField label={`${propertyGroup?.property_group_name}명`} value={property.property_name} onChange={(e) => {
                                                    setProperty({
                                                        ...property,
                                                        ['property_name']: e.target.value
                                                    })
                                                }} />
                                                <TextField
                                                    fullWidth
                                                    label={`${propertyGroup?.property_group_name} 설명`}
                                                    multiline
                                                    rows={4}
                                                    value={property.property_description}
                                                    onChange={(e) => {
                                                        setProperty({
                                                            ...property,
                                                            ['property_description']: e.target.value
                                                        })
                                                    }}
                                                />
                                                <Button variant="contained" style={{ marginTop: 'auto', height: '56px' }} onClick={() => {
                                                    setModal({
                                                        func: () => { onSave() },
                                                        icon: 'material-symbols:edit-outline',
                                                        title: '저장 하시겠습니까?'
                                                    })
                                                }}>{property?.id > 0 ? '수정' : '추가'}</Button>
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
PropertyList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PropertyList

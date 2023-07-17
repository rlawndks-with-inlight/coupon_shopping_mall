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
    onClickAddIcon,
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
  const icon = expansionIcon || iconProp;
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
                <Tooltip title="하위 카테고리를 확인하시려면 클릭해 주세요.">
                  <Icon icon='simple-line-icons:plus' />
                </Tooltip>
              </>}
          </>
          :
          <>
            <div style={{ width: '20px' }} />
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
      <Tooltip title="해당 카테고리를 수정하시려면 클릭해주세요.">
        <IconButton onClick={() => onClickCategoryLabel(category, depth)}>
          <Icon icon='tabler:edit' fontSize={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="하위 카테고리를 추가하시려면 클릭해 주세요.">
        <IconButton onClick={() => {
          onClickAddIcon(category, depth)
        }}>
          <Icon icon='uiw:plus' fontSize={14} />
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
const CategoryList = () => {

  const theme = useTheme();
  const [categories, setCategories] = useState([]); // 전체카테고리가 저장될 변수
  const [curCategories, setCurCategories] = useState([]); // 카테고리 깊이를 보여주기 용
  const [category, setCategory] = useState({ // 수정하거나 추가할때 사용될 디비 커넥트용 변수
    category_img: '',
    category_name: '',
    category_description: '',
  })
  useEffect(() => {
    setCategories(test_categories)
  }, [])
  const returnTree = (category, num) => {
    return (
      <>
        <CustomTreeItem nodeId={category?.id} label={category?.category_name} onClickCategoryLabel={onClickCategoryLabel} onClickAddIcon={onClickAddIcon} depth={num} category={category}>
          {category?.children && category?.children.length > 0 &&
            <>
              {category?.children.map((item, idx) => (
                <>
                  {returnTree(item, num + 1)}
                </>
              ))}
            </>}
        </CustomTreeItem>
      </>
    )
  }
  const onClickAddIcon = (category, depth) => { // 하위 카테고리 추가
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
      category_img: '',
      category_name: '',
      parent: category
    })
  }
  const onSaveCategory = () => {

  }
  const onClickCategoryLabel = (category, depth) => { // 해당 카테고리 수정
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
      id: category?.id,
      category_name: category?.category_name,
      category_img: category?.category_img,
    })
  }
  return (
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
                    {categories.map((category, idx) => (
                      <>
                        {returnTree(category, 0)}
                      </>
                    ))}

                  </StyledTreeView>
                </>
                :
                <>
                  <Row style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%'
                  }}>
                    <div style={{ margin: 'auto' }}>카테고리를 추가해 주세요.</div>
                  </Row>
                </>}
              <Tooltip title="새로운 대분류 카테고리를 추가하시려면 클릭해주세요." sx={{ margin: 'auto' }} >
                <Button variant="outlined" sx={{ width: '284px', marginTop: '0.5rem' }}>
                  카테고리 추가
                </Button>
              </Tooltip>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Stack spacing={1} style={{
                display: 'flex', flexDirection: 'column', height: '100%',
                minHeight: '700px'
              }}>
                {(category?.id || category?.parent) &&
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
                          카테고리 수정
                        </>}
                      {category?.parent &&
                        <>
                          의 하위 카테고리 추가
                        </>}
                    </Row>
                  </>}
                <Upload file={category.category_img} onDrop={(acceptedFiles) => {
                  const newFile = acceptedFiles[0];
                  if (newFile) {
                    setCategory(
                      {
                        ...category,
                        ['category_img']: Object.assign(newFile, {
                          preview: URL.createObjectURL(newFile),
                        })
                      }
                    );
                  }
                }} onDelete={() => {
                  setCategory(
                    {
                      ...category,
                      ['category_img']: ''
                    }
                  )
                }} />
                <TextField label='카테고리명' value={category.category_name} onChange={(e) => {
                  setCategory({
                    ...category,
                    ['category_name']: e.target.value
                  })
                }} />
                <TextField
                  fullWidth
                  label="카테고리 설명"
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
                <Button variant="contained" style={{ marginTop: 'auto', height: '56px' }}>{category?.id > 0 ? '수정' : '추가'}</Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Wrappers>
    </>
  )
}
CategoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default CategoryList

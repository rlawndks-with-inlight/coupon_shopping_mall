import { Card, Container, Divider, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { deleteProductByManager, getCategoriesByManager, getProductsByManager } from "src/utils/api-manager";
import { commarNumber, getAllIdsWithParents } from "src/utils/function";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { SelectCategoryComponent } from "./[edit_category]/[id]";
import $ from 'jquery';
const test_data = [
  {
    id: 1,
    user_name: 'test1',
    phone_num: '01000000000',
  },
  {
    id: 2,
    user_name: 'test2',
    phone_num: '01000000000',
  }
]
const ProductList = () => {
  const defaultColumns = [
    {
      id: 'product_img',
      label: '상품이미지',
      action: (row) => {
        return <LazyLoadImage src={row['product_img'] ?? "---"} style={{ height: '84px', width: 'auto' }} />
      }
    },
    {
      id: 'product_name',
      label: '상품명',
      action: (row) => {
        return row['product_name'] ?? "---"
      }
    },
    {
      id: 'category_name',
      label: '카테고리',
      action: (row) => {
        return row['category_name'] ?? "---"
      }
    },
    {
      id: 'product_price',
      label: '상품가',
      action: (row) => {
        return commarNumber(row['product_price'])
      }
    },
    {
      id: 'product_sale_price',
      label: '상품 할인가',
      action: (row) => {
        return commarNumber(row['product_sale_price'])
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return row['status'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
      }
    },
    {
      id: 'edit',
      label: '수정/삭제',
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => deleteProduct(row?.id)}>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </>
        )
      }
    },
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    category_id: null
  })
  const [categories, setCategories] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [categoryChildrenList, setCategoryChildrenList] = useState([]);
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = async () => {
    let category_list = await getCategoriesByManager({ page: 1, page_size: 100000 });
    category_list = category_list?.content;
    setCategories(category_list);
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage(searchObj);
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await getProductsByManager(obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteProduct = async (id) => {
    let result = await deleteProductByManager({ id: id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const onClickCategory = (category, depth) => {
    onChangePage({ ...searchObj, category_id: category?.id })
    let parent_list = getAllIdsWithParents(categories);
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][depth]?.id == category?.id) {
        use_list = parent_list[i];
        break;
      }
    }
    setCurCategories(use_list);
    let children_list = [];
    for (var i = 0; i < use_list.length; i++) {
      children_list.push(use_list[i]?.children);
    }
    setCategoryChildrenList(children_list);
    $('.category-container').scrollLeft(100000);
  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <div style={{
            width: '100%',
            padding: '0.75rem',
          }}>
            <SelectCategoryComponent
              curCategories={curCategories}
              categories={categories}
              categoryChildrenList={categoryChildrenList}
              onClickCategory={onClickCategory}
            />
          </div>

          <Divider />
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'상품 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
ProductList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductList

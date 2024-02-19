import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { apiManager } from "src/utils/api";

const FaqList = () => {
  const { setModal } = useModal()
  const [category, setCategory] = useState({});
  const defaultColumns = [
    ...(category?.post_category_type == 1 ? [
      {
        id: 'post_title_img',
        label: '대표이미지',
        action: (row) => {
          return <LazyLoadImage src={row['post_title_img']} style={{ height: '56px' }} />
        }
      },
    ] : []),
    {
      id: 'post_title',
      label: '제목',
      action: (row) => {
        return row['post_title'] ?? "---"
      }
    },
    {
      id: 'post_category_title',
      label: '서브카테고리',
      action: (row) => {
        return category?.id == row?.category_id ? "---" : row['post_category_title']
      }
    },
    {
      id: 'writer_user_name',
      label: '작성자 유저아이디',
      action: (row) => {
        return row['writer_user_name'] ?? "---"
      }
    },
    {
      id: 'writer_nickname',
      label: '작성자 닉네임',
      action: (row) => {
        return row['writer_nickname'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return row['created_at'] ?? "---"
      }
    },
    ...((category?.is_able_user_add == 1 && category?.post_category_read_type == 1) ? [
      {
        id: 'replies',
        label: '답변여부',
        action: (row) => {
          return row?.replies.length > 0 ? '답변완료' : '답변안함'
        }
      }
    ] : []),
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
      }
    },
    {
      id: 'edit',
      label: `${(category?.is_able_user_add == 1 && category?.post_category_read_type == 1) ? '답변' : '수정'}/삭제`,
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`/manager/articles/${router.query.category_id}/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deletePost(row?.id) },
                icon: 'material-symbols:delete-outline',
                title: '정말 삭제하시겠습니까?'
              })
            }}>
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
    category_id: null,
  })
  /*useEffect(() => {
    pageSetting();
  }, [router.query])
  useEffect(() => {
    let cols = defaultColumns;
    setColumns(cols)
  }, [category])
  const pageSetting = async () => {

    let category = await apiManager('post-categories', 'get', {
      id: router.query.category_id
    })
    setCategory(category)
    onChangePage({ ...searchObj, category_id: router.query?.category_id, page: 1, });
  }*/
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('product-faq', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deletePost = async (id) => {
    let result = await apiManager('product-faq', 'delete', { id });
    if (result) {
      onChangePage({ ...searchObj, category_id: router.query?.category_id });
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'게시물 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
FaqList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default FaqList

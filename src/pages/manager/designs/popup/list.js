import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";

const PopupList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'popup_title',
      label: '제목',
      action: (row) => {
        return row['popup_title'] ?? "---"
      }
    },

    {
      id: 'status',
      label: '상태',
      action: (row) => {
        // 팝업에는 on/off 상태 컬럼이 없다(백엔드 popup.controller 가 status 를 저장하지 않는다).
        // 그래서 이 칸은 항상 빈 값이었다 — 노출기간으로 계산해 실제로 지금 뜨는지 보여준다.
        const today = new Date().toISOString().slice(0, 10);
        const s = String(row['open_s_dt'] ?? '').slice(0, 10);
        const e = String(row['open_e_dt'] ?? '').slice(0, 10);
        if (!s || !e) return '기간 미설정';
        if (today < s) return `노출 예정 (${s}부터)`;
        if (today > e) return '기간 종료';
        return '노출중';
      }
    },
    {
      id: 'open_s_dt',
      label: '시작일',
      action: (row) => {
        return row['open_s_dt'] ?? "---"
      }
    },
    {
      id: 'open_e_dt',
      label: '종료일',
      action: (row) => {
        return row['open_e_dt'] ?? "---"
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
                router.push(`/manager/designs/popup/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deletePopup(row?.id) },
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
    search: ''
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj) => {
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    });
    let data_ = await apiManager('popups', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deletePopup = async (id) => {
    let result = await apiManager('popups', 'delete', { id: id });
    if (result) {
      onChangePage(searchObj);
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
            add_button_text={'팝업 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
PopupList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PopupList


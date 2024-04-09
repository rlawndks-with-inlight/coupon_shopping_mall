import { Card, Container, FormControlLabel, IconButton, Stack, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { commarNumber, getPostCategoryReadTypeByNumber, getPostCategoryTypeByNumber } from "src/utils/function";
import { apiManager } from "src/utils/api";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ConsignmentList = () => {
    const { setModal } = useModal()
    const { user } = useAuthContext();
    const router = useRouter();

    const defaultColumns = [
        {
            id: 'product_code',
            label: '상품코드',
            action: (row) => {
                return row['product_code'] ?? "---"
            }
        },
        {
            id: 'status',
            label: '판매자',
            action: (row) => {
                return <Col>
                    <div>{row['name'] ?? "---"}</div>
                    <div>{row['user_name'] ?? "---"}</div>
                </Col>
            }
        },
        {
            id: 'product_img',
            label: '상품이미지',
            action: (row) => {
                if (row['product_img']) {
                    return <div style={{ minWidth: '100px' }}>
                        <LazyLoadImage src={row['product_img'] ?? "---"} style={{ height: '84px', width: 'auto' }} />
                    </div>
                } else {
                    return "---";
                }
            }
        },
        ...(router.query?.type == 0 ? [
            {
                id: 'product_sale_price',
                label: '등록가',
                action: (row) => {
                    return commarNumber(row['product_sale_price'])
                }
            },
            {
                id: 'request_price',
                label: '요청/판매가',
                action: (row) => {
                    return commarNumber(row['request_price'])
                }
            },
        ] : []),
        {
            id: 'created_at',
            label: '요청일',
            action: (row) => {
                return row['created_at'] ?? "---"
            }
        },
        {
            id: 'updated_at',
            label: '처리일',
            action: (row) => {
                return (row['created_at'] == row['updated_at'] ? '---' : row['updated_at']) ?? "---"
            }
        },
        {
            id: 'is_confirm',
            label: '처리여부',
            action: (row) => {
                const [checked, setChecked] = useState(row?.is_confirm == 1)
                return <FormControlLabel control={<Switch checked={checked} />} onChange={(e) => {
                    if (e.target.checked) {
                        onChangeStatus('is_confirm', row?.id, 1)
                    } else {
                        onChangeStatus('is_confirm', row?.id, 0)
                    }
                    setChecked(e.target.checked)
                }} />
            }
        },
        ...(router.query?.type == 0 ? [
            {
                id: 'setting',
                label: '관리',
                action: (row) => {
                    return '---'
                }
            },
        ] : []),
        ...(router.query?.type == 5 ? [
            {
                id: 'setting',
                label: '관리',
                action: (row) => {
                    return '---'
                }
            },
        ] : []),
    ]
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
    useEffect(() => {
        pageSetting();
    }, [router.query])
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
        })
        let data_ = await apiManager('consignments', 'list', { ...obj, type: router.query?.type });
        if (data_) {
            setData(data_);
        }
    }

    const onChangeStatus = async (column_name, id, value) => {
        const result = await apiManager(`util/consignments/${column_name}`, 'create', {
            id: id,
            value: value,
        });
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
                        add_button_text={''}
                    />
                </Card>
            </Stack>
        </>
    )
}
ConsignmentList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ConsignmentList

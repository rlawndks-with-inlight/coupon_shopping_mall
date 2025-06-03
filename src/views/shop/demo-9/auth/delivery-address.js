import { Button, Card, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import DialogAddAddress from "src/components/dialog/DialogAddAddress";
import { AddressTable } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { makeMaxPage } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const DeliveryAddressDemo = (props) => {

    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const router = useRouter();
    const [addAddressOpen, setAddAddressOpen] = useState(false);
    const [addressContent, setAddressContent] = useState({});

    const [updateAddressOpen, setUpdatedAddressOpen] = useState(false);
    const [addressID, setAddressID] = useState();

    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 10,
        search: '',
        user_id: user?.id,
    })
    useEffect(() => {
        if (user) {
            onChangePage(searchObj);
        } else {
            router.push(`/shop/auth/login`);
        }
    }, [])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        setAddressContent({
            ...addressContent,
            content: undefined,
        })
        let data = await apiManager('user-addresses', 'list', search_obj);
        if (data) {
            setAddressContent(data);
        }
    }

    const onAddAddress = async (address_obj) => {
        let result = await apiManager('user-addresses', 'create', {
            ...address_obj,
            user_id: user?.id,
        })
        if (result) {
            onChangePage(searchObj);
        }
    }
    const onDeleteAddress = async (id) => {
        let result = await apiManager('user-addresses', 'delete', {
            id: id
        })
        if (result) {
            onChangePage(searchObj);
        }
    }

    const onUpdateAddress = async (id) => {
        setAddressID(id);
        setUpdatedAddressOpen(true);
    }

    return (
        <>
            <DialogAddAddress
                addAddressOpen={addAddressOpen}
                setAddAddressOpen={setAddAddressOpen}
                onAddAddress={onAddAddress}
            />
            <DialogAddAddress
                addAddressOpen={updateAddressOpen}
                setAddAddressOpen={setUpdatedAddressOpen}
                onAddAddress={onAddAddress}
                type={'update'}
                id={addressID}
                onDeleteAddress={onDeleteAddress}
            />
            <Wrappers>
                <RowMobileReverceColumn>
                    <AuthMenuSideComponent />
                    <ContentWrappers>
                        <TitleComponent>{'배송지관리'}</TitleComponent>
                        <Card sx={{ marginBottom: '2rem' }}>
                            <AddressTable
                                addressContent={addressContent}
                                onDelete={onDeleteAddress}
                                onUpdate={onUpdateAddress}
                            />
                        </Card>
                        <Pagination
                            sx={{ margin: 'auto' }}
                            size={window.innerWidth > 700 ? 'medium' : 'small'}
                            count={makeMaxPage(addressContent?.total, addressContent?.page_size)}
                            page={addressContent?.page}
                            variant='outlined' shape='rounded'
                            color='primary'
                            siblingCount={4}
                            boundaryCount={0}
                            showFirstButton
                            showLastButton
                            onChange={(_, num) => {
                                onChangePage({ ...searchObj, page: num })
                            }} />
                        <Row>
                            <Button variant="contained" style={{ marginLeft: 'auto' }} onClick={() => setAddAddressOpen(true)}>
                                주소지 추가
                            </Button>
                        </Row>
                    </ContentWrappers>
                </RowMobileReverceColumn>
            </Wrappers>
        </>
    )
}
export default DeliveryAddressDemo

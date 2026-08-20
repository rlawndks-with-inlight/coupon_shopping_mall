import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, CardContent, CardHeader, Pagination, Stack, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { makeMaxPage } from 'src/utils/function';
import { AddressTable } from 'src/components/elements/shop/common';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';

// 배송지 관리 — 프레임 구분 없는 공용 패널.
//
// [왜 공용인가]
//  배송지 목록·추가·수정·삭제 코드가 프레임3(demo-4)·프레임(demo-9)·회원정보수정 패널에
//  각각 복사돼 있었다. 그래서 한쪽만 고쳐지는 일이 반복됐고, 실제로 회원정보수정 쪽에는
//  페이지 이동 수단이 빠져 있어 **11번째 배송지부터는 화면에서 볼 방법이 없었다**
//  (page_size 10 으로 조회만 하고 Pagination 을 안 그렸다).
//
// [레이아웃]
//  Wrappers·프레임 껍데기를 갖지 않는다. 부르는 쪽이 자기 껍데기 안에 끼워 넣는다.
//  card={false} 로 주면 카드 테두리 없이 내용만 그린다(이미 카드 안에 넣는 화면용).

const PAGE_SIZE = 10;

const AddressBookPanel = ({ card = true, title, loginPath = '/shop/auth/login' }) => {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const router = useRouter();

  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [updateAddressOpen, setUpdateAddressOpen] = useState(false);
  const [addressId, setAddressId] = useState();
  const [searchObj, setSearchObj] = useState({ page: 1, page_size: PAGE_SIZE, search: '', user_id: user?.id });

  useEffect(() => {
    if (!user?.id) return;
    onChangePage({ page: 1, page_size: PAGE_SIZE, search: '', user_id: user?.id });
  }, [user?.id]);

  const onChangePage = async (search_obj) => {
    setSearchObj(search_obj);
    setAddressContent((prev) => ({ ...prev, content: undefined }));
    let data = await apiManager('user-addresses', 'list', search_obj);
    if (data) setAddressContent(data);
  };

  const onAddAddress = async (address_obj) => {
    let result = await apiManager('user-addresses', (address_obj?.id > 0 ? 'update' : 'create'), {
      ...address_obj,
      user_id: user?.id,
    });
    if (result) onChangePage(searchObj);
  };

  const onUpdateAddress = (id) => {
    setAddressId(id);
    setUpdateAddressOpen(true);
  };

  const onDeleteAddress = async (id) => {
    let result = await apiManager('user-addresses', 'delete', { id });
    if (result) onChangePage(searchObj);
  };

  const maxPage = makeMaxPage(addressContent?.total, addressContent?.page_size);

  // 비로그인이면 조회 자체가 안 되는데 예전엔 아무 안내 없이 빈 표만 남았다
  // (블로그형 배송지 화면에도 로그인 가드가 없었다).
  if (!user?.id) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate('로그인을 해주세요.')}
        </Typography>
        <Button variant="contained" onClick={() => router.push(loginPath)}>
          {translate('로그인')}
        </Button>
      </Stack>
    );
  }

  const body = (
    <>
      <AddressTable
        addressContent={addressContent}
        onUpdate={onUpdateAddress}
        onDelete={onDeleteAddress}
      />
      {/* 한 페이지를 넘길 때만 보여준다 — 배송지가 몇 개 없는 대부분의 회원에게는 군더더기다. */}
      {maxPage > 1 &&
        <Stack alignItems="center" sx={{ pt: 2 }}>
          <Pagination
            count={maxPage}
            page={addressContent?.page ?? 1}
            variant="outlined"
            shape="rounded"
            color="primary"
            onChange={(e, num) => onChangePage({ ...searchObj, page: num })}
          />
        </Stack>}
    </>
  );

  return (
    <>
      <DialogAddAddress
        addAddressOpen={addAddressOpen}
        setAddAddressOpen={setAddAddressOpen}
        onAddAddress={onAddAddress}
      />
      <DialogAddAddress
        addAddressOpen={updateAddressOpen}
        setAddAddressOpen={setUpdateAddressOpen}
        onAddAddress={onAddAddress}
        type={'update'}
        id={addressId}
        onDeleteAddress={onDeleteAddress}
      />
      {card ?
        <Card>
          <CardHeader
            // 제목과 버튼이 한 줄에 나란히 선다. 폭이 좁아지면 서로 밀고 들어가 겹쳐 보였다.
            // 자리가 모자라면 버튼이 아래로 내려가게 둔다.
            sx={{ flexWrap: 'wrap', rowGap: 1, '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' } }}
            title={title ?? translate('배송지 관리')}
            action={
              <Button variant="outlined" onClick={() => setAddAddressOpen(true)}>
                {translate('배송지 추가')}
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>{body}</CardContent>
        </Card>
        :
        <>
          {body}
          <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="contained" onClick={() => setAddAddressOpen(true)}>
              {translate('배송지 추가')}
            </Button>
          </Stack>
        </>}
    </>
  );
};

export default AddressBookPanel;

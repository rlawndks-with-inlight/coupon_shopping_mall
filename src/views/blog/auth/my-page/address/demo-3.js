import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import AddressBookPanel from 'src/components/elements/shop/AddressBookPanel';
import { useLocales } from 'src/locales';

// 배송지 관리 (블로그형 데모3).
//
// 예전엔 이 파일이 자체 입력 폼을 통째로 들고 있었다(다음 우편번호 검색 직접 연결).
// 그래서 **국가 선택이 없어 해외 배송지를 등록할 수 없었고**, 목록 페이지 이동도 없었다.
// 같은 코드가 데모1~5 에 5벌 복사돼 있어 한쪽만 고쳐지는 일이 반복됐다.
// → 내용은 공용 패널(AddressBookPanel)에 맡기고, 이 파일은 프레임 껍데기만 담당한다.
//   국내/해외 전환·주소록 페이지네이션·삭제 확인이 모두 그쪽에 들어 있다.
const Demo3 = () => {
    const { translate } = useLocales();
    return (
        <Wrappers>
            <Title>{translate('배송지 관리')}</Title>
            <AddressBookPanel card={false} />
        </Wrappers>
    );
};

export default Demo3;

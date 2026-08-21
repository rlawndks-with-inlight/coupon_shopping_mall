import DaumPostcode from 'react-daum-postcode';
import { postCodeStyle } from 'src/components/elements/styled-components';

// 다음 우편번호 검색창 — 반드시 이걸 거쳐 쓴다. react-daum-postcode 를 직접 그리지 말 것.
//
// [고친 문제] 주소를 고르는 순간 화면이 통째로 죽었다.
//   NotFoundError: Failed to execute 'removeChild' on 'Node':
//   The node to be removed is not a child of this node.
//
//   라이브러리 안을 보면 이렇게 되어 있다(lib/DaumPostcodeEmbed.js):
//       oncomplete: (data) => { onComplete?.(data); autoClose && wrap.current && wrap.current.remove(); }
//   autoClose 기본값이 true 라, 주소를 고르면 **React 가 그린 div 를 라이브러리가 직접 지운다**.
//   React 는 그 div 가 아직 자기 자식인 줄 알고 있으므로, 바로 이어지는 리렌더에서
//   removeChild 를 부르다 터진다. 우리 화면은 onComplete 에서 상태를 바꿔 곧바로 리렌더하기
//   때문에 100% 걸린다(주소지 설정·주문서 배송지 양쪽 모두).
//
//   DOM 을 지우는 일은 React 에게 맡긴다 — autoClose 를 끄고, 닫는 것은 우리 상태로 한다.
//   그래서 onComplete 를 넘길 때는 반드시 그 안에서 창을 닫아야 한다(안 그러면 계속 떠 있는다).
const PostcodeBox = ({ onComplete, style, ...rest }) => (
  <DaumPostcode
    {...rest}
    style={{ ...postCodeStyle, ...(style ?? {}) }}
    autoClose={false}
    onComplete={onComplete}
  />
);

export default PostcodeBox;

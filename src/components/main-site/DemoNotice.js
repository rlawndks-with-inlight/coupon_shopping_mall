import { useEffect, useState } from 'react';
import { isDemoHost } from './frameList';
import { useWordBreak } from './wordBreak';
import { MobileBreakText } from './mobileBreak';

// 데모 미리보기(demo-N.*) 접속 시 하단에 상시 안내 배너 노출.
// 실제 로그인/회원가입/결제 등은 차단되어 있음을 사전에 알린다.
export default function DemoNotice() {
  const [show, setShow] = useState(false);
  // 이 배너는 MainSiteLayout 밖(_app)에서 그려지므로 줄바꿈 규칙을 상속받지 못한다.
  // 안 주면 '로그인·회원가입·결 / 제 등' 처럼 어절 한가운데가 잘린다.
  const wordBreak = useWordBreak();

  useEffect(() => {
    setShow(isDemoHost());
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 3000,
        background: 'rgba(17,17,17,0.95)',
        color: '#fff',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 1.6,
        padding: '10px 14px',
        backdropFilter: 'blur(4px)',
        wordBreak,
      }}
    >
      {/* 미리보기는 이미 콘텐츠가 채워진 운영 몰을 보여주므로, 개설 직후의 빈 몰과 격차가 크다.
          "본 화면 그대로 개설된다"는 오해를 막기 위해 무엇이 직접 설정 대상인지 명시한다. */}
      {/* 모바일에서 끊을 자리를 '|' 로 지정한다. 안 주면 마지막에 '않습니다.' 다섯 글자만
          다음 줄로 떨어진다. 줄 수는 어차피 셋이라 배너 높이는 그대로다.
          PC 에서는 '|' 가 사라지고 한 줄로 이어지므로, 띄어쓰기는 '|' 앞에 둔다. */}
      <div>
        <MobileBreakText text="🔍 디자인 미리보기(데모) 화면입니다 — |로그인·회원가입·결제 등 |실제 기능은 동작하지 않습니다." />
      </div>
      <div style={{ marginTop: 4, color: '#c9c9c9' }}>
        화면에 보이는 <b style={{ color: '#fff' }}>상품 · 카테고리 · 배너 등 디자인 구성은 예시</b>입니다.
        개설 후 <b style={{ color: '#fff' }}>직접 등록·설정</b>하셔야 합니다.
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { isDemoHost } from './frameList';
import { useWordBreak } from './wordBreak';
import { useLocales } from 'src/locales';
import { MobileBreakText } from './mobileBreak';

// 데모 미리보기(demo-N.*) 접속 시 하단에 상시 안내 배너 노출.
// 실제 로그인/회원가입/결제 등은 차단되어 있음을 사전에 알린다.
export default function DemoNotice() {
  const [show, setShow] = useState(false);
  const { translate, currentLang } = useLocales();
  const 한국어 = (currentLang?.value || 'ko') === 'ko';
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
      {/* 이 배너는 프레임 미리보기를 누른 사람이 제일 먼저 보는 문구다. 그런데 한국어 고정이라
          영어·일본어·중국어·스페인어로 보는 사람에게는 '왜 로그인이 안 되는지' 를 알려 주지
          못했다. 해외 판매가 소구점인 서비스에서 그 설명을 못 읽는 셈이었다.

          예전에는 문장 안에 <b> 로 강조를 넣었는데, 그 방식은 번역이 안 된다 —
          '상품·카테고리·배너 등 디자인 구성은 예시' 같은 조각은 언어마다 어순이 달라
          문장을 쪼개 놓으면 맞출 수가 없다. 문장 단위로 옮기고 강조는 줄 색으로 대신한다.

          모바일 줄바꿈은 사전 문구가 아니라 여기서 '|' 로 준다 — 언어마다 길이가 달라
          한국어 기준으로 넣은 자리가 다른 언어에서는 엉뚱해지기 때문이다.
          한국어일 때만 끊어 주고, 나머지는 브라우저에 맡긴다(위 wordBreak 규칙이 받는다). */}
      <div>
        <MobileBreakText text={한국어
          ? '🔍 디자인 미리보기(데모) 화면입니다 — |로그인·회원가입·결제 등 |실제 기능은 동작하지 않습니다.'
          : translate('🔍 디자인 미리보기(데모) 화면입니다 — 로그인·회원가입·결제 등 실제 기능은 동작하지 않습니다.')} />
      </div>
      <div style={{ marginTop: 4, color: '#d8d8d8' }}>
        {translate('화면에 보이는 상품 · 카테고리 · 배너 등 디자인 구성은 예시입니다. 개설 후 직접 등록·설정하셔야 합니다.')}
      </div>
    </div>
  );
}

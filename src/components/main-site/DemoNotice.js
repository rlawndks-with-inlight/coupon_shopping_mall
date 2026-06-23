import { useEffect, useState } from 'react';
import { isDemoHost } from './frameList';

// 데모 미리보기(demo-N.*) 접속 시 하단에 상시 안내 배너 노출.
// 실제 로그인/회원가입/결제 등은 차단되어 있음을 사전에 알린다.
export default function DemoNotice() {
  const [show, setShow] = useState(false);

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
      }}
    >
      🔍 디자인 미리보기(데모) 화면입니다 — 로그인·회원가입·결제 등 실제 기능은 동작하지 않습니다.
    </div>
  );
}

// 관리자 왼쪽 메뉴 「결제완료」「취소요청」 옆 건수(해담수산 요청 2026-11-23).
//   그 상태에 남아 있는 주문 수다. 다른 상태로 옮기면 줄고 0이면 숫자가 사라진다.
//   메뉴는 여러 곳(세로·접힌·가로 메뉴, 상단 메뉴 검색)이 그리므로 숫자는 여기서 한 번만 받아 나눠 쓴다.
//   새로 받는 때: 메뉴가 처음 뜰 때 · 1분마다(탭을 보고 있을 때만) · 탭으로 돌아왔을 때 · 관리자 페이지를 옮길 때 ·
//   주문을 바꾸는 요청이 성공했을 때(api.js 가 주문건수바뀜() 을 부른다).
import { useEffect, useState } from 'react';
import Router from 'next/router';
import axios from './axios';

const 주기 = 60 * 1000;
const 최소간격 = 3 * 1000;   // 페이지를 빠르게 옮겨 다닐 때 같은 숫자를 연달아 묻지 않게
const 신호 = 'shopgo:order-menu-counts';

let 값 = null;              // { paid, cancel_request }
let 마지막 = 0;
let 진행중 = null;
let 다시 = false;           // 받는 도중 주문이 바뀌었으면 끝난 뒤 한 번 더
let 타이머 = null;
const 듣는것 = new Set();

const 보는중 = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';

const 받기 = (바로 = false) => {
  if (진행중) { if (바로) 다시 = true; return 진행중; }
  if (!바로 && (!보는중() || Date.now() - 마지막 < 최소간격)) return null;
  진행중 = (async () => {
    try {
      // 공용 get() 은 실패하면 알림을 띄운다 — 1분마다 부르는 숫자라 조용히 받는다
      const { data } = await axios.get('/api/transactions/menu-counts');
      if (data?.result > 0 && data?.data) {
        값 = { paid: Math.max(0, Number(data.data.paid) || 0), cancel_request: Math.max(0, Number(data.data.cancel_request) || 0) };
        듣는것.forEach((f) => f(값));
      }
    } catch (e) {
      // 숫자를 못 받아도 메뉴는 그대로 쓴다
    } finally {
      마지막 = Date.now();
      진행중 = null;
      if (다시) { 다시 = false; 받기(true); }
    }
  })();
  return 진행중;
};

const 탭으로돌아옴 = () => { if (보는중()) 받기(); };
const 페이지옮김 = () => 받기();
const 주문바뀜 = () => 받기(true);

const 시작 = () => {
  타이머 = setInterval(() => 받기(), 주기);
  document.addEventListener('visibilitychange', 탭으로돌아옴);
  window.addEventListener(신호, 주문바뀜);
  Router.events.on('routeChangeComplete', 페이지옮김);
};
const 멈춤 = () => {
  clearInterval(타이머);
  타이머 = null;
  document.removeEventListener('visibilitychange', 탭으로돌아옴);
  window.removeEventListener(신호, 주문바뀜);
  Router.events.off('routeChangeComplete', 페이지옮김);
};

// 주문을 바꾸는 요청(상태 변경·취소·부분취소·취소요청 거절·삭제)이 성공했을 때 api.js 가 부른다.
const 주문바꾸는주소 = /^\/api\/(transactions|pays\/cancel|pays\/cancel-partial|util\/transactions)(\/|$|\?)/;
export const 주문건수바뀜 = (url) => {
  if (typeof window === 'undefined' || !주문바꾸는주소.test(String(url ?? ''))) return;
  window.dispatchEvent(new Event(신호));
};

// 켜기: 관리자(등급 10 이상)일 때만 true. 아니면 묻지 않고 null.
export const useOrderMenuCounts = (켜기) => {
  const [v, setV] = useState(값);
  useEffect(() => {
    if (!켜기) return undefined;
    듣는것.add(setV);
    if (듣는것.size === 1) 시작();
    setV(값);
    받기();
    return () => {
      듣는것.delete(setV);
      if (듣는것.size === 0) 멈춤();
    };
  }, [켜기]);
  return 켜기 ? v : null;
};

// 메뉴에 붙이는 숫자 모양. 0이면 아무것도 안 붙인다.
export const 건수글자 = (n) => (n > 99 ? '99+' : String(n));

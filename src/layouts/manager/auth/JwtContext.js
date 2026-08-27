import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios from 'src/utils/axios';
import localStorageAvailable from 'src/utils/localStorageAvailable';
import { isDemoHost } from 'src/components/main-site/frameList';
//
import { useRouter } from 'next/router';
import { isManagerRouter } from 'src/utils/function';
import { toast } from 'react-hot-toast';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  const storageAvailable = localStorageAvailable();

  // 로그인 여부를 묻는다.
  //
  // ⚠ '서버가 아니라고 했다' 와 '물어보지 못했다' 는 다르다.
  //
  //   [증상] 토큰이 멀쩡한데도(로그인한 지 한 시간도 안 됐는데) 갑자기 로그인 화면이 떴다.
  //   [원인] 백엔드는 실패 코드를 **HTTP 500** 으로 내려보낸다(utils.js/util.js 의 response).
  //     axios 는 2xx 가 아니면 reject 하므로, DB 가 한 번 삐끗하거나(운영 로그에
  //     'packets out of order' 91건 · 'Socket closed' 8건 · ETIMEDOUT 4건이 쌓여 있다)
  //     배포 중 재시작에 걸리거나 네트워크가 잠깐 끊기면 그대로 catch 로 떨어졌고,
  //     그 catch 가 **곧바로 로그아웃 상태로 만들었다.**
  //     initialize 는 페이지를 새로 열 때마다 돈다 — 관리자에는 window.location 이동이 있어
  //     자주 불린다. 그래서 '아무 때나' 튕기는 것처럼 보였다.
  //   [수정] 물어보지 못했으면 몇 번 더 물어본다. 그래도 안 되면 그때 로그아웃으로 본다.
  //     서버가 200 으로 '사용자 없음' 을 말한 경우는 그대로 로그인 화면으로 보낸다(그건 진짜다).
  const 잠깐 = (ms) => new Promise((r) => setTimeout(r, ms));

  const initialize = useCallback(async () => {
    let user = undefined;
    try {
      let response = null;
      let 마지막오류 = null;
      // 0초 → 1초 → 3초. pm2 재시작 정도는 이 사이에 끝난다.
      for (const 기다림 of [0, 1000, 3000]) {
        if (기다림) await 잠깐(기다림);
        try {
          response = (await axios.get(`/api/auth`))?.data;
          마지막오류 = null;
          break;
        } catch (e) {
          마지막오류 = e;
        }
      }
      if (마지막오류) throw 마지막오류;

      if (response?.data?.id > 0) {

        user = response?.data;
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        if (isManagerRouter(router)) {
          router.push('/manager/login');
        }
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'INITIAL',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
    return user;
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 세션 이어가기.
  //
  // 토큰 수명은 180분인데 로그인할 때 한 번만 발급됐다. 갱신 경로가 없어서, 계속 일하던
  // 사람도 로그인 후 3시간이 되면 끊겼다 — '무활동 3시간'이 아니라 '로그인 후 3시간'이라
  // 쓰고 있는 중에 갑자기 로그인 화면으로 튀는 것처럼 보였다.
  // 백엔드는 /api/auth 를 부를 때 남은 시간이 절반 아래면 토큰을 새로 준다. 그런데 이 화면은
  // 첫 진입 때 딱 한 번만 그걸 불렀다(SPA 라 화면을 옮겨도 다시 안 부른다) — 그래서 갱신이
  // 걸릴 기회 자체가 없었다. 여기서 주기적으로 두드려 준다.
  //
  // ⚠ 실패해도 로그아웃시키지 않는다. 이 두드림은 '살아 있음'을 알리는 용도일 뿐이고,
  //   네트워크가 한 번 끊겼다고 작업 중인 사람을 내쫓으면 안 된다.
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const 두드리기 = () => {
      // 탭이 뒤에 있으면 굳이 부르지 않는다(브라우저가 타이머를 늦추기도 한다).
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      axios.get('/api/auth').catch(() => { });
    };
    const timer = setInterval(두드리기, 20 * 60 * 1000);   // 20분
    // 다른 탭에서 일하다 돌아왔을 때도 한 번 이어 준다.
    document.addEventListener('visibilitychange', 두드리기);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', 두드리기);
    };
  }, [state.isAuthenticated]);

  // LOGIN
  const login = useCallback(async (user_name, user_pw, is_manager, otp_num) => {
    if (isDemoHost()) {
      toast.error('데모 미리보기에서는 로그인할 수 없습니다.');
      return false;
    }
    if (!user_name || !user_pw) {
      toast.error('필수값을 입력해 주세요.');
      return false;
    }
    let response;
    try {
      const res = await axios.post(`/api/auth/sign-in`, {
        user_name,
        user_pw,
        is_manager,
        otp_num,
        // 어느 몰에 로그인하는지 함께 보낸다.
        //
        // 서버는 원래 dns 쿠키에서 브랜드를 꺼내 쓰는데, 그 쿠키도 3시간짜리라 로그인 토큰과
        // 같이 죽는다. 창을 오래 열어 둔 뒤 다시 로그인하면 브랜드를 못 찾아 '가입되지 않은
        // 회원입니다'(=아이디/비번 오류)가 떴다 — 새로고침하면 되던 이유가 이것이다.
        // 이 값이 있으면 쿠키가 죽어 있어도 서버가 브랜드를 다시 찾을 수 있다.
        dns: typeof window !== 'undefined' ? window.location.host.split(':')[0] : '',
      });
      response = res.data;
    } catch (error) {
      // 백엔드가 비즈니스 에러(잘못된 비밀번호/미가입 등)를 HTTP 500 으로 반환 → axios 가 throw.
      const backendMsg = error?.response?.data?.message;
      // 자격증명 오류('가입되지 않은 회원입니다.' = 미가입/비번틀림 통합)는 일반 문구로 표기,
      //   그 외 의미있는 메시지(승인대기/탈퇴/OTP 등)는 그대로 노출.
      const msg = (!backendMsg || backendMsg === '가입되지 않은 회원입니다.')
        ? '아이디 또는 비밀번호가 올바르지 않습니다.'
        : backendMsg;
      toast.error(msg);
      return false;
    }
    if (response?.result < 0) {
      toast.error(response?.message)
      return false;
    }
    const user = response.data;
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
    return user;
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    if (isDemoHost()) {
      toast.error('데모 미리보기에서는 회원가입할 수 없습니다.');
      return false;
    }
    let response;
    try {
      response = await axios.post('/api/account/register', {
        email,
        password,
        firstName,
        lastName,
      });
    } catch (error) {
      // 백엔드 비즈니스 에러를 HTTP 500 으로 반환 → axios throw. 메시지 알림(login 과 동일 이슈).
      toast.error(error?.response?.data?.message || '회원가입에 실패했습니다.');
      return false;
    }
    const { accessToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  }, []);
  // LOGOUT
  const logout = useCallback(async () => {
    const response = await axios.post('/api/auth/sign-out');
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'jwt',
      login,
      register,
      logout,
      initialize,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, logout, register, initialize]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

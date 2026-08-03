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

  const initialize = useCallback(async () => {
    let user = undefined;
    try {
      const { data: response } = await axios.get(`/api/auth`);

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
        otp_num
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
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName,
    });
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

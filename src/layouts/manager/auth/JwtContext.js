import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { axiosIns } from 'src/utils/axios'
import localStorageAvailable from 'src/utils/localStorageAvailable';
//
import { isValidToken, setSession } from './utils';
import { deleteCookie, getCookie, setCookie } from 'src/utils/react-cookie';
import { useSettingsContext } from 'src/components/settings';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

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
    try {
      const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';
      const response = await axiosIns().post('/api/v1/auth/ok', {}, {
        headers: {
          "Authorization": `Bearer ${getCookie('o')}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      });

      if (accessToken && isValidToken(accessToken)) {

        const response = await axios.get('/api/v1/auth/ok');

        const { user } = response.data;
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        deleteCookie('o');
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      deleteCookie('o');
      dispatch({
        type: 'INITIAL',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (user_name, user_pw) => {
    try{
      let dns_data = getCookie('themeDnsData')
      const response = await axiosIns().post('/api/v1/auth/sign-in', {
        brand_id: dns_data.id,
        user_name: user_name,
        user_pw: user_pw,
        login_type: 0,
      });
      await setCookie('o', response?.data?.access_token, {
        path: "/",
        secure: process.env.COOKIE_SECURE,
        sameSite: process.env.COOKIE_SAME_SITE,
      });
      dispatch({
        type: 'LOGIN',
        payload: {
          user: response?.data?.user,
        },
      });
    }catch(error){
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
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
    try {
      const response = await axiosIns().post('/api/v1/auth/sign-out', {
        headers: {
          "Authorization": `Bearer ${getCookie('o')}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      });
      dispatch({
        type: 'LOGOUT',
      });
    } catch (error) {
      console.log(error)
    }

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
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, logout, register]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

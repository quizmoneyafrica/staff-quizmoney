/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/utils';
import { getSessionTokenHeaders } from '@/app/api/userApi';
import { useAppDispatch } from '@/app/hooks/useAuth';
import { logout } from '@/app/store/authSlice';
import { store } from '@/app/store/store';

const session = store.getState().auth.userEncryptedData;

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

const requestConfiguration = (config) => {
  return {
    ...config,
    headers: getSessionTokenHeaders(),
  };
};

const errorHandler = async (error) => {
  if (error?.response?.status === 401) {
    if (
      error?.response?.data?.message === 'Token expired, please login again'
    ) {
      if (session?.refreshToken) {
        try {
          const response = request.post('/auth/refresh', {
            tokenValue: session?.refreshToken,
          });
          //TODO: handle refresh token
          console.log('response: refresh token ', response);
          return;
        } catch (error) {
          console.log('error: ', error);
        }
      }
    }

    // dispatch(logout());
    window.location.href = ROUTES.LOG_IN;
  }

  if (error?.response?.data?.code === 209) {
    // dispatch(logout());
    // router.push(ROUTES.LOG_IN);
  }

  return Promise.reject(error);
};

request.interceptors.request.use(requestConfiguration, errorHandler);

request.interceptors.response.use((response) => response, errorHandler);

export const useRequestInstance = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const requestIntercept = request.interceptors.request.use(
      requestConfiguration,
      (error) => Promise.reject(error),
    );

    const responseIntercept = request.interceptors.response.use(
      (response) => response,
      errorHandler,
    );

    return () => {
      request.interceptors.request.eject(requestIntercept);
      request.interceptors.response.eject(responseIntercept);
    };
  }, [router]);

  return request;
};

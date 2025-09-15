/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/utils';
import { getSessionTokenHeaders } from '@/app/api/userApi';
import secureLocalStorage from 'react-secure-storage';

const operator = secureLocalStorage.getItem('operator') as UnknownObject;

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

const requestConfiguration = (config) => ({
  ...config,
  headers: getSessionTokenHeaders(),
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const errorHandler = async (error) => {
  const location = window.location.pathname;

  if (error?.response?.status === 401 || error?.response?.status === 403) {
    if (operator?.refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`,
            {
              tokenValue: operator?.refreshToken,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: null,
              },
            },
          );

          const { accessToken, refreshToken } = response.data.data;
          secureLocalStorage.setItem('operator', {
            accessToken,
            refreshToken,
          });
          onRefreshed(accessToken);
          isRefreshing = false;
        } catch (refreshError) {
          isRefreshing = false;
          window.location.href = `${ROUTES.LOG_IN}?from=${encodeURIComponent(
            location,
          )}`;
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token: string) => {
          // Clone the original request and update the Authorization header
          const originalRequest = error.config;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          resolve(request(originalRequest));
        });
      });
    }

    window.location.href = ROUTES.LOG_IN;
  }

  return Promise.reject(error);
};

request.interceptors.request.use(requestConfiguration, errorHandler);

request.interceptors.response.use((response) => response, errorHandler);

export const useRequestInstance = () => {
  const router = useRouter();

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

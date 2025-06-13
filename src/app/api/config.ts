/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/utils';
import { getSessionTokenHeaders } from '@/app/api/userApi';
// import { toast } from 'sonner';

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

export const useRequestInstance = () => {
  const router = useRouter();

  useEffect(() => {
    const requestIntercept = request.interceptors.request.use(
      (config: any) => {
        return {
          ...config,
          headers: getSessionTokenHeaders(),
        };
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = request.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          if (
            error?.response?.data?.error === 'Unauthorized: No token provided'
          ) {
            // toast.error(error?.response?.data?.error);
            router.push(ROUTES.LOG_IN);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      request.interceptors.request.eject(requestIntercept);
      request.interceptors.response.eject(responseIntercept);
    };
  }, [router]);

  return request;
};

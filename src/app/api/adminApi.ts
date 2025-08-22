import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface AdminResponse {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  adminType: 'SUPER_ADMIN' | 'ADMIN' | string;
  emailAddress: string;
  dateJoined: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  adminId: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateAdminPayload {
  adminType: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
}

export interface UpdateAdminStatusPayload {
  adminId: string;
  activate: boolean;
}

export interface GetAdminsParams {
  search?: string;
  page?: number;
  size?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  accountType?: string;
}

const AdminApi = {
  createAdmin: async (
    data: CreateAdminPayload,
  ): Promise<
    AxiosResponse<{ success: boolean; message: string; data: AdminResponse }>
  > => {
    return axios.post(`${BASE_URL}/admins`, data, {
      headers: await getSessionTokenHeaders(),
    });
  },

  getAdmins: async (
    params: GetAdminsParams = {},
  ): Promise<
    AxiosResponse<{ success: boolean; data: PaginatedResponse<AdminResponse> }>
  > => {
    return axios.get(`${BASE_URL}/admins`, {
      params,
      headers: await getSessionTokenHeaders(),
    });
  },

  updateAdminStatus: async (
    data: UpdateAdminStatusPayload,
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> => {
    return axios.patch(
      `${BASE_URL}/admins/${data.adminId}`,
      { activate: data.activate },
      {
        headers: await getSessionTokenHeaders(),
      },
    );
  },
};

export const useAdmins = (params: GetAdminsParams = {}) => {
  return useQuery({
    queryKey: ['admins', params],
    queryFn: () => AdminApi.getAdmins(params).then((res) => res.data.data),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminPayload) =>
      AdminApi.createAdmin(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useUpdateAdminStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAdminStatusPayload) =>
      AdminApi.updateAdminStatus(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export default AdminApi;

import { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/app/api/config';

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
  adminType?: string;
}

const AdminApi = {
  createAdmin: async (
    data: CreateAdminPayload,
  ): Promise<
    AxiosResponse<{ success: boolean; message: string; data: AdminResponse }>
  > => {
    return request.post(`/admins`, data);
  },

  getAdmins: async (
    params: GetAdminsParams = {},
  ): Promise<
    AxiosResponse<{ success: boolean; data: PaginatedResponse<AdminResponse> }>
  > => {
    return request.get(`/admins`, { params });
  },

  updateAdminStatus: async (
    data: UpdateAdminStatusPayload,
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> => {
    return request.patch(`/admins/${data.adminId}`, {
      activate: data.activate,
    });
  },
};

export const useAdmins = (params: GetAdminsParams = {}) => {
  return useQuery({
    queryKey: ['admins', params],
    queryFn: () => AdminApi.getAdmins(params).then((res) => res.data.data),
    retry: false,
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

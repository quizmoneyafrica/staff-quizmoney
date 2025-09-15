import { AxiosResponse } from 'axios';
import {
  ApiResponse,
  ForgotPasswordRequest,
  InAppChangePasswordForm,
  LoginForm,
  ResetPasswordForm,
  ResetPasswordRequest,
  SignUpForm,
  UpdateUserForm,
  VerifyEmailForm,
  VerifyForgotPasswordOtpForm,
  VerifyOtpRequest,
} from './interface';
import { store } from '@/app/store/store';
import { decryptData } from '../utils/crypto';
import { request } from '@/app/api/config';
import secureLocalStorage from 'react-secure-storage';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
const XParseApplicationId = process.env.NEXT_PUBLIC_XParseApplicationId;
const XParseRESTAPIKey = process.env.NEXT_PUBLIC_XParseRESTAPIKey;
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY!;

export interface AdminResponse {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  adminType: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  emailAddress: string;
  dateJoined: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  adminId: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AvatarProjection {
  id: string;
  name: string;
  avatarUrl: string;
}

const appHeaders = {
  'Content-Type': 'application/json',
};

const getSessionTokenHeaders = () => {
  const operator = secureLocalStorage.getItem('operator') as UnknownObject;

  const sessionToken = operator?.accessToken;

  return {
    Authorization: `Bearer ${sessionToken}`,
    'Content-Type': 'application/json',
  };
};

const getAuthUser = () => {
  const encrypted = store.getState().auth.userEncryptedData;
  const user = encrypted ? decryptData(encrypted) : null;
  return user?.user;
};

const UserAPI = {
  refreshToken(token) {
    return request.post(`/auth/refresh`, { token });
  },
  login(form: LoginForm): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/auth/login`, form);
  },
  signUp(form: SignUpForm): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/signup`, form);
  },
  verifyEmail(form: VerifyEmailForm): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/verifyMail`, form);
  },
  resendSignupOtp(email: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/resendSignupOtp`, { email });
  },
  async forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: ForgotPasswordRequest = {
      email: email.toLowerCase().trim(),
      purpose: 'EMAIL_VERIFICATION',
    };
    return request.post(`${BASE_URL}/auth/password/forgot`, payload, {
      headers: appHeaders,
    });
  },

  //
  async resendPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: ForgotPasswordRequest = {
      email: email.toLowerCase().trim(),
      purpose: 'EMAIL_VERIFICATION',
    };
    return request.post(`${BASE_URL}/auth/password/forgot`, payload, {
      headers: appHeaders,
    });
  },

  async verifyForgotPasswordOtp(
    form: VerifyForgotPasswordOtpForm,
  ): Promise<AxiosResponse<ApiResponse>> {
    const payload: VerifyOtpRequest = {
      otp: form.otp,
      purpose: 'EMAIL_VERIFICATION',
    };
    return request.post(`${BASE_URL}/auth/otp/verify`, payload, {
      headers: appHeaders,
    });
  },

  async resetPasswordAuth(
    form: ResetPasswordForm & { code: string; confirmPassword: string },
  ): Promise<AxiosResponse<ApiResponse>> {
    const payload: ResetPasswordRequest = {
      code: form.code,
      password: form.password,
      confirmPassword: form.confirmPassword || form.password,
    };
    return request.post(`${BASE_URL}/auth/password/reset`, payload, {
      headers: appHeaders,
    });
  },
  inAppChangePassword(
    form: InAppChangePasswordForm,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/inAppChangePassword`, form);
  },
  updateAdmin(form: UpdateUserForm): Promise<AxiosResponse<ApiResponse>> {
    return request.patch(`/admins`, form);
  },
  getAvatars(): Promise<AxiosResponse<ApiResponse>> {
    return request.get(`https://quizmoney.b4a.io/classes/Avatars`);
  },
  topGamersOfToday(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/topGamersOfThisMonth`, { headers: appHeaders });
  },
  getReferralStats(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/referralData`);
  },
  getAdminProfile(adminId: string): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: AdminResponse;
    }>
  > {
    return request.get(`/admins/${adminId}`);
  },
  changePassword(
    payload: ChangePasswordRequest,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.patch(`/admins/change-password`, payload);
  },
  getAvatarsList(): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: AvatarProjection[];
    }>
  > {
    return request.get(`/avatars`);
  },
};

export {
  appHeaders,
  getSessionTokenHeaders,
  BASE_URL,
  SOCKET_URL,
  XParseApplicationId,
  XParseRESTAPIKey,
  SECRET_KEY,
  getAuthUser,
};
export default UserAPI;

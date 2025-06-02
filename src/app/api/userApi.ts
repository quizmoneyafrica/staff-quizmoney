import axios, { AxiosResponse } from "axios";
import {
  ApiResponse,
  InAppChangePasswordForm,
  LoginForm,
  ResetPasswordForm,
  SignUpForm,
  UpdateUserForm,
  VerifyEmailForm,
  VerifyForgotPasswordOtpForm,
} from "./interface";
import { store } from "@/app/store/store";
import { decryptData } from "../utils/crypto";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
const XParseApplicationId = process.env.NEXT_PUBLIC_XParseApplicationId;
const XParseRESTAPIKey = process.env.NEXT_PUBLIC_XParseRESTAPIKey;
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY!;

const appHeaders = {
  "X-Parse-Application-Id": XParseApplicationId,
  "X-Parse-REST-API-Key": XParseRESTAPIKey,
  "Content-Type": "application/json",
};
const getSessionTokenHeaders = () => {
  const encrypted = store.getState().auth.userEncryptedData;
  const user = encrypted ? decryptData(encrypted) : null;
  const sessionToken = user?.sessionToken;

  return {
    "X-Parse-Application-Id": process.env.NEXT_PUBLIC_XParseApplicationId!,
    "X-Parse-REST-API-Key": process.env.NEXT_PUBLIC_XParseRESTAPIKey!,
    "X-Parse-Session-Token": sessionToken,
    "Content-Type": "application/json",
  };
};

const getAuthUser = () => {
  const encrypted = store.getState().auth.userEncryptedData;
  const user = encrypted ? decryptData(encrypted) : null;
  return user;
};

const UserAPI = {
  login(form: LoginForm): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/login`, form, {
      headers: appHeaders,
    });
  },
  signUp(form: SignUpForm): Promise<AxiosResponse<ApiResponse>> {
    console.log("Form: ", form);
    return axios.post(`${BASE_URL}/signup`, form, {
      headers: appHeaders,
    });
  },
  verifyEmail(form: VerifyEmailForm): Promise<AxiosResponse<ApiResponse>> {
    console.log("Form: ", form);
    return axios.post(`${BASE_URL}/verifyMail`, form, {
      headers: appHeaders,
    });
  },
  resendSignupOtp(email: string): Promise<AxiosResponse<ApiResponse>> {
    console.log("Form: ", email);
    return axios.post(
      `${BASE_URL}/resendSignupOtp`,
      { email },
      {
        headers: appHeaders,
      }
    );
  },

  forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/forgotPassword`,
      { email },
      {
        headers: appHeaders,
      }
    );
  },
  verifyForgotPasswordOtp(
    form: VerifyForgotPasswordOtpForm
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/verifyForgotPasswordOtp`, form, {
      headers: appHeaders,
    });
  },
  resetPasswordAuth(
    form: ResetPasswordForm
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/changePassword`, form, {
      headers: appHeaders,
    });
  },
  inAppChangePassword(
    form: InAppChangePasswordForm
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/inAppChangePassword`, form, {
      headers: getSessionTokenHeaders(),
    });
  },

  updateUser(form: UpdateUserForm): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/updateProfile?firstName=${form.firstName}&lastName=${form.lastName}&dob=${form.dob}&gender=${form.gender}&country=${form.country}&facebook=${form.facebook}&instagram=${form.instagram}&twitter=${form.twitter}&whatsapp=${form.whatsapp}&avatar=${form.avatar}`,
      {},
      {
        headers: getSessionTokenHeaders(),
      }
    );
  },

  getAvatars(): Promise<AxiosResponse<ApiResponse>> {
    return axios.get(`https://quizmoney.b4a.io/classes/Avatars`, {
      headers: getSessionTokenHeaders(),
    });
  },

  topGamersOfToday(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/topGamersOfThisMonth`,
      {},
      { headers: appHeaders }
    );
  },

  getReferralStats(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/referralData`,
      {},
      {
        headers: getSessionTokenHeaders(),
      }
    );
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

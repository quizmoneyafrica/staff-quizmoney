/* eslint-disable @typescript-eslint/no-explicit-any */
//API Response Type
export interface ApiResponse {
  [key: string]: any;
}
//Login Interface
export interface LoginForm {
  username: string;
  password: string;
  deviceToken: string | null;
}

//Sign up interface
export interface SignUpForm {
  email: string;
  password: string;
  deviceToken: string | null;
}

//VerifyEmail interface
export interface VerifyEmailForm {
  email: string;
  otp: string;
}

//ResendSignupOTP interface
export interface ResendSignupOTPForm {
  email: string;
}

//verifyForgotPasswordOtp interface
export interface VerifyForgotPasswordOtpForm {
  email: string;
  otp: string;
}
//verifyForgotPasswordOtp interface
export interface ResetPasswordForm {
  email?: string;
  password: string;
}

export interface InAppChangePasswordForm {
  oldPassword: string;
  newPassword: string;
}

//Signup
export interface SignUpFormType {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  gender: string;
  country: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  promotionalMails: boolean;
  referredBy: string;
}

export interface Product {
  productImage: {
    name: string;
    url: string;
  };
  productDescription: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
  productCategory: string;
  stock: string;
  createdAt: string; // or Date if you're parsing it
  updatedAt: string; // or Date
  objectId: string;
  bonus: number;
}

export interface User {
  admin?: boolean;
  avatar?: string;
  balance?: string;
  country?: string;
  createdAt?: Date; // ISO Date string
  deviceToken?: string;
  dob?: {
    __type: 'Date';
    iso: string; // ISO Date string
  };
  dummyAccount?: boolean;
  email?: string;
  emailVerified?: boolean;
  erasers?: number;
  firstName?: string;
  // games: []; // You can replace `any` with a proper Game interface if known
  gender?: 'male' | 'female';
  influencer?: boolean;
  lastName?: string;
  objectId?: string;
  otp?: string;
  otpExpiry?: {
    __type: 'Date';
    iso?: Date;
  };
  promotionalMails?: boolean;
  referralCode?: string;
  referralPoints?: number;
  sessionToken?: string;
  updatedAt?: Date; // ISO Date string
  username?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface UpdateUserForm {
  firstName?: string;
  lastName?: string;
  dob?:
    | string
    | {
        __type: 'Date';
        iso: string; // ISO Date string
      };
  gender?: string;
  country?: string;
  avatar?: string;
  promotionalMails?: boolean;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
}

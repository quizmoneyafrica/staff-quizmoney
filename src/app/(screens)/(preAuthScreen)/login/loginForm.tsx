"use client";
import UserAPI from "@/app/api/userApi";
import { useAuth } from "@/app/hooks/useAuth";
import useFcmToken from "@/app/hooks/useFcmToken";
import { EyeIcon, EyeSlash, MailIcon } from "@/app/icons/icons";
import getDeviceId from "@/app/pwa/deviceId";

import { encryptData } from "@/app/utils/crypto";
import CustomButton from "@/app/utils/CustomBtn";
import CustomTextField from "@/app/utils/CustomTextField";
import {
  capitalizeFirstLetter,
  isValidEmail,
  toastPosition,
} from "@/app/utils/utils";
import { Flex } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoginForm = ({ loading, setLoading }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { token, notificationPermissionStatus } = useFcmToken();
  const { loginUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      notificationPermissionStatus &&
      notificationPermissionStatus !== "granted"
    ) {
      toast.info(`Notification is not set for Quiz Money`, {
        position: "bottom-right",
      });
    }
    if (!email || !password) {
      toast.error(`Email and password are required.`, {
        position: toastPosition,
      });
      setLoading(false);
      return;
    }
    const deviceId = getDeviceId();
    const newValues = {
      email: email.toLowerCase().trim(),
      password: password,
      deviceToken: token || "",
      deviceId: deviceId,
    };
    try {
      const response = await UserAPI.login(newValues);
      const userData = response.data.result;

      if (userData?.emailVerified) {
        if (userData?.admin) {
          // Encrypt the user data
          const encryptedUser = encryptData(userData);

          // Dispatch to Redux
          loginUser(encryptedUser);

          router.replace("/dashboard");

          toast.success(
            `Welcome Back ${capitalizeFirstLetter(userData?.firstName)}`,
            {
              position: "top-center",
            }
          );
        } else {
          toast.error(`You are not authorized to access.`, {
            position: toastPosition,
          });
          setLoading(false);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setLoading(false);
      toast.error(`${err.response.data.error}`, {
        position: toastPosition,
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full">
      <Flex direction="column" gap="4" className="w-full">
        <CustomTextField
          label="Email"
          name="email"
          value={email}
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon className="text-[#A6ABC4]" />}
          disabled={loading}
        />
        <CustomTextField
          label="Password"
          name="password"
          value={password}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          icon={
            showPassword ? (
              <EyeIcon
                className="text-[#A6ABC4]"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <EyeSlash
                className="text-[#A6ABC4]"
                onClick={() => setShowPassword(true)}
              />
            )
          }
          disabled={loading}
        />

        <Flex justify="end">
          <Link
            href="/forgot-password"
            className="underline underline-offset-4 text-primary-900"
          >
            Forgot your password?
          </Link>
        </Flex>
        <div className="pt-4 w-full">
          {!loading ? (
            <CustomButton
              type="submit"
              width="full"
              disabled={!isValidEmail(email) || password === ""}
            >
              Login
            </CustomButton>
          ) : (
            <CustomButton type="button" width="full" loader disabled />
          )}
        </div>
      </Flex>
    </form>
  );
};
export default LoginForm;

type IconButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
};

export function IconButton({ children, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#ECECEC] hover:bg-[#e2e1e1] cursor-pointer py-3 px-8 rounded-[10px] transition"
    >
      {children}
    </button>
  );
}

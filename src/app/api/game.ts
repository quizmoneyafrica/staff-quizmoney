import axios, { AxiosResponse } from "axios";
import {
  appHeaders,
  BASE_URL,
  getSessionTokenHeaders,
  SECRET_KEY,
} from "./userApi";
import { ApiResponse } from "./interface";
import CryptoJS from "crypto-js";

const GameApi = {
  fetchNextGame(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/errorLoad`, {}, { headers: appHeaders });
  },
  registerForGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/registerForGame`,
      { gameId },
      { headers: getSessionTokenHeaders() }
    );
  },
  removeUserFromGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/removeUserFromGame`,
      { gameId },
      { headers: getSessionTokenHeaders() }
    );
  },
  deactivateSession(gameId: string) {
    return axios.post(
      `${BASE_URL}/deactivateSession`,
      { gameId },
      { headers: getSessionTokenHeaders() }
    );
  },
  getLoggedinUserGameResults(
    gameId: string
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getLoggedinUserGameResults`,
      { gameId },
      { headers: getSessionTokenHeaders() }
    );
  },

  updateErasers(erasersUsed: number) {
    return axios.post(
      `${BASE_URL}/updateErasers`,
      { erasersUsed },
      { headers: getSessionTokenHeaders() }
    );
  },
  recordGameAnswer(
    gameId: string,
    questionNumber: string,
    answer: string,
    totalTime?: string
  ) {
    return axios.post(
      `${BASE_URL}/recordGameAnswer`,
      {
        gameId,
        questionNumber,
        answer,
        ...(totalTime && { totalTime }),
      },
      { headers: getSessionTokenHeaders() }
    );
  },
};

export default GameApi;

export function decryptGameData(encrypted: string) {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
export function encryptGameData(data: object): string {
  const stringified = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
  return encrypted;
}

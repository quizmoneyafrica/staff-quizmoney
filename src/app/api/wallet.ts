import axios, { AxiosResponse } from "axios";
import { BASE_URL, getSessionTokenHeaders } from "./userApi";
import { ApiResponse } from "./interface";

const WalletApi = {
	fetchCustomerWallet(): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/fetchCustomerWallet`,
			{},
			{ headers: getSessionTokenHeaders() }
		);
	},
	fetchTransactions(page?:{
   page:number,limit:number
}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/fetchTransactions`,
			page?{...page}:{},
			{ headers: getSessionTokenHeaders() }
		);
	},
	getCheckoutLink(data:{amount:string}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/getCheckoutLink`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	addBankAccount(data:any): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/addBankAccount`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	verifyAccount(data:{
		email:string;
		accountNumber: string;
		bankCode: string;
	}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/verifyAccount`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	listBanks(): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/listBanks`,
			{},
			{ headers: getSessionTokenHeaders() }
		);
	},
	fetchDedicatedAccount(data:{
		email:string
	}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/fetchDedicatedAccount`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	createWithdrawalPin(data:{
		pin:string;
		edit?:boolean;
		oldPin?:string
	}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/createWithdrawalPin`,
			data?.edit?{...data}:{pin:data?.pin},
			{ headers: getSessionTokenHeaders() }
		);
	},
	requestWithdrawal(data:{
			amount:string;
			pin: string;
			bankAccount: {
					accountNumber: string,
					bankName:string,
					accountName: string
	}
	}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/requestWithdrawal`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	removeBankAccount(data:{
			bankAccount: {
					accountNumber: string,
					bankName:string,
					accountName: string
	}
	}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/removeBankAccount`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
	searchTransactions(data:{	query:string}): Promise<AxiosResponse<ApiResponse>> {
		return axios.post(
			`${BASE_URL}/searchTransactions`,
			{...data},
			{ headers: getSessionTokenHeaders() }
		);
	},
};

export default WalletApi;

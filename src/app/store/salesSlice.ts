import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export type StoreTransaction = {
  objectId: string;
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  firstName: string;
  avatar: string;
  amount: number;
  status: string;
  userId?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
  };
  product: {
    productImage: {
      __type: 'File';
      name: string;
      url: string;
    };
    productDescription: string;
    productName: string;
    productPrice: number;
    productQuantity: number;
    productCategory: string;
    stock: string;
    bonus: number;
    totalEraser: number;
    createdAt: string;
    updatedAt: string;
    type: string;
    objectId: string;
    __type: 'Object';
    className: 'Products';
  };
};

type Result = {
  message: string;
  storeTransactions: StoreTransaction[];
};

interface SalesState {
  salesData: Result | null;
  isLoading: boolean;
}

const initialState: SalesState = {
  salesData: null,
  isLoading: false,
};

const salesSlice = createSlice({
  name: 'salesSclice',
  initialState,
  reducers: {
    setSalesData(state, action: PayloadAction<Result>) {
      state.salesData = action.payload;
    },
    setLoadingSales(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setSalesData, setLoadingSales } = salesSlice.actions;

export default salesSlice.reducer;
export const selectSales = (state: RootState) => state.salseData;

export interface BaseTransaction {
  id: string;
  amount: number;
  type?: string;
  status?: string;
  description?: string;
  transactionId?: string;
  transactionType?: string;
  transactionStatus?: string;
  transactionDate?: string;
  narration?: string;
  firstName?: string;
  lastName?: string;
  direction?: 'DEBIT' | 'CREDIT';
  currency?: string;
  createdAt?: {
    __type: string;
    iso: string;
  };
  dateTime?: string;
  date?: string;
  action?: string;
  [key: string]: unknown;
}

export type Transaction = BaseTransaction & {
  type: string;
  status: string;
  description: string;
};

export interface TransactionPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TransactionResponse {
  data: Transaction[];
  pagination: TransactionPagination;
}

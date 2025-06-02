/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAppDispatch } from "@/app/hooks/useAuth";
import { useCallback, useEffect } from "react";
import WalletApi from "../wallet";
import { setTransactions, setWallet } from "@/app/store/walletSlice";
import { liveQueryClient } from "@/app/api/parse/parseClient";
import Parse from "parse";
import { getAuthUser } from "../userApi";

function WalletQueries() {
  const dispatch = useAppDispatch();
  const user = getAuthUser();

  const fetchWallet = useCallback(async () => {
    try {
      const res = await WalletApi.fetchCustomerWallet();
      if (res.data.result.wallet) {
        dispatch(setWallet(res.data.result.wallet));
      }
    } catch (error) {
      return error && null;
    } finally {
    }
  }, [dispatch]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await WalletApi.fetchTransactions();

      if (res?.data?.result?.groupedTransactions) {
        dispatch(setTransactions(res?.data?.result?.groupedTransactions ?? []));
      }
    } catch (error) {
      return error && null;
    } finally {
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user?.objectId) return;
    let walletSubscription: any;
    let transactionSubscription: any;

    const walletLiveQuery = async () => {
      const query = new Parse.Query("Wallet");
      query.equalTo("user", {
        __type: "Pointer",
        className: "_User",
        objectId: user?.objectId,
      });
      walletSubscription = await liveQueryClient.subscribe(query);

      walletSubscription?.on("create", () => {
        fetchWallet();
      });
      walletSubscription?.on("update", () => {
        fetchWallet();
      });
    };
    const transactionLiveQuery = async () => {
      const query = new Parse.Query("UserWalletTransaction");
      query.equalTo("user", {
        __type: "Pointer",
        className: "_User",
        objectId: user?.objectId,
      });
      transactionSubscription = await liveQueryClient.subscribe(query);

      transactionSubscription?.on("create", () => {
        fetchTransactions();
      });
      transactionSubscription?.on("update", () => {
        fetchTransactions();
      });
    };

    walletLiveQuery();
    transactionLiveQuery();
    return () => {
      if (walletSubscription) walletSubscription.unsubscribe();
      if (transactionSubscription) transactionSubscription.unsubscribe();
    };
  }, [dispatch, fetchTransactions, fetchWallet, user?.objectId]);
  return null;
}

export default WalletQueries;

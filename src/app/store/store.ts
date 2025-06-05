import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";
import dashboardReducer from "./dashboardSlice";
import leaderboardReducer from "./leaderboardSlice";
import gameReducer from "./gameSlice";
import withdrawReducer from "./withdrawalSlice";
import salesReducer from "./salesSlice";
import playersReducer from "./playersSlice";

import { createFilter } from "redux-persist-transform-filter";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import localForage from "localforage";

const authTransform = createFilter("auth", ["userEncryptedData"]);

const authPersistConfig = {
  key: "auth",
  storage: localForage,
  transforms: [authTransform],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: notificationReducer,
    salseData:salesReducer,
    players:playersReducer,
    dashboard: dashboardReducer,
    leaderboard: leaderboardReducer,
    game: gameReducer,
    withdraw: withdrawReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

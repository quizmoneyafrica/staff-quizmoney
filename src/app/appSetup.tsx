'use client';
import React, { useEffect } from 'react';
import { Theme } from '@radix-ui/themes';
import { Provider } from 'react-redux';
import { persistor, store } from './store/store'; 
import { useAppDispatch } from './hooks/useAuth';
import { PersistGate } from 'redux-persist/integration/react';
import { setRehydrated } from './store/authSlice';
import { Toaster } from './components/toaster/sonner';
import EnablePushOnIosButton from './pwa/iosNotificationRequest';
import PermissionGuide from './pwa/permissionGuide';
import { disableConsoleInProduction, isIosPwaInstalled } from './utils/utils';
import useFcmToken from './hooks/useFcmToken';

function RootHydrationWatcher() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setRehydrated(true));
  }, [dispatch]);

  return null;
}

type Props = {
  children: React.ReactNode;
};
function AppSetup({ children }: Props) {
  const { token, notificationPermissionStatus } = useFcmToken();

  const isVisible =
    notificationPermissionStatus === 'default' ||
    notificationPermissionStatus === 'denied';

  useEffect(() => {
    disableConsoleInProduction();
    window.scrollTo(0, 0);
  }, []);

  return (
    <Theme appearance="light" className="!font-text">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {isVisible && !token && !isIosPwaInstalled() && <PermissionGuide />}
          <RootHydrationWatcher />
          <Toaster appearance="light" />
          <EnablePushOnIosButton />
          {children}
        </PersistGate>
      </Provider>
    </Theme>
  );
}

export default AppSetup;

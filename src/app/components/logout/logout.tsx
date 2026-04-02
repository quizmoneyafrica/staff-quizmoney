'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Modal from '../modal/ModalWindow';
import { useLogout } from '@/app/lib/queries';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LogoutDialog = ({ open, onOpenChange }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutate: logoutMutate } = useLogout();

  const handleLogout = async () => {
    setLoading(true);

    logoutMutate();

    setLoading(false);
    onOpenChange(false);

    router.replace('/login');
  };

  return (
    <Modal
      open={open}
      handleClose={onOpenChange}
      redTitle
      title="Confirm Logout"
      actionBtnText="Log Out"
      actionOnClick={handleLogout}
      actionLoader={loading}
    >
      <div>
        <p>Are you sure you want to log out of Quiz Money?</p>
      </div>
    </Modal>
  );
};

export default LogoutDialog;

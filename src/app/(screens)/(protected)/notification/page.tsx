"use client";
import { ApiResponse } from "@/app/api/interface";
import EmptyState from "@/app/components/notification/emptyState";
import { NotificationBox } from "@/app/components/notification/NotificationBox";
import { useAppSelector } from "@/app/hooks/useAuth";
import { Grid } from "@radix-ui/themes";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ViewNotification from "@/app/components/notification/ViewNotification";
import QmDrawer from "@/app/components/drawer/drawer";
import NotificationApi from "@/app/api/notification";

function Page() {
  const notifications = useAppSelector(
    (state) => state.notifications.notifications
  );
  const [openNotification, setOpenNotification] = useState(false);
  const [passedNotification, setPassedNotification] = useState<ApiResponse>({});
  const prevOpenRef = useRef<boolean>(false);

  useEffect(() => {
    // When the drawer was previously open and now closed
    if (
      prevOpenRef.current &&
      !openNotification &&
      passedNotification?.objectId &&
      !passedNotification.read
    ) {
      NotificationApi.readNotification(passedNotification.objectId).catch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
          console.error("Failed to mark notification as read", err);
        }
      );
    }

    // update previous value
    prevOpenRef.current = openNotification;
  }, [openNotification, passedNotification]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {notifications?.length < 1 ? (
        <EmptyState />
      ) : (
        <>
          <QmDrawer
            open={openNotification}
            onOpenChange={setOpenNotification}
            heightClass="h-[60%] lg:h-auto"
            trigger={
              <Grid columns="1" gap="4">
                {notifications?.map(
                  (notification: ApiResponse, index: number) => {
                    return (
                      <NotificationBox
                        key={index}
                        notification={notification}
                        setOpenNotification={setOpenNotification}
                        setPassedNotification={setPassedNotification}
                      />
                    );
                  }
                )}
              </Grid>
            }
          >
            <ViewNotification notification={passedNotification} />
          </QmDrawer>
        </>
      )}
    </motion.div>
  );
}

export default Page;

"use client";
import React, { useEffect, useState } from "react";
import { isIosPwaInstalled } from "../utils/utils";
import { Button, Callout, Container } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import useFcmToken from "../hooks/useFcmToken";
import PermissionGuide from "./permissionGuide";

export default function EnablePushOnIosButton() {
	const [isVisible, setIsVisible] = useState(false);
	const [status, setStatus] = useState("Tap to enable push notifications");
	const { token, notificationPermissionStatus } = useFcmToken();

	useEffect(() => {
		if (typeof window === "undefined" || !("Notification" in window)) return;
		if (isIosPwaInstalled()) {
			setIsVisible(true);
		}
	}, []);

	useEffect(() => {
		if (!isVisible) return;

		switch (notificationPermissionStatus) {
			case "granted":
				setStatus("✅ Push already enabled!");
				break;
			case "denied":
				setStatus("❌ Notifications blocked");
				break;
			default:
				setStatus("Tap to enable push notifications");
		}
	}, [notificationPermissionStatus, isVisible]);

	const handleClick = async () => {
		if (!isIosPwaInstalled()) return;
		if (typeof window === "undefined" || !("Notification" in window)) return;

		try {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				setStatus("✅ Push enabled!");
			} else if (permission === "denied") {
				setStatus("❌ Permission denied");
			} else {
				setStatus("⚠️ Please enable notifications from settings");
			}
		} catch (err) {
			console.error("Error enabling push:", err);
			setStatus("⚠️ Could not request permission");
		}
	};
	if (!isVisible || token) return null;

	return (
		<div>
			<PermissionGuide />
			<Container pb="2" px="2">
				<Callout.Root>
					<Callout.Icon>
						<InfoCircledIcon />
					</Callout.Icon>
					<Callout.Text className="flex flex-col gap-3">
						<span>
							🔔 Notifications are required to participate in{" "}
							<span className="font-bold">Quiz Money</span>!
						</span>
						<Button onClick={handleClick}>{status}</Button>
					</Callout.Text>
				</Callout.Root>
			</Container>
		</div>
	);
}

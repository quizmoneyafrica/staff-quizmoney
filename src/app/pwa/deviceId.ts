import { v4 as uuidv4 } from "uuid";

export default function getDeviceId(): string {
  let deviceId = localStorage.getItem("quizmoney_device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("quizmoney_device_id", deviceId);
  }
  return deviceId;
}

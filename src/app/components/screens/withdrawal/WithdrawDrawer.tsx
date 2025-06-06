import { toast } from "sonner";
import AppLoader from "../../loader/loader";
import { formatDateTime, formatNaira, toastPosition } from "@/app/utils/utils";
import { WithdrawalRequest } from "@/app/store/withdrawalSlice";
import { useState } from "react";
import WithdrawalApi from "@/app/api/withdrawalApi";
import copy from "copy-to-clipboard";
import { Copy } from "lucide-react";
import { Avatar } from "@radix-ui/themes";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IWithdrawDetailsModalProps {
  data: WithdrawalRequest;
  onClose: () => void;
}

const WithdrawDetailsModal: React.FunctionComponent<
  IWithdrawDetailsModalProps
> = ({ data, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = () => {};

  const handleApproved = async () => {
    if (!data || !data.id) {
      toast.error("Invalid transaction data");
      return;
    }
    const fee = 0;
    try {
      setIsLoading(true);
      const response = await WithdrawalApi.approveWithdrawal(data.id, fee);

      console.log("Response:", response);
      toast.success("Withdrawal approved successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error approving withdrawal:", error.message);
      toast.error(`Failed to approve withdrawal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AppLoader />;
  }
  const handleCopy = (data: string) => {
    const success = copy(data);

    if (success) {
      toast.success("Copied Successfully", { position: toastPosition });
    }
  };
  const { time, fullDate } = data && formatDateTime(data.createdAt.iso);
  if (data)
    return (
      <>
        <div className="py-5 space-y-7">
          <div className="flex items-center justify-between">
            <p className="font-bold font-heading">Withdrawal details</p>
          </div>

          <div className="border-t border-b py-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <div className="w-[40px] h-[40px] p-1 rounded-full bg-primary-50">
                <Avatar
                  src=""
                  fallback={data.firstName?.charAt(0).toUpperCase()}
                  radius="full"
                  className="bg-primary-50"
                />
              </div>

              <div>
                <p className="font-medium font-heading capitalize">
                  {data.firstName} {data.lastName}
                </p>
                <p>{data.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium font-heading">Wallet Balance</p>
              <p>{formatNaira(Number(data.balance), true)}</p>
            </div>
          </div>
          <div className="border-b border-dashed pb-5 space-y-8">
            <LinedData title="Request ID" data={data.id} />
            <LinedData
              title="Request Amount "
              data={`${formatNaira(Number(data.amount), true)}`}
              onClick={() =>
                handleCopy(`${formatNaira(Number(data.amount), true)}`)
              }
            />
            <LinedData title="Bank Name" data={data.bankAccount.bankName} />
            <LinedData
              title="Account No"
              data={data.bankAccount.accountNumber}
            />
            <LinedData
              title="Account Holder"
              data={data.bankAccount.accountName}
            />

            <LinedData title="Request Date" data={fullDate} />
            <LinedData title="Request Time" data={time} />
            <LinedData title="Request Status" data={data.status} />
          </div>

          <div className="space-y-4">
            {/* <CustomTextArea
              error={false}
              full={true}
              placeholder="Add Comments"
            ></CustomTextArea> */}
            <div className="space-x-4 flex items-center justify-end">
              <button
                onClick={handleReject}
                disabled={data.status !== "pending"}
                className="w-[120px] h-10 px-[18px] py-2 bg-error-400 rounded-3xl justify-center items-center inline-flex text-white"
              >
                Reject
              </button>
              <button
                onClick={handleApproved}
                disabled={data.status === "resolved"}
                className="w-[120px] h-10 px-[18px] py-2 bg-positive-800 rounded-3xl justify-center items-center inline-flex text-white"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </>
    );
};

export default WithdrawDetailsModal;

interface LinedDataProps {
  title: string;
  data: string | any;
  onClick?: () => void;
}

const LinedData: React.FunctionComponent<LinedDataProps> = ({
  title,
  data,
  onClick,
}) => {
  return (
    <div className="flex items-center justify-between">
      <p className="font-heading">{title}</p>

      <p
        className={`font-heading capitalize ${
          data === "resolved"
            ? "bg-positive-50 text-positive-900 py-1 px-4 rounded-full"
            : data === "failed"
            ? "bg-error-50 text-error-900 py-1 px-4 rounded-full"
            : data === "pending"
            ? "bg-warning-100 text-warning-900 py-1 px-4 rounded-full"
            : null
        }`}
      >
        {data}
      </p>
      <button onClick={onClick}>
        <Copy />
      </button>
    </div>
  );
};

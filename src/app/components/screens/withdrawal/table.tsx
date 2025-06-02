import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { WithdrawalRequest } from "@/app/store/withdrawalSlice";
import { formatDateTime, formatNaira } from "@/app/utils/utils";
import { CaretSortIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { Avatar, Table } from "@radix-ui/themes";

interface IRecentWithdrawTableProps {
  data: WithdrawalRequest[];
  viewDetails: (data: WithdrawalRequest) => void;
}

const RecentWithdrawTable: React.FC<IRecentWithdrawTableProps> = ({
  data,
  viewDetails,
}) => {
    type SortableWithdrawalKeys = "id" | "firstName" | "amount" | "balance" | "status" | "createdAt";

    const [sortBy, setSortBy] = React.useState<SortableWithdrawalKeys | "">("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: SortableWithdrawalKeys) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortBy) {
      return data.slice().sort((a, b) => {
        const order = sortOrder === "asc" ? 1 : -1;
        const aValue = a[sortBy] as string | number | Date;
        const bValue = b[sortBy] as string | number | Date;
  
        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });
    }
    return data;
  }, [data, sortBy, sortOrder]);

  return (
    <div className="overflow-x-auto">
      <Table.Root
        variant="ghost"
        className="min-w-full border-collapse text-sm"
      >
        <Table.Header className="bg-primary-50">
          <Table.Row>
            <Th label="Request ID" onClick={() => handleSort("id")} />
            <Th label="First Name" onClick={() => handleSort("firstName")} />
            <Th label="Wallet Balance" onClick={() => handleSort("balance")} />
            <Th label="Amount Requested" onClick={() => handleSort("amount")} />
            <Th
              label="Withdrawal Status"
              onClick={() => handleSort("status")}
            />
            <Table.Cell className="text-left px-4 py-2">Action</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => {
              const { time, fullDate } = formatDateTime(item.createdAt.iso);

              return (
                <Table.Row key={item.id}>
                  <Table.Cell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-[48px] w-[48px] bg-neutral-50 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold font-heading text-neutral-800 uppercase">
                          {/* {item.id} */}
                          {fullDate}
                        </p>
                        <p className="text-xs text-neutral-500">{time}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-[40px] h-[40px] p-1 rounded-full flex items-center justify-center bg-primary-50">
                        <Avatar
                          src={item.id}
                          fallback={item.firstName?.charAt(0).toUpperCase()}
                          radius="full"
                          className="bg-primary-50"
                        />
                      </div>
                      <p className="capitalize text-primary-800">
                        {item.firstName}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    {formatNaira(Number(item.balance), true)}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    {formatNaira(Number(item.amount), true)}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <p
                      className={`font-heading capitalize rounded-full text-center py-2 px-4 w-fit ${
                        item.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </p>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button>
                          <DotsVerticalIcon />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="start"
                        className="z-50 bg-white shadow-md rounded-md p-1 border w-40"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer px-2 py-1 hover:bg-primary-50 rounded text-sm text-primary-900 font-medium"
                          onClick={() => viewDetails(item)}
                        >
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Table.Cell>
                </Table.Row>
              );
            })
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={6}
                className="text-center py-12 font-bold text-error-500"
              >
                No Pending Request
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default RecentWithdrawTable;

interface ThProps {
  label: string;
  onClick: () => void;
}

const Th: React.FC<ThProps> = ({ label, onClick }) => (
  <Table.Cell className="text-left px-4 py-2 cursor-pointer" onClick={onClick}>
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <CaretSortIcon />
    </div>
  </Table.Cell>
);

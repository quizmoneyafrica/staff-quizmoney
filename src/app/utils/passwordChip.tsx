import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "./utils";

type Props = {
	text: string;
	valid: boolean;
};

export const PasswordChip = ({ text, valid }: Props) => {
	return (
		<div
			className={cn(
				"flex items-center gap-2 text-nowrap px-3 py-1 rounded-full text-xs font-medium transition",
				valid
					? "bg-positive-100 text-positive-900"
					: "bg-[#F4F4F4] text-[#6E759F]"
			)}>
			{valid && <CheckIcon className="w-4 h-4 text-green-700" />}
			<span>{text}</span>
		</div>
	);
};

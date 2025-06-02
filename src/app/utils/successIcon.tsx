import { CheckIcon } from "@radix-ui/react-icons";
import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "./utils";

type Size = "xs" | "sm" | "md" | "lg";

type Props = {
	size?: Size;
};

const sizeMap: Record<Size, string> = {
	xs: "w-8 h-8",
	sm: "w-10 h-10",
	md: "w-14 h-14",
	lg: "w-20 h-20",
};
const sizeMap2: Record<Size, string> = {
	xs: "w-16 h-16 p-1",
	sm: "w-20 h-20 p-2",
	md: "w-28 h-28 p-3",
	lg: "w-40 h-40 p-4",
};

const iconSizeMap: Record<Size, number> = {
	xs: 14,
	sm: 20,
	md: 24,
	lg: 28,
};
const bounceVariants: Variants = {
	hidden: { opacity: 0, scale: 0.5 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 20,
		},
	},
};
export const SuccessIcon = ({ size = "md" }: Props) => {
	return (
		<>
			<motion.div
				variants={bounceVariants}
				initial="hidden"
				animate="visible"
				className={cn(
					"bg-primary-100 rounded-full inline-flex items-center justify-center",
					sizeMap2[size]
				)}>
				<motion.div
					className={cn(
						"rounded-full bg-primary-800 text-white flex items-center justify-center",
						"shadow-inner",
						sizeMap[size]
					)}
					animate={{
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						ease: "easeInOut",
					}}>
					<CheckIcon width={iconSizeMap[size]} height={iconSizeMap[size]} />
				</motion.div>
			</motion.div>
		</>
	);
};

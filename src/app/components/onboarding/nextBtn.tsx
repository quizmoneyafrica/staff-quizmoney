"use client";

import React, { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { ArrowRightIcon } from "@radix-ui/react-icons";

type Props = {
	percentage: number;
	onClick: () => void;
};

const size = 64;
const strokeWidth = 4;
const center = size / 2;
const radius = center - strokeWidth / 2;
const circumference = 2 * Math.PI * radius;

const NextButton: React.FC<Props> = ({ percentage, onClick }) => {
	const strokeDashoffset = useMotionValue(circumference);
	const controls = useAnimation();

	useEffect(() => {
		const progress = percentage / 100;
		const offset = circumference - progress * circumference;
		controls.start({ strokeDashoffset: offset });
	}, [percentage, controls]);

	return (
		<div className="relative w-[64px] h-[64px] self-center flex items-center justify-center">
			<svg width={size} height={size}>
				<g transform={`rotate(-90 ${center} ${center})`}>
					<circle
						cx={center}
						cy={center}
						r={radius}
						stroke="#E0E7FF00"
						strokeWidth={strokeWidth}
						fill="none"
					/>
					<motion.circle
						cx={center}
						cy={center}
						r={radius}
						stroke="#3a93db"
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={circumference}
						style={{ strokeDashoffset }}
						animate={controls}
                        strokeLinecap="round"
					/>
				</g>
			</svg>

			<button
				onClick={onClick}
				className="absolute bg-primary-500 transition text-white p-3 rounded-full shadow-md">
				<ArrowRightIcon />
			</button>
		</div>
	);
};

export default NextButton;

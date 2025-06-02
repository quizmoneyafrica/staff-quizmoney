"use client";
import { Flex } from "@radix-ui/themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import NextButton from "./nextBtn";
import { motion } from "framer-motion";
import { isMobileOrTablet } from "@/app/utils/utils";
import Link from "next/link";

function Onboarding() {
	const router = useRouter();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [swiperInstance, setSwiperInstance] = useState<any>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const slides = [
		{
			image: "/assets/images/onboarding1.png",
			title: "Entertaining Experience",
			description:
				"Quiz money offers a fun and engaging trivia game experience that keeps people entertained and challenged",
		},
		{
			image: "/assets/images/onboarding2.png",
			title: "Test Your Knowledge",
			description:
				"Quiz money offers a wide variety of trivia topics, allowing players to expand their knowledge and learn new facts while having fun",
		},
		{
			image: "/assets/images/onboarding3.png",
			title: "Earn Reward For Making the Leaderboard",
			description:
				"Players can win significant prizes like money by correctly answering trivia questions, enhancing the excitement of competition and rewards",
		},
	];

	const handleSlideBtn = () => {
		if (!swiperInstance) return;

		const isLastSlide = currentIndex === slides.length - 1;

		if (isLastSlide && isMobileOrTablet()) {
			router.replace("/login");
		} else {
			swiperInstance.slideNext();
		}
	};
	return (
		<>
			<div className="bg-primary-50 h-screen lg:h-full w-full p-4 lg:px-10 grid grid-cols-1 ">
				<div>
					<Flex align="center" justify="between">
						<Link href="/">
							<Image
								src="/icons/quizmoney-logo-blue.svg"
								alt="Quiz Money"
								width={100}
								height={55}
								priority
							/>
						</Link>
						{currentIndex === slides.length - 1 ? null : (
							<button
								onClick={() => router.replace("/login")}
								className="lg:hidden text-primary-500 underline">
								Skip
							</button>
						)}
					</Flex>
				</div>
				<div>
					<Swiper
						modules={[A11y, Autoplay]}
						spaceBetween={10}
						slidesPerView={1}
						autoplay={
							!isMobileOrTablet()
								? {
										delay: 3000,
										disableOnInteraction: false,
								  }
								: false
						}
						loop={false}
						onSwiper={(swiper) => setSwiperInstance(swiper)}
						onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
						className="flex-1">
						{slides.map((slide, index) => (
							<SwiperSlide key={index}>
								<div className="flex-col items-center justify-between text-center px-4 pt-4">
									<div className="flex items-center justify-center">
										<Image
											src={slide.image}
											alt={slide.title}
											width={300}
											height={300}
											className="mb-6"
										/>
									</div>
									<h2 className="text-xl font-heading font-semibold mb-2">
										{slide.title}
									</h2>
									<p className="font-text text-gray-600 md:max-w-[60%] mx-auto">
										{slide.description}
									</p>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
				<div className="mt-6 flex flex-col items-center gap-10 pb-10 justify-center ">
					<div className="flex gap-2">
						{slides.map((_, index) => {
							const isActive = index === currentIndex;
							return (
								<motion.span
									key={index}
									layout
									transition={{ type: "spring", stiffness: 100, damping: 5 }}
									className={`h-2 rounded-full ${
										isActive ? "bg-primary-500" : "bg-white"
									}`}
									animate={{
										width: isActive ? 16 : 8,
										opacity: isActive ? 1 : 0.5,
									}}
								/>
							);
						})}
					</div>
					<NextButton
						percentage={((currentIndex + 1) / slides.length) * 100}
						onClick={handleSlideBtn}
					/>
				</div>
			</div>
		</>
	);
}

export default Onboarding;

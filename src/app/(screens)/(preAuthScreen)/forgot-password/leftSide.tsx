import { Flex } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function LeftSide() {
	return (
		<>
			<div className="hidden lg:inline-block">
				<div className="bg-primary-50 h-screen lg:h-full w-full p-4 lg:px-10 grid grid-cols-1 ">
					<Link href="/">
						<Flex align="center" justify="between">
							<Image
								src="/icons/quizmoney-logo-blue.svg"
								alt="Quiz Money"
								width={100}
								height={55}
								priority
							/>
						</Flex>
					</Link>

					<div>
						<div className="flex-col items-center justify-between text-center px-4 pt-4">
							<div className="flex items-center justify-center">
								<Image
									src="/assets/images/reset-password.png"
									alt="Quiz Money Verify Email"
									width={300}
									height={300}
									className="mb-6"
								/>
							</div>
							<h2 className="text-xl font-heading font-semibold mb-2">
								Reset Your Password
							</h2>
							<p className="font-text text-gray-600 md:max-w-[70%] mx-auto">
								Don&apos;t worry you can reset your password with ease
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default LeftSide;

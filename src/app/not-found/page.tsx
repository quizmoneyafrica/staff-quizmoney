import Link from "next/link";
import Image from "next/image";
import CustomButton from "../utils/CustomBtn";

export default function NotFound() {
  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      <Image
        src="/icons/quizmoney-logo-blue.svg"
        alt="Quiz Money"
        width={86}
        height={47.38}
        priority
        quality={100}
        className="absolute top-6 left-10"
      />
      <div className="w-full max-w-xl mx-auto text-center grid gap-3">
        <div className="flex items-center justify-center">
          <Image
            src="/assets/images/not-found.png"
            alt="404"
            width={480}
            height={443}
            priority
            quality={100}
          />
        </div>
        <h2 className="font-bold text-3xl">Oops!</h2>
        <p className="text-sm">
          It looks like the page you are trying to reach does not exist.
        </p>
        <div className="pt-4">
          <Link href="/" className="w-full flex items-center justify-center">
            <CustomButton width="medium">Go Back Home</CustomButton>
          </Link>
        </div>
      </div>
      {/* <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link> */}
    </div>
  );
}

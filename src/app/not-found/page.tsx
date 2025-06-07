import Link from 'next/link';
import Image from 'next/image';
import CustomButton from '../utils/CustomBtn';

export default function NotFound() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      <Image
        src="/icons/quizmoney-logo-blue.svg"
        alt="Quiz Money"
        width={86}
        height={47.38}
        priority
        quality={100}
        className="absolute left-10 top-6"
      />
      <div className="mx-auto grid w-full max-w-xl gap-3 text-center">
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
        <h2 className="text-3xl font-bold">Oops!</h2>
        <p className="text-sm">
          It looks like the page you are trying to reach does not exist.
        </p>
        <div className="pt-4">
          <Link href="/" className="flex w-full items-center justify-center">
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

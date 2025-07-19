import React from 'react';
import { Trash2 } from 'lucide-react';
import { BankIcon } from '@/app/icons/icons';

interface BankAccountProps {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  onDelete?: () => void;
}

const BankAccountCard: React.FC<BankAccountProps> = ({
  accountHolder,
  accountNumber,
  bankName,
  onDelete,
}) => {
  const handleDelete = () => {};

  return (
    <div className="xs:mx-4 xs:h-[95px] relative mx-3 h-[90px] w-auto rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md sm:mx-6 sm:h-[100px] sm:rounded-[10px] sm:shadow-[0px_4px_4px_0px_#0000000D] md:mx-6 md:h-[110px] lg:mx-8 lg:h-[120px] xl:mx-8">
      <div className="xs:left-4 xs:top-4 xs:h-8 xs:w-8 absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#2364AA] transition-all duration-300 ease-in-out sm:left-4 sm:top-4 sm:h-8 sm:w-8 md:left-5 md:top-5 md:h-9 md:w-9 lg:left-6 lg:top-6 lg:h-10 lg:w-10 xl:h-11 xl:w-11">
        <BankIcon className="xs:h-5 xs:w-5 h-4 w-4 text-white transition-all duration-300 ease-in-out sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
      </div>

      <div className="xs:left-14 xs:right-12 xs:top-3 lg:left-18 xl:right-18 absolute left-12 right-10 top-2 transition-all duration-300 ease-in-out sm:left-14 sm:right-12 sm:top-3 md:left-16 md:right-14 md:top-4 lg:right-16 lg:top-5 xl:left-20">
        <p
          className="xs:text-sm xs:leading-6 block truncate text-xs font-bold leading-5 text-[#17478B] transition-all duration-300 ease-in-out sm:text-sm sm:leading-6 md:text-base md:leading-7 lg:text-lg lg:leading-8  xl:leading-9"
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 700,
            letterSpacing: '0%',
          }}
        >
          {accountHolder}
        </p>
        <p
          className="xs:text-sm xs:leading-6 block truncate text-xs font-bold leading-5 text-[#17478B] transition-all duration-300 ease-in-out sm:text-sm sm:leading-6 md:text-base md:leading-7 lg:text-lg lg:leading-8  xl:leading-9"
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 700,
            letterSpacing: '0%',
          }}
        >
          {accountNumber}
        </p>
        <span
          className="xs:text-xs xs:leading-4 block truncate text-xs leading-3 text-[#000000CC] transition-all duration-300 ease-in-out sm:text-sm sm:leading-4 md:text-sm md:leading-5 lg:text-base lg:leading-5 xl:text-lg xl:leading-6"
          style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 400,
            letterSpacing: '0%',
          }}
        >
          {bankName}
        </span>
      </div>

      {/* <button
        onClick={onDelete || handleDelete}
        className="xs:right-4 xs:top-7 xs:h-6 xs:w-6 absolute right-3 top-6 h-5 w-5 rounded-md p-1 text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:right-4 sm:top-8 sm:h-6 sm:w-6 md:right-5 md:top-9 md:h-7 md:w-7 lg:right-6 lg:top-10 lg:h-8 lg:w-8 xl:h-9 xl:w-9"
        aria-label="Delete bank account"
      >
        <Trash2 className="xs:h-4 xs:w-4 h-3 w-3 transition-all duration-300 ease-in-out sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
      </button> */}
    </div>
  );
};

const BankSection = ({ bankDetails }) => {
  const handleDelete = () => {};

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      <div
        className="xs:min-h-[220px] xs:rounded-2xl h-auto min-h-[200px] w-full rounded-xl bg-white transition-all duration-300 ease-in-out sm:min-h-[250px] sm:rounded-2xl md:min-h-[280px] md:rounded-2xl lg:min-h-[320px] lg:rounded-2xl xl:min-h-[360px] xl:rounded-2xl"
        style={{ opacity: 1 }}
      >
        <h1 className="xs:px-5 xs:pt-5 xs:text-xl px-4 pt-4 text-lg font-bold text-black transition-all duration-300 ease-in-out sm:px-6 sm:pt-6 sm:text-xl md:px-6 md:pt-6 md:text-2xl lg:px-8 lg:pt-8 lg:text-3xl xl:px-8 xl:pt-8 xl:text-3xl">
          Bank
        </h1>

        <div className="xs:mt-5 xs:pb-5 mt-4 space-y-3 pb-4 transition-all duration-300 ease-in-out sm:mt-6 sm:pb-6 md:mt-6 md:pb-6 lg:mt-8 lg:pb-8 xl:mt-8 xl:pb-8">
          {bankDetails?.length === 0 && (
            <div className="m-4 rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No bank account found.</p>
            </div>
          )}

          {bankDetails?.length > 0 &&
            bankDetails?.map((account, index) => (
              <BankAccountCard
                key={index}
                accountHolder={account?.accountName}
                accountNumber={account?.accountNumber}
                bankName={account?.bankName}
                onDelete={handleDelete}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default BankSection;

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface DocumentCardProps {
  title: string;
  uploadDate: string;
  isVerified: boolean;
  verificationText: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  uploadDate,
  isVerified,
  verificationText,
}) => {
  return (
    <div className="xs:h-[68px] xs:rounded-lg relative h-16 w-full rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md sm:h-[72px] sm:rounded-[10px] sm:shadow-[0px_4px_4px_0px_#0000000D] md:h-[76px] lg:h-20 xl:h-[84px]">
      <div className="xs:left-4 xs:right-[130px] xs:top-2 absolute left-3 right-[120px] top-2 transition-all duration-300 ease-in-out sm:left-4 sm:right-[140px] sm:top-3 md:left-5 md:right-[150px] md:top-3 lg:left-6 lg:right-[160px] lg:top-4 xl:left-6 xl:right-[170px] xl:top-4">
        <h3
          className="xs:text-xs xs:leading-6 truncate text-xs font-bold leading-5 text-[#17478B] transition-all duration-300 ease-in-out sm:text-sm sm:leading-6 md:text-sm md:leading-7 lg:text-base lg:leading-7 xl:text-lg xl:leading-8"
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 700,
            letterSpacing: '0%',
          }}
          title={title}
        >
          {title}
        </h3>
      </div>

      <div className="xs:left-4 xs:right-[130px] xs:top-8 absolute left-3 right-[120px] top-7 transition-all duration-300 ease-in-out sm:left-4 sm:right-[140px] sm:top-8 md:left-5 md:right-[150px] md:top-9 lg:left-6 lg:right-[160px] lg:top-10 xl:left-6 xl:right-[170px] xl:top-11">
        <span
          className="xs:text-xs xs:leading-4 block truncate text-xs leading-3 text-[#000000CC] transition-all duration-300 ease-in-out sm:text-xs sm:leading-4 md:text-sm md:leading-4 lg:text-sm lg:leading-5 xl:text-base xl:leading-5"
          style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 400,
            letterSpacing: '0%',
          }}
        >
          Uploaded on {uploadDate}
        </span>
      </div>

      <div className="xs:right-4 xs:top-4 xs:space-x-1 absolute right-3 top-4 flex items-center space-x-1 transition-all duration-300 ease-in-out sm:right-4 sm:top-5 sm:space-x-2 md:right-5 md:top-5 md:space-x-2 lg:right-6 lg:top-6 lg:space-x-2 xl:right-6 xl:top-6 xl:space-x-3">
        <span
          className={`xs:text-xs text-xs font-medium transition-all duration-300 ease-in-out sm:text-xs md:text-sm lg:text-sm xl:text-base ${
            isVerified ? 'text-green-600' : 'text-red-600'
          }`}
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 500,
            letterSpacing: '0%',
          }}
        >
          {verificationText}
        </span>
        {isVerified ? (
          <CheckCircle className="xs:h-4 xs:w-4 h-4 w-4 flex-shrink-0 text-green-600 transition-all duration-300 ease-in-out sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
        ) : (
          <XCircle className="xs:h-4 xs:w-4 h-4 w-4 flex-shrink-0 text-red-600 transition-all duration-300 ease-in-out sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
        )}
      </div>
    </div>
  );
};

const KYCDocumentSection: React.FC = () => {
  const documents = [
    {
      title: 'Valid ID Card',
      uploadDate: '27/6/2025',
      isVerified: false,
      verificationText: 'Not yet Verified',
    },
    {
      title: 'Bank Verification Number (BVN)',
      uploadDate: '27/6/2025',
      isVerified: true,
      verificationText: 'Verified',
    },
  ];

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      <div
        className="xs:min-h-[200px] xs:rounded-2xl xs:p-4 h-auto min-h-[180px] w-full rounded-xl bg-white p-3 transition-all duration-300 ease-in-out sm:min-h-[220px] sm:rounded-2xl sm:p-5 md:min-h-[240px] md:rounded-2xl md:p-6 lg:min-h-[260px] lg:rounded-2xl lg:p-6 xl:min-h-[280px] xl:rounded-2xl xl:p-8"
        style={{ opacity: 1 }}
      >
        <h1 className="xs:mb-4 xs:text-xl mb-3 text-lg font-bold text-black transition-all duration-300 ease-in-out sm:mb-4 sm:text-xl md:mb-5 md:text-2xl lg:mb-6 lg:text-3xl xl:mb-6 xl:text-3xl">
          KYC Document
        </h1>

        <div className="xs:space-y-3 space-y-2 transition-all duration-300 ease-in-out sm:space-y-3 md:space-y-4 lg:space-y-4 xl:space-y-5">
          {documents.map((doc, index) => (
            <DocumentCard
              key={index}
              title={doc.title}
              uploadDate={doc.uploadDate}
              isVerified={doc.isVerified}
              verificationText={doc.verificationText}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentSection;

import * as React from "react";

interface IDashboardCardsProps {
  title: string;
  children: React.ReactNode;
  bgColor: string;
  icon: React.ReactNode;
  bgImage: React.ReactNode;
}

const DashboardCards: React.FunctionComponent<IDashboardCardsProps> = (
  props
) => {
  const { title, children, bgColor, icon, bgImage } = props;
  return (
    <div
      className={`relative flex items-center w-full h-[120px] lg:h-[169px] rounded-lg p-4 ${
        bgColor === "blue"
          ? "bg-primary-50"
          : bgColor === "green"
          ? "bg-positive-50"
          : bgColor === "cyan"
          ? "bg-secondary-50"
          : null
      }`}
    >
      <div className="absolute bottom-0 z-[1] right-2">
        {bgImage}
        {/* <Image src={bgImage} alt="Admin" width={100} height={80} priority /> */}
      </div>
      <div className="relative z-[2] flex gap-2">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-lg ${
            bgColor === "blue"
              ? "bg-primary-100 text-primary-900"
              : bgColor === "green"
              ? "bg-positive-100 text-positive-900"
              : bgColor === "cyan"
              ? "bg-secondary-200 text-secondary-900"
              : null
          }`}
        >
          {icon}
        </div>
        <div>
          <p
            className={`text-base font-normal font-heading ${
              bgColor === "blue"
                ? "text-primary-900"
                : bgColor === "green"
                ? "text-positive-900"
                : bgColor === "cyan"
                ? "text-secondary-900"
                : null
            }`}
          >
            {title}
          </p>
          <div
            className={`flex items-center gap-4 font-bold font-body text-2xl ${
              bgColor === "blue"
                ? "text-primary-900"
                : bgColor === "green"
                ? "text-positive-900"
                : bgColor === "cyan"
                ? "text-secondary-900"
                : null
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;

export const DashboardCardsLoading: React.FunctionComponent = () => {
  return (
    <div
      className={`w-full h-[120px] lg:h-[169px] bg-neutral-300 rounded-lg p-4 animate-pulse`}
    ></div>
  );
};

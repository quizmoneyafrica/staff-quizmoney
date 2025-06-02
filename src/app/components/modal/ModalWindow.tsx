import { Spinner } from "@radix-ui/themes";
import Backdrop from "./Backdrop";
import { XIcon } from "lucide-react";

type Props = {
  handleClose: (open: boolean) => void;
  open: boolean;
  showCloseIcon?: boolean;
  heightClass?: string;
  widthClass?: string;
  title?: string;
  children: React.ReactNode;
  redTitle?: boolean;
  //Button types
  showBtns?: boolean;
  showActionBtn?: boolean;
  actionBtnText?: string;
  actionOnClick?: () => void;
  actionLoader?: boolean;
};
const Modal = ({
  handleClose,
  open,
  showCloseIcon = true,
  heightClass = "h-auto",
  widthClass = "w-[100%]",
  title,
  children,
  redTitle = false,
  //Button params
  showBtns = true,
  showActionBtn = true,
  actionBtnText = "Action",
  actionOnClick,
  actionLoader = false,
}: Props) => {
  return (
    <Backdrop
      open={open}
      onClick={() => {
        handleClose(false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-xl shadow p-6 transition-all  max-w-xl ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } ${heightClass} ${widthClass}`}
      >
        {showCloseIcon && (
          <button
            onClick={() => handleClose(!open)}
            disabled={actionLoader}
            className="absolute cursor-pointer top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <XIcon />
          </button>
        )}
        {title && (
          <h3
            className={`${
              redTitle ? "text-error-900" : "text-neutral-900"
            } font-bold text-lg`}
          >
            {title}
          </h3>
        )}
        <div className="flex flex-col justify-between h-full gap-14 mt-2">
          <div className="text-neutral-900 text-sm">{children}</div>
          {showBtns && (
            <div className="flex gap-2 items-center justify-end">
              <button
                onClick={() => handleClose(!open)}
                disabled={actionLoader}
                className="bg-gray-300 disabled:cursor-not-allowed border text-neutral-900s border-gray-300 cursor-pointer px-4 py-2 rounded-[8px]"
              >
                Cancel
              </button>
              {showActionBtn && (
                <button
                  onClick={actionOnClick}
                  className={`ml-2 capitalize disabled:cursor-not-allowed cursor-pointer border border-error-900 bg-error-900 text-neutral-50  rounded-[8px] ${
                    actionLoader ? "px-8 py-[12px]" : "px-4 py-2"
                  }`}
                  disabled={actionLoader}
                >
                  {!actionLoader ? actionBtnText : <Spinner />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Backdrop>
  );
};

export default Modal;

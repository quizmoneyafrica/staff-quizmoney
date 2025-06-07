import { Spinner } from '@radix-ui/themes';
import Backdrop from './Backdrop';
import { XIcon } from 'lucide-react';

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
  heightClass = 'h-auto',
  widthClass = 'w-[100%]',
  title,
  children,
  redTitle = false,
  //Button params
  showBtns = true,
  showActionBtn = true,
  actionBtnText = 'Action',
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
        className={`relative max-w-xl rounded-xl bg-white p-6 shadow  transition-all ${
          open ? 'scale-100 opacity-100' : 'scale-125 opacity-0'
        } ${heightClass} ${widthClass}`}
      >
        {showCloseIcon && (
          <button
            onClick={() => handleClose(!open)}
            disabled={actionLoader}
            className="absolute right-6 top-6 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <XIcon />
          </button>
        )}
        {title && (
          <h3
            className={`${
              redTitle ? 'text-error-900' : 'text-neutral-900'
            } text-lg font-bold`}
          >
            {title}
          </h3>
        )}
        <div className="mt-2 flex h-full flex-col justify-between gap-14">
          <div className="text-sm text-neutral-900">{children}</div>
          {showBtns && (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleClose(!open)}
                disabled={actionLoader}
                className="text-neutral-900s cursor-pointer rounded-[8px] border border-gray-300 bg-gray-300 px-4 py-2 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {showActionBtn && (
                <button
                  onClick={actionOnClick}
                  className={`border-error-900 bg-error-900 ml-2 cursor-pointer rounded-[8px] border capitalize text-neutral-50  disabled:cursor-not-allowed ${
                    actionLoader ? 'px-8 py-[12px]' : 'px-4 py-2'
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

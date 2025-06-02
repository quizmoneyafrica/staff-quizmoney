import React, { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  onClick: () => void;
  open: boolean;
};

const Backdrop = ({ children, onClick, open }: Props) => {
  return (
    <motion.div
      onClick={onClick}
      // className="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999999] px-4 flex justify-center items-center transition-colors 
     ${open ? "visible bg-black/50" : "invisible"}   `}
    >
      {children}
    </motion.div>
  );
};
export default Backdrop;

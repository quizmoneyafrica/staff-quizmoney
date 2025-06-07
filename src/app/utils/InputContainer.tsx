import React, { ReactNode } from 'react';

interface IInputContainerProps {
  children: ReactNode;
}

const InputContainer: React.FunctionComponent<IInputContainerProps> = ({
  children,
}) => {
  return <div className="space-y-2">{children}</div>;
};

export default InputContainer;

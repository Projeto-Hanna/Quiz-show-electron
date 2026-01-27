import type { ReactElement } from 'react';
import './style.css';

type Props = {
  children: string | ReactElement;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: Props) => {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
};

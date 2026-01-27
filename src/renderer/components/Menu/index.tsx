import './style.css';
import type { ReactElement } from 'react';

type Props = {
  children: ReactElement | ReactElement[];
};

export const Menu = ({ children }: Props) => {
  return <div className="menu">{children}</div>;
};

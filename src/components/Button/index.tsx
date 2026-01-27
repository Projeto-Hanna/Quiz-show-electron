import './style.css';

type Props = {
  children: string;
};

export const Button = ({ children }: Props) => {
  return <button className="button">{children}</button>;
};

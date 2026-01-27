import './style.css';

type Props = {
  children: string;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: Props) => {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
};

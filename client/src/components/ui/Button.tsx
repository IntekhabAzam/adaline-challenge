import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

  const variantClasses = {
    primary: "text-white bg-indigo-600 hover:bg-indigo-700 border-transparent",
    secondary:
      "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-transparent",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

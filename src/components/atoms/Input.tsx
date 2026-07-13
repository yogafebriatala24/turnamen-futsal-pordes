import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = "",
  error = false,
  ...props
}) => {
  return (
    <input
      className={`w-full px-4 py-2.5 bg-zinc-900 border ${
        error
          ? "border-rose-500 focus:ring-rose-500/20"
          : "border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20"
      } rounded-xl text-zinc-100 placeholder-zinc-500 text-sm transition-all duration-200 outline-none focus:ring-4 ${className}`}
      {...props}
    />
  );
};

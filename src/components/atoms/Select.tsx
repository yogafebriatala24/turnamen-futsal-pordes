import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  error = false,
  options,
  placeholder,
  value,
  ...props
}) => {
  return (
    <select
      value={value}
      className={`w-full px-4 py-2.5 bg-zinc-900 border ${
        error
          ? "border-rose-500 focus:ring-rose-500/20"
          : "border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20"
      } rounded-xl text-zinc-150 text-sm transition-all duration-200 outline-none focus:ring-4 cursor-pointer ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled className="text-zinc-500">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-200">
          {opt.label}
        </option>
      ))}
    </select>
  );
};
